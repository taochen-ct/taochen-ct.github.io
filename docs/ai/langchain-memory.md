---
title: LangChain Memory
prev:
    link: '/ai/langchain'
    text: 'LangChain'
next:
    link: '/ai/langchain-agent'
    text: 'LangChain Agent'
---

# LangChain Memory

Memory 让 LLM 具备多轮对话的记忆能力，是对话系统的核心组件。

## Memory 类型对比

| 类型 | 原理 | Token 消耗 | 适合场景 |
|------|------|-----------|---------|
| **ConversationBufferMemory** | 全量存储所有历史 | 高 | 短对话（< 10 轮） |
| **ConversationBufferWindowMemory** | 只保留最近 N 轮 | 可控 | 日常聊天 |
| **ConversationSummaryMemory** | 用 LLM 压缩成摘要 | 中等 | 长对话 |
| **ConversationSummaryBufferMemory** | 摘要 + 最近 N 轮组合 | 中等 | 复杂长对话 |
| **VectorStoreRetrieverMemory** | 向量化存储，语义检索 | 低 | 跨会话持久记忆 |

## 快速开始

### 1. ConversationBufferMemory（全量缓冲）

最基础的 Memory，保存所有对话历史。

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o", temperature=0)

memory = ConversationBufferMemory(
    return_messages=True,      # 返回 Message 对象
    memory_key="history"       # prompt 中的变量名
)

chain = ConversationChain(llm=llm, memory=memory, verbose=True)

# 多轮对话
chain.invoke({"input": "我叫小明，喜欢打篮球"})
chain.invoke({"input": "我刚才说了什么爱好？"})  # 能记住
```

### 2. ConversationBufferWindowMemory（滑动窗口）

只保留最近 N 轮对话，控制上下文长度。

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(
    k=3,                    # 保留最近 3 轮
    return_messages=True
)

chain = ConversationChain(llm=llm, memory=memory)
```

### 3. ConversationSummaryMemory（摘要压缩）

用 LLM 将历史对话压缩成摘要，适合长对话。

```python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(
    llm=llm,                # 需要 LLM 来做摘要
    return_messages=True
)

chain = ConversationChain(llm=llm, memory=memory)
```

**工作原理：**
- 每次新对话加入后，Memory 会调用 LLM 对历史进行摘要
- 摘要会不断累积更新
- 代价：每次对话多一次 LLM 调用

### 4. ConversationSummaryBufferMemory（混合模式）

结合摘要和窗口：超过 token 阈值的部分做摘要，最近的保留原文。

```python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=1000,   # 超过 1000 token 的部分做摘要
    return_messages=True
)
```

### 5. VectorStoreRetrieverMemory（向量检索）

将对话向量化存储，按语义相关性检索，而非时间顺序。

```python
from langchain.memory import VectorStoreRetrieverMemory
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

# 创建向量存储
vectorstore = Chroma(embedding_function=OpenAIEmbeddings())
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

memory = VectorStoreRetrieverMemory(
    retriever=retriever,
    memory_key="history"
)

# 保存对话（自动向量化）
memory.save_context(
    {"input": "Python 的装饰器是什么？"},
    {"output": "装饰器是一个函数..."}
)
memory.save_context(
    {"input": "Django 怎么部署？"},
    {"output": "使用 gunicorn + nginx..."}
)

# 语义检索：问 Python web 相关，会召回 Django 部署那段
vars = memory.load_memory_variables({"input": "Python web 部署"})
```

**适用场景：** 用户偏好记忆、跨会话知识、FAQ 系统。

## 结合 LCEL 使用（推荐方式）

LangChain 官方推荐使用 LCEL 手动组装 Memory，而非 `ConversationChain`：

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory

llm = ChatOpenAI(model="gpt-4o")
memory = ConversationBufferMemory(return_messages=True, memory_key="chat_history")

# 提示词中预留历史消息位置
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个助手"),
    MessagesPlaceholder(variable_name="chat_history"),  # 注入历史
    ("human", "{input}"),
])

# 手动组装链
def load_history(_):
    return memory.load_memory_variables({})["chat_history"]

chain = (
    RunnablePassthrough.assign(chat_history=load_history)
    | prompt
    | llm
)

# 使用
response = chain.invoke({"input": "你好"})

# 手动保存到 Memory
memory.save_context(
    {"input": "你好"},
    {"output": str(response.content)}
)
```

## Memory 持久化

默认 Memory 存在内存中，程序重启后丢失。需要持久化到文件系统或数据库。

### 文件持久化

```python
import json
from langchain.memory import ConversationBufferMemory

MEMORY_FILE = "memory.json"

def save_memory(memory):
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory.chat_memory.messages, f, default=str)

def load_memory():
    memory = ConversationBufferMemory(return_messages=True)
    try:
        with open(MEMORY_FILE, "r") as f:
            # 从 JSON 恢复 Message 对象
            pass
    except FileNotFoundError:
        pass
    return memory
```

### Redis 持久化

```python
from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import RedisChatMessageHistory

message_history = RedisChatMessageHistory(
    session_id="user_123",
    url="redis://localhost:6379/0"
)

memory = ConversationBufferMemory(
    chat_memory=message_history,
    return_messages=True
)
```

### 数据库持久化（SQLite）

```python
from langchain.memory.chat_message_histories import SQLChatMessageHistory

message_history = SQLChatMessageHistory(
    session_id="user_123",
    connection="sqlite:///memory.db"
)

memory = ConversationBufferMemory(
    chat_memory=message_history,
    return_messages=True
)
```

## 选型决策

```
对话轮数少（< 10）？
├─ YES → ConversationBufferMemory
│
└─ NO → 需要记住很久以前的内容？
         ├─ YES → VectorStoreRetrieverMemory（语义检索）
         │
         └─ NO → 控制 Token 成本？
                  ├─ YES → BufferWindowMemory(k=5)
                  │
                  └─ NO → 对话非常长？
                           ├─ YES → SummaryBufferMemory
                           │
                           └─ NO → SummaryMemory
```

## 最佳实践

1. **控制上下文长度** — 全量缓冲容易超出模型上下文窗口，优先使用 Window 或 Summary 模式
2. **Memory 按用户隔离** — 使用 `session_id` 区分不同用户的对话历史
3. **VectorStore 适合长期记忆** — 用户偏好、历史知识等不常变化但需要回忆的信息
4. **LCEL 优于 ConversationChain** — 官方推荐用 Runnable 手动组装，灵活性更高
5. **注意保存时机** — 每次对话后调用 `memory.save_context()`，或在 LCEL 中自动处理
