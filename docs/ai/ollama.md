---
title: Ollama
prev:
    link: '/ai/deployment'
    text: 'LLM Deployment'
next:
    link: '/ai/vllm'
    text: 'vLLM'
---

# Ollama

Local LLM deployment made easy.

## Installation

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download/windows
```

## Basic Usage

```bash
# Start Ollama server
ollama serve

# Pull a model
ollama pull llama2
ollama pull mistral
ollama pull codellama

# List available models
ollama list

# Run a model
ollama run llama2
```

## Python API

```bash
pip install ollama
```

```python
import ollama

# Generate completion
response = ollama.generate(
    model='llama2',
    prompt='What is Python?',
    options={
        'temperature': 0.7,
        'top_p': 0.9,
        'max_tokens': 500,
    }
)
print(response['response'])

# Chat
response = ollama.chat(
    model='llama2',
    messages=[
        {'role': 'user', 'content': 'Hello!'},
        {'role': 'assistant', 'content': 'Hello! How can I help?'},
        {'role': 'user', 'content': 'What is 2+2?'},
    ]
)
print(response['message']['content'])

# Streaming
for chunk in ollama.generate(
    model='llama2',
    prompt='Write a story',
    stream=True
):
    print(chunk['response'], end='', flush=True)
```

## API Server

```bash
# Start API server
ollama serve

# Or use python library as server
```

```python
from ollama import App

app = App()

@app.chat()
def chat(request):
    return request.messages

# Run as server
# python app.py
```

## Available Models

```bash
# Popular models
ollama pull llama2          # Meta's Llama 2
ollama pull llama3           # Meta's Llama 3
ollama pull mistral         # Mistral AI
ollama pull mixtral         # Mixtral 8x7B
ollama pull codellama       # Code generation
ollama pull phi             # Microsoft's Phi
ollama pull neural-chat     # Chat model
ollama pull orca-mini      # Lightweight
```

## Custom Models

```python
# Create a Modelfile
modelfile = """
FROM llama2
PARAMETER temperature 0.8
PARAMETER top_p 0.9
SYSTEM You are a helpful coding assistant.
"""

# Save to file
with open('Modelfile', 'w') as f:
    f.write(modelfile)

# Create model
import ollama
ollama.create(
    model='my-model',
    modelfile='./Modelfile'
)

# Use custom model
response = ollama.chat(
    model='my-model',
    messages=[{'role': 'user', 'content': 'Hello'}]
)
```

## GPU Configuration

```bash
# Check GPU availability
ollama list
nvidia-smi

# Set GPU layers (for better performance)
ollama run llama2 --gpu 1
```

## Embeddings

```python
# Generate embeddings
response = ollama.embeddings(
    model='nomic-embed-text',
    prompt='The quick brown fox'
)
embedding = response['embedding']
print(len(embedding))  # Typically 768 or 1536 dimensions
```

## Use with LangChain

```bash
pip install langchain-community
```

```python
from langchain_community.chat_models import ChatOllama
from langchain_core.messages import HumanMessage

llm = ChatOllama(
    model="llama2",
    temperature=0.7
)

response = llm.invoke([HumanMessage(content="Hello!")])
print(response.content)
```

## Use with LlamaIndex

```bash
pip install llama-index
```

```python
from llama_index.llms import Ollama

llm = Ollama(model="llama2", request_timeout=120)
response = llm.complete("What is Python?")
print(response.text)
```

## Best Practices

```bash
# 1. Use appropriate model size
# 7B for general, 70B for complex tasks

# 2. Adjust parameters
ollama run llama2 --temp 0.7 --top-p 0.9

# 3. For embeddings, use embedding models
ollama pull nomic-embed-text

# 4. Monitor GPU usage
nvidia-smi
```

## Docker

```bash
# Run Ollama in Docker
docker run -d --gpus all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull model
docker exec ollama ollama pull llama2
```