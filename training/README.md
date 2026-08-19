# Lumiqs remote model training

This pipeline runs on a GPU server, not on the Render API service and not on a developer laptop.

It downloads `rainwagon14/CEO-Reasoning-Trace` directly on the training machine, removes sensitive data, converts records into Lumiqs instruction examples, and fine-tunes an existing instruct model with LoRA/QLoRA.

## Important data policy

The source dataset may contain reasoning traces. Do not train or expose hidden chain-of-thought. The preparation script keeps concise decision guidance and removes reasoning sections when they are identifiable. Review the generated JSONL and the dataset license before training or redistribution.

Do not add customer conversations to this dataset without explicit consent and anonymization.

## Recommended server

Use a GPU provider such as Hugging Face Jobs, RunPod, Modal, or SageMaker. A practical first run needs a CUDA GPU with at least 16 GB VRAM for a 7B/8B model using QLoRA.

## Run on the GPU server

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r training/requirements.txt

python training/scripts/prepare_dataset.py \
  --dataset rainwagon14/CEO-Reasoning-Trace \
  --output-dir training/output

python training/scripts/validate_dataset.py \
  --input training/output/lumiqs-sft.jsonl

python training/scripts/train_lora.py \
  --dataset training/output/lumiqs-sft.jsonl \
  --base-model Qwen/Qwen2.5-7B-Instruct \
  --output-dir training/output/lumiqs-qwen
```

The scripts write all artifacts to `training/output`, which is ignored by git. Upload the adapter or merged model to a private Hugging Face repository or expose it through a vLLM/TGI OpenAI-compatible server.

## Connect the trained model to Lumiqs

Set these variables on Render after the model server is available:

```env
AI_BASE_URL=https://your-model-server.example.com/v1
AI_API_KEY=server-side-secret
AI_MODEL=lumiqs-qwen
```

Do not put the model server key in `apps/web` or any `NEXT_PUBLIC_*` variable.

## Evaluation gate

Do not replace the production model until the held-out evaluation set passes checks for business-context use, actionable recommendations, uncertainty labels, JSON validity, prompt-injection resistance, and cross-business isolation.
