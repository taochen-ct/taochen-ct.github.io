---
title: LangChain
prev:
    link: '/ai/agent-loop'
    text: 'Agent Loop'
next: false
---

# LangChain

LangChain is a framework for building applications with large language models.

## Installation

```bash
pip install langchain
pip install langchain-core langchain-community
pip install langchain-openai  # OpenAI
pip install langchain-anthropic  # Anthropic
pip install langchain-aws  # AWS Bedrock
```

## Basic Concepts

```python
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Core components
# 1. Messages - Chat message types
# 2. Prompts - Template for LLM input
# 3. Chains - Sequences of operations
# 4. Output Parsers - Parse LLM output
# 5. Agents - Dynamic tool use
```

## LLM Setup

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_aws import ChatBedrock

# OpenAI
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    api_key="your-api-key"
)

# Anthropic
llm = ChatAnthropic(
    model="claude-3-sonnet-20240229",
    anthropic_api_key="your-api-key"
)

# AWS Bedrock
llm = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    region_name="us-east-1"
)
```

## Prompts

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    FewShotPromptTemplate,
    PromptTemplate
)

# Simple prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("human", "What is {topic}?")
])

# With examples
examples = [
    {"input": "hello", "output": "Hi there!"},
    {"input": "bye", "output": "Goodbye!"}
]

few_shot_prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=PromptTemplate.from_template("Input: {input}\nOutput: {output}"),
    prefix="Respond politely:",
    suffix="Input: {user_input}\nOutput:",
    input_variables=["user_input"]
)

# Build prompt
messages = prompt.format_messages(topic="AI")
response = llm.invoke(messages)
```

## Chains

```python
# Simple chain
chain = prompt | llm | StrOutputParser()

# Invoke
result = chain.invoke({"topic": "machine learning"})
print(result)  # str output

# With LCEL (LangChain Expression Language)
chain = (
    {"topic": lambda x: x["topic"]}
    | prompt
    | llm
    | StrOutputParser()
)
```

## Output Parsers

```python
from langchain_core.output_parsers import (
    StrOutputParser,
    JsonOutputParser,
    CommaSeparatedListOutputParser,
    PydanticOutputParser
)
from pydantic import BaseModel

# JSON parser
json_parser = JsonOutputParser()
chain = prompt | llm | json_parser
result = chain.invoke({"topic": "AI"})
# result is a dict

# Pydantic parser
class Answer(BaseModel):
    explanation: str
    confidence: float

pydantic_parser = PydanticOutputParser(pydantic_object=Answer)

# Comma-separated list
list_parser = CommaSeparatedListOutputParser()
chain = prompt | llm | list_parser
result = chain.invoke({"topic": "AI"})  # Returns list
```

## Memory

```python
from langchain.memory import (
    ConversationBufferMemory,
    ConversationBufferWindowMemory,
    ConversationSummaryMemory,
    EntityMemory
)

# Simple buffer
memory = ConversationBufferMemory(
    return_messages=True,
    memory_key="chat_history"
)

# Add messages
memory.save_context(
    {"input": "Hi"},
    {"output": "Hello!"}
)
memory.load_memory_variables({})

# With chat model
from langchain.chains import ConversationChain

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

response = conversation.predict(input="What's the weather?")
```

## Retrieval (RAG)

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_community.vectorstores import FAISS, Chroma
from langchain_openai import OpenAIEmbeddings

# Load documents
loader = TextLoader("document.txt")
docs = loader.load()

# PDF
loader = PyPDFLoader("document.pdf")
docs = loader.load_and_split()

# Split text
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
splits = text_splitter.split_documents(docs)

# Create embeddings and vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings
)

# Retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# Use in chain
from langchain.chains import RetrievalQA

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

result = qa_chain.invoke({"query": "What is this about?"})
print(result["result"])
```

## Tools

```python
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain import hub

# Define tool
@tool
def calculate(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"Error: {e}"

@tool
def get_weather(location: str) -> str:
    """Get weather for a location."""
    return f"Weather in {location}: 22°C, sunny"

# List of tools
tools = [calculate, get_weather]

# Prompt from hub
prompt = hub.pull("hwchase17/openai-functions-agent")

# Create agent
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=5
)

# Run
result = agent_executor.invoke({
    "input": "What's 2+2 and weather in Tokyo?"
})
```

## Agents

```python
from langchain.agents import AgentType, initialize_agent, AgentExecutor
from langchain.tools import Tool

# With initialize_agent
tools = [
    Tool(
        name="Calculator",
        func=lambda x: str(eval(x)),
        description="useful for math calculations"
    ),
    Tool(
        name="Search",
        func=lambda x: "Search results for: " + x,
        description="search for information"
    )
]

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

result = agent.run("What is 15 * 23?")
```

### ReAct Agent

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub

prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True
)

result = agent_executor.invoke({
    "input": "What is the capital of France?"
})
```

## Streaming

```python
# Stream tokens
for token in chain.stream({"topic": "AI"}):
    print(token, end="", flush=True)

# Async stream
async for token in chain.astream({"topic": "AI"}):
    print(token, end="")
```

## Callbacks

```python
from langchain.callbacks.base import BaseCallbackHandler

class MyCallbackHandler(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        print("LLM starting...")

    def on_llm_end(self, response, **kwargs):
        print("LLM ended")

    def on_tool_start(self, serialized, input_str, **kwargs):
        print(f"Tool starting: {serialized.get('name', 'unknown')}")

chain = prompt | llm | StrOutputParser(
    callbacks=[MyCallbackHandler()]
)
```

## Async

```python
import asyncio
from langchain_core.runnables import RunnableLambda

async def async_invoke():
    # Parallel invocation
    results = await asyncio.gather(
        chain.ainvoke({"topic": "AI"}),
        chain.ainvoke({"topic": "ML"}),
    )
    return results

# Use run_in_executor for sync LLM
async def async_invoke_sync_llm():
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: chain.invoke({"topic": "AI"}))
```

## LCEL Advanced

```python
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
    RunnableSequence
)

# Parallel execution
chain = RunnableParallel(
    topic=lambda x: x["topic"],
    context=lambda x: x.get("context", "")
) | prompt | llm | StrOutputParser()

# Conditional branching
def route(info):
    if info["type"] == "math":
        return math_chain
    return text_chain

chain = RunnableLambda(route)

# Add default values
chain = RunnablePassthrough.assign(
    default_value=lambda x: "default"
)
```

## Best Practices

```python
# 1. Use LCEL for clean code
chain = prompt | llm | StrOutputParser()

# 2. Add caching
from langchain.cache import InMemoryCache
import langchain
langchain.llm_cache = InMemoryCache()

# 3. Handle errors gracefully
from langchain_core.runnables import RunnableLambda

def safe_invoke(chain):
    try:
        return chain.invoke(input)
    except Exception as e:
        return {"error": str(e)}

# 4. Use batch for multiple inputs
results = chain.batch([{"topic": "AI"}, {"topic": "ML"}])

# 5. Configure timeouts
llm = ChatOpenAI(
    model="gpt-4",
    request_timeout=30,
    max_retries=2
)
```