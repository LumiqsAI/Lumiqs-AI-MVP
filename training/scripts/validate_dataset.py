"""Validate Lumiqs SFT JSONL before a remote training run."""

import argparse
import json
from pathlib import Path

REQUIRED_ROLES = ["system", "user", "assistant"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    args = parser.parse_args()

    path = Path(args.input)
    if not path.exists():
        raise FileNotFoundError(path)

    count = 0
    questions: set[str] = set()
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        record = json.loads(line)
        messages = record.get("messages")
        if not isinstance(messages, list) or [m.get("role") for m in messages] != REQUIRED_ROLES:
            raise ValueError(f"{path}:{line_number}: expected system/user/assistant messages")
        if any(not isinstance(m.get("content"), str) or not m["content"].strip() for m in messages):
            raise ValueError(f"{path}:{line_number}: all message content must be non-empty strings")
        question = messages[1]["content"].strip().lower()
        if question in questions:
            raise ValueError(f"{path}:{line_number}: duplicate user question")
        questions.add(question)
        count += 1

    if count < 100:
        raise ValueError(f"Only {count} examples found; review the source mapping before training")
    print(f"Validated {count} unique Lumiqs training examples")


if __name__ == "__main__":
    main()
