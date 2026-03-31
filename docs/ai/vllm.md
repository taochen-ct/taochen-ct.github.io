---
title: vLLM
prev:
    link: '/ai/ollama'
    text: 'Ollama'
next: false
---

# vLLM

High-performance LLM serving engine.

## Installation

```bash
# With pip
pip install vllm

# With Docker
docker pull vllm/vllm:latest
```

## Basic Usage

```bash
# Start server
vllm serve meta-llama/Llama-2-7b-hf \
    --dtype half \
    --tensor-parallel-size 2

# Or with OpenAI-compatible API
vllm serve meta-llama/Llama-2-7b-hf \
    --api-key token123 \
    --port 8000
```

## Python API

```python
from vllm import LLM, SamplingParams

# Initialize
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    dtype="half",  # float16
    tensor_parallel_size=1,  # Number of GPUs
    gpu_memory_utilization=0.9,
)

# Generate
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=500,
)

outputs = llm.generate(
    prompts=["What is Python?"],
    sampling_params=sampling_params
)

for output in outputs:
    print(output.outputs[0].text)
```

## Batch Inference

```python
# Multiple prompts
prompts = [
    "What is machine learning?",
    "Explain neural networks.",
    "What is deep learning?",
]

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.outputs[0].text)
```

## Streaming

```python
# Streaming output
outputs = llm.generate(
    prompts=["Write a story"],
    sampling_params=SamplingParams(
        temperature=0.7,
        max_tokens=1000,
        stream=True
    )
)

for output in outputs:
    for token in output.outputs[0].text:
        print(token, end="", flush=True)
```

## OpenAI-Compatible API

```bash
# Start server with OpenAI format
vllm serve meta-llama/Llama-2-7b-hf \
    --api-key token123 \
    --port 8000
```

```python
import openai

client = openai.OpenAI(
    api_key="token123",
    base_url="http://localhost:8000/v1"
)

# Chat completion
response = client.chat.completions.create(
    model="meta-llama/Llama-2-7b-hf",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)

# Streaming
stream = client.chat.completions.create(
    model="meta-llama/Llama-2-7b-hf",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")
```

## Serving with Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-deployment
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: vllm
        image: vllm/vllm:latest
        resources:
          limits:
            nvidia.com/gpu: 1
            nvidia.com/memory: 60Gi
        command: ["vllm", "serve", "meta-llama/Llama-2-7b-hf"]
        ports:
        - containerPort: 8000
```

## Performance Tips

```python
# 1. Use quantization
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    quantization="awq",  # or "gptq"
)

# 2. Optimize tensor parallelism
llm = LLM(
    model="meta-llama/Llama-2-70b-hf",
    tensor_parallel_size=4,
)

# 3. Adjust GPU memory
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    gpu_memory_utilization=0.95,
    max_num_batched_tokens=8192,
)

# 4. Enable CUDA graphs
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    enforce_eager=False,  # Enable CUDA graphs
)
```

## Supported Models

```bash
# Popular models
# LLaMA, Mistral, Qwen, Yi, Mixtral, etc.
vllm serve meta-llama/Llama-2-7b-hf
vllm serve mistralai/Mistral-7B-v0.1
vllm serve Qwen/Qwen2-7B
vllm serve 01-ai/Yi-6B
```

## Environment Variables

```bash
# GPU
export CUDA_VISIBLE_DEVICES=0,1,2,3

# Tensor parallelism
export VLLM_TENSOR_PARALLEL_SIZE=4

# Logging
export VLLM_LOGGING_LEVEL=INFO
```

## Integration with LangChain

```bash
pip install langchain-vllm
```

```python
from langchain_vllm import VLLM

llm = VLLM(
    model="meta-llama/Llama-2-7b-hf",
    tensor_parallel_size=1,
    top_p=0.95,
    temperature=0.7,
)

response = llm.invoke("What is Python?")
print(response)
```

## Key Features

| Feature | Description |
|---------|-------------|
| PagedAttention | Memory-efficient attention |
| Continuous batching | Higher throughput |
| Async API | Non-blocking requests |
| OpenAI compatible | Easy migration |
| Multi-GPU | Scale up |