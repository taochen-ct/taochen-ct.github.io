---
title: LangChain
prev:
    link: '/ai/agent-loop'
    text: 'Agent Loop'
next:
    link: '/ai/langchain-agent'
    text: 'LangChain Agent'
---

# LangChain

LangChain 是一个用于构建大语言模型（LLM）应用的框架，通过模块化组件和组合式编程（LCEL）简化开发流程。

## 生态架构

```
┌─────────────────────────────────────────────────────────────┐
│                    LangChain Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│  Applications                                                │
│  ├─ RAG Chatbots    ├─ Code Assistants   ├─ Data Agents     │
│  └─ Workflow Auto   └─ QA Systems       └─ Multi-Agent      │
├─────────────────────────────────────────────────────────────┤
│  LangChain / LangGraph                                       │
│  ├─ Chains (LCEL)   ├─ Agents (ReAct, Plan) ├─ Memory       │
│  ├─ Tools           ├─ Retrieval             ├─ Callbacks    │
│  └─ Graph State     └─ Streaming             └─ Checkpoints  │
├─────────────────────────────────────────────────────────────┤
│  LangChain Core (langchain-core)                             │
│  ├─ Base Models     ├─ Prompts    ├─ Output Parsers          │
│  ├─ Messages        ├─ Documents  ├─ Embeddings              │
│  └─ Runnables       └─ VectorStores                          │
├─────────────────────────────────────────────────────────────┤
│  Integrations (langchain-*)                                  │
│  ├─ OpenAI (langchain-openai)                                │
│  ├─ Anthropic (langchain-anthropic)                          │
│  ├─ AWS Bedrock (langchain-aws)                              │
│  ├─ Google (langchain-google)                                │
│  ├─ HuggingFace (langchain-huggingface)                      │
│  └─ Community (langchain-community)                          │
├─────────────────────────────────────────────────────────────┤
│  Ecosystem Tools                                             │
│  ├─ LangSmith (Observability)                                │
│  ├─ LangGraph (State Machines)                               │
│  └─ LangServe (Deployment)                                   │
└─────────────────────────────────────────────────────────────┘
```

## 包结构

| 包名 | 用途 | 安装 |
|------|------|------|
| `langchain-core` | 基础抽象：Messages, Runnables, Documents | `pip install langchain-core` |
| `langchain` | 高级组件：Chains, Agents, Memory, Retrieval | `pip install langchain` |
| `langchain-community` | 社区集成：第三方加载器、向量库 | `pip install langchain-community` |
| `langchain-openai` | OpenAI 集成 | `pip install langchain-openai` |
| `langchain-anthropic` | Anthropic 集成 | `pip install langchain-anthropic` |
| `langchain-aws` | AWS Bedrock/SageMaker | `pip install langchain-aws` |
| `langchain-huggingface` | HuggingFace 模型 | `pip install langchain-huggingface` |
| `langgraph` | 状态图与 Agent 工作流 | `pip install langgraph` |
| `langsmith` | 追踪与可观测性 | `pip install langsmith` |

## 快速参考手册

### 核心导入速查

```python
# Messages
from langchain_core.messages import (
    HumanMessage,      # 用户消息
    AIMessage,         # AI 消息
    SystemMessage,     # 系统提示
    ToolMessage,       # 工具返回
)

# Prompts
from langchain_core.prompts import (
    ChatPromptTemplate,           # 聊天提示模板
    SystemMessagePromptTemplate,  # 系统消息模板
    HumanMessagePromptTemplate,   # 用户消息模板
    FewShotPromptTemplate,        # 少样本提示
    PromptTemplate,               # 字符串模板
)

# Output Parsers
from langchain_core.output_parsers import (
    StrOutputParser,               # 字符串解析
    JsonOutputParser,              # JSON 解析
    PydanticOutputParser,          # Pydantic 模型解析
    CommaSeparatedListOutputParser,# 逗号列表解析
)

# Documents
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Runnables (LCEL)
from langchain_core.runnables import (
    RunnableLambda,       # 自定义函数包装
    RunnableParallel,     # 并行执行
    RunnablePassthrough,  # 透传/赋值
    RunnableSequence,     # 序列组合
    RunnableBranch,       # 条件分支
)

# Vector Stores
from langchain_community.vectorstores import FAISS, Chroma
from langchain_openai import OpenAIEmbeddings
```

### LLM 初始化速查

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain_aws import ChatBedrock
from langchain_huggingface import HuggingFacePipeline

# OpenAI
openai_llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
openai_embed = OpenAIEmbeddings(model="text-embedding-3-small")

# Anthropic
anthropic_llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")

# AWS Bedrock
bedrock_llm = ChatBedrock(model_id="anthropic.claude-3-sonnet-20240229-v1:0")

# 本地 HuggingFace
local_llm = HuggingFacePipeline.from_model_id(
    model_id="meta-llama/Llama-2-7b-chat-hf",
    task="text-generation"
)
```

### Chain 构建模式

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()

# 模式 1: 简单链
prompt = ChatPromptTemplate.from_template("解释 {topic}")
chain = prompt | llm | parser

# 模式 2: 并行链
from langchain_core.runnables import RunnableParallel

parallel = RunnableParallel(
    summary=(prompt | llm | parser),
    keywords=ChatPromptTemplate.from_template("列出 {topic} 的关键词") | llm | parser
)

# 模式 3: 带上下文的链
contextual = (
    RunnablePassthrough.assign(context=lambda x: retriever.invoke(x["question"]))
    | ChatPromptTemplate.from_template("""基于上下文:
{context}

回答问题: {question}""")
    | llm
    | parser
)

# 模式 4: 条件路由
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "代码" in x["topic"], code_chain),
    (lambda x: "数据" in x["topic"], data_chain),
    default_chain
)
```

### Agent 速查

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent, create_tool_calling_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")

@tool
def search(query: str) -> str:
    """搜索信息"""
    return "搜索结果..."

@tool
def calculate(expr: str) -> str:
    """计算表达式"""
    return str(eval(expr))

tools = [search, calculate]

# ReAct Agent (通用)
react_prompt = hub.pull("hwchase17/react")
react_agent = create_react_agent(llm, tools, react_prompt)
react_executor = AgentExecutor(agent=react_agent, tools=tools, verbose=True)

# Tool Calling Agent (OpenAI/Claude)
tc_prompt = hub.pull("hwchase17/openai-functions-agent")
tc_agent = create_tool_calling_agent(llm, tools, tc_prompt)
tc_executor = AgentExecutor(agent=tc_agent, tools=tools, verbose=True)

# 运行
result = tc_executor.invoke({"input": "计算 15 * 23 并搜索 Python"})
```

### RAG 速查

```python
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

# 1. 加载
loader = PyPDFLoader("doc.pdf")
docs = loader.load()

# 2. 切分
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = splitter.split_documents(docs)

# 3. 存储
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(splits, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 4. 检索生成
prompt = ChatPromptTemplate.from_template("""
基于以下上下文回答问题:
{context}

问题: {question}
""")

rag_chain = (
    {"context": retriever | (lambda docs: "\n\n".join(d.page_content for d in docs)),
     "question": RunnablePassthrough()}
    | prompt
    | ChatOpenAI(model="gpt-4o")
    | StrOutputParser()
)

response = rag_chain.invoke("文档主要内容是什么？")
```

### Memory 速查

```python
from langchain.memory import (
    ConversationBufferMemory,       # 全量缓冲
    ConversationBufferWindowMemory, # 滑动窗口
    ConversationSummaryMemory,      # 摘要压缩
    VectorStoreRetrieverMemory,     # 向量检索记忆
)

# 基础用法
memory = ConversationBufferMemory(return_messages=True, memory_key="history")
memory.save_context({"input": "你好"}, {"output": "你好！有什么可以帮忙？"})
vars = memory.load_memory_variables({})  # {'history': [HumanMessage, AIMessage]}

# 结合 Chain
from langchain.chains import ConversationChain

chat = ConversationChain(llm=llm, memory=memory, verbose=True)
```

### Callbacks & 追踪

```python
from langchain.callbacks.base import BaseCallbackHandler
from langchain.callbacks.tracers import LangChainTracer

# 自定义回调
class LogCallback(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        print(f"[LLM] 调用 {serialized.get('name', 'unknown')}")
    def on_tool_start(self, serialized, input_str, **kwargs):
        print(f"[Tool] {serialized.get('name')}: {input_str}")

# LangSmith 追踪
import os
os.environ["LANGCHAIN_API_KEY"] = "ls-..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "my-project"

chain.invoke({"topic": "AI"}, config={"callbacks": [LogCallback()]})
```

### Streaming & Async

```python
# 同步流式
for chunk in chain.stream({"topic": "AI"}):
    print(chunk, end="")

# 异步流式
async for chunk in chain.astream({"topic": "AI"}):
    print(chunk, end="")

# 批量处理
results = chain.batch([{"topic": "AI"}, {"topic": "ML"}, {"topic": "DL"}])

# 异步并发
results = await chain.abatch([{"topic": "AI"}, {"topic": "ML"}])
```

### LangGraph 状态图

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str

workflow = StateGraph(AgentState)

# 定义节点
workflow.add_node("agent", call_llm)
workflow.add_node("tools", tool_node)

# 定义边
workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    lambda state: "tools" if should_call_tools(state) else END,
    {"tools": "tools", END: END}
)
workflow.add_edge("tools", "agent")

app = workflow.compile()
result = app.invoke({"messages": [HumanMessage(content="Hello")]})
```

## 常用设计模式

| 模式 | 适用场景 | 关键组件 |
|------|---------|---------|
| **Sequential Chain** | 多步骤流水线 | `RunnableSequence` 或 `\|` 操作符 |
| **Parallel Chain** | 多任务并发 | `RunnableParallel` |
| **Router Chain** | 动态路由请求 | `RunnableBranch` 或自定义路由函数 |
| **RAG** | 知识问答 | `Retriever + Prompt + LLM` |
| **ReAct Agent** | 工具调用推理 | `create_react_agent` |
| **Plan & Execute** | 复杂任务分解 | `PlanAndExecute` Agent |
| **Multi-Agent** | 多角色协作 | `LangGraph` 多节点图 |

## 环境变量配置

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# LangSmith（追踪）
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="ls-..."
export LANGCHAIN_PROJECT="my-project"

# AWS
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

## 参考

- [LangChain 官方文档](https://python.langchain.com/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [LangSmith 平台](https://smith.langchain.com/)
- [API 参考](https://api.python.langchain.com/)
- [LangChain 生态 llms.txt](https://docs.langchain.com/llms.txt)
