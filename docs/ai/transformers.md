---
title: Transformers
prev:
    link: '/ai'
    text: 'Overview'
next:
    link: '/ai/a2a'
    text: 'A2A Protocol'
---

# Transformers

The Transformer architecture revolutionized NLP and is now the foundation for modern AI.

## Core Concept

Transformers use **self-attention** to process sequences in parallel, unlike RNNs which process sequentially.

## Attention Mechanism

### Self-Attention

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q: (batch, heads, seq_len, d_k)
    K: (batch, heads, seq_len, d_k)
    V: (batch, heads, seq_len, d_v)
    """
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / torch.sqrt(d_k)

    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)

    attention_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attention_weights, V)
```

### Multi-Head Attention

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def split_heads(self, x):
        batch_size = x.size(0)
        return x.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

    def forward(self, q, k, v, mask=None):
        q = self.split_heads(self.W_q(q))
        k = self.split_heads(self.W_k(k))
        v = self.split_heads(self.W_v(v))

        attn = scaled_dot_product_attention(q, k, v, mask)
        attn = attn.transpose(1, 2).contiguous().view(-1, self.d_model)

        return self.W_o(attn)
```

## Transformer Encoder

```python
class EncoderLayer(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, num_heads)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ff = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model)
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        attn_output = self.attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))

        ff_output = self.ff(x)
        x = self.norm2(x + self.dropout(ff_output))
        return x

class Encoder(nn.Module):
    def __init__(self, num_layers, d_model, num_heads, d_ff, vocab_size, dropout=0.1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = PositionalEncoding(d_model, dropout)
        self.layers = nn.ModuleList([
            EncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])

    def forward(self, x, mask=None):
        x = self.embedding(x) * torch.sqrt(torch.tensor(x.size(-1), dtype=torch.float32))
        x = self.pos_encoding(x)
        for layer in self.layers:
            x = layer(x, mask)
        return x
```

## Positional Encoding

```python
import math

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)

    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
```

## Key Components

| Component | Purpose |
|-----------|---------|
| Input Embedding | Convert tokens to vectors |
| Positional Encoding | Add position information |
| Multi-Head Attention | Capture relationships between all positions |
| Feed Forward Network | Process features |
| Residual & LayerNorm | Stabilize training |

## Variations

- **BERT** - Encoder-only, masked language modeling
- **GPT** - Decoder-only, causal language modeling
- **T5** - Encoder-decoder, text-to-text
- **LLaMA** - Decoder-only, open weights
- **Mistral** - Grouped-query attention variant