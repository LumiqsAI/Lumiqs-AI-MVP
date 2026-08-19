"""Prepare a public Hugging Face dataset for Lumiqs supervised fine-tuning.

Run this on a remote training server. The script intentionally does not write
raw source rows to the output and drops likely chain-of-thought sections.
"""

import argparse
import json
import re
from pathlib import Path
from typing import Any

from datasets import load_dataset

SYSTEM = (
    "You are Lumiqs AI, a practical business decision-support consultant. "
    "Use business context, separate facts from assumptions, avoid fabricated "
    "statistics, identify risks, and end with actionable next steps."
)

SENSITIVE = re.compile(r"(?:api[_ -]?key|password|secret|token|bearer)\s*[:=]\s*\S+", re.I)
CHAIN_OF_THOUGHT = re.compile(
    r"(?:chain of thought|hidden reasoning|internal reasoning|step[- ]by[- ]step reasoning)\s*:.*",
    re.I | re.S,
)


def clean(value: Any, limit: int = 6000) -> str:
    text = str(value or "").strip()
    text = SENSITIVE.sub("[REDACTED]", text)
    text = CHAIN_OF_THOUGHT.sub("", text).strip()
    return text[:limit]


def first(row: dict[str, Any], names: list[str]) -> str:
    for name in names:
        if name in row and clean(row[name]):
            return clean(row[name])
    return ""


def to_example(row: dict[str, Any]) -> dict[str, Any] | None:
    raw_messages = row.get("messages")
    if isinstance(raw_messages, list):
        messages = [item for item in raw_messages if isinstance(item, dict)]
        user_message = next((clean(item.get("content")) for item in messages if item.get("role") == "user"), "")
        assistant_message = next((clean(item.get("content")) for item in messages if item.get("role") == "assistant"), "")
        if user_message and assistant_message:
            return {
                "messages": [
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": user_message},
                    {"role": "assistant", "content": assistant_message},
                ]
            }

    question = first(row, ["question", "prompt", "instruction", "query", "input"])
    answer = first(row, ["answer", "response", "output", "completion", "assistant"])
    context = first(row, ["context", "business_context", "scenario", "case"])

    if not question or not answer:
        return None

    user_content = question
    if context:
        user_content = f"Business context:\n{context}\n\nQuestion:\n{question}"

    return {
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": answer},
        ]
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default="rainwagon14/CEO-Reasoning-Trace")
    parser.add_argument("--config", default="default")
    parser.add_argument("--split", default="train")
    parser.add_argument("--output-dir", default="training/output")
    args = parser.parse_args()

    dataset = load_dataset(args.dataset, name=args.config, split=args.split, streaming=True)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "lumiqs-sft.jsonl"

    seen: set[str] = set()
    written = 0
    with output_path.open("w", encoding="utf-8") as output:
        for row in dataset:
            example = to_example(dict(row))
            if not example:
                continue
            fingerprint = json.dumps(example, sort_keys=True)
            if fingerprint in seen:
                continue
            seen.add(fingerprint)
            output.write(json.dumps(example, ensure_ascii=False) + "\n")
            written += 1

    print(f"Wrote {written} Lumiqs examples to {output_path}")
    if written < 100:
        raise RuntimeError("Too few usable examples. Inspect the source columns before training.")


if __name__ == "__main__":
    main()
