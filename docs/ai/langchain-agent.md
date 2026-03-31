---
title: LangChain Agent
prev:
    link: '/ai/langchain'
    text: 'LangChain'
next:
    link: '/ai/rag'
    text: 'RAG & Embeddings'
---

# LangChain Agent

Building AI agents with LangChain, supporting tools, skills, and MCP.

## Basic Agent

```python
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain import hub

# Initialize LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Get prompt from hub
prompt = hub.pull("hwchase17/openai-functions-agent")

# Create agent
agent = create_openai_functions_agent(llm, tools, prompt)

# Create executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10
)

# Run
result = agent_executor.invoke({"input": "What's the weather in Tokyo?"})
print(result["output"])
```

## Tools Integration

```python
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_openai_functions_agent

@tool
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression."""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

@tool
def get_weather(location: str, unit: str = "celsius") -> str:
    """Get weather for a location.
    
    Args:
        location: City name
        unit: celsius or fahrenheit
    """
    return f"Weather in {location}: 22C"

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    return "Search results..."

tools = [calculate, get_weather, search_web]

# Build agent with tools
agent = create_openai_functions_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## Custom Tools with Structured Output

```python
from langchain_core.tools import tool
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    location: str = Field(description="City name")
    unit: str = Field(description="Temperature unit", enum=["celsius", "fahrenheit"])

@tool(args_schema=WeatherInput)
def get_weather(location: str, unit: str = "celsius") -> str:
    """Get weather for a location."""
    return f"{location}: 22 degrees"
```

## Skill Integration

```python
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_openai_functions_agent

# Define skills as tools
@tool
def analyze_code(code: str) -> str:
    """Analyze code for issues and improvements.
    
    Args:
        code: Source code to analyze
    """
    issues = []
    if "eval(" in code:
        issues.append("Use of eval() is dangerous")
    return f"Found {len(issues)} issues: {issues}" if issues else "No issues found"

@tool
def write_test(code: str, framework: str = "pytest") -> str:
    """Generate unit tests for code."""
    return f"# Tests for {framework}"

@tool
def refactor_code(code: str, style: str = "pep8") -> str:
    """Refactor code to follow best practices."""
    return "# Refactored code"

skills = [analyze_code, write_test, refactor_code]

# Use skills in agent
agent = create_openai_functions_agent(llm, skills, prompt)
executor = AgentExecutor(agent=agent, tools=skills)
```

## MCP Integration

```bash
pip install langchain-mcp
```

```python
from langchain_mcp import MCPTool

# Connect to MCP server
mcp_tools = await MCPTool.from_server(
    server_url="http://localhost:8000",
    server_name="my_mcp_server"
)

# Connect to multiple servers
mcp_tools = await MCPTool.from_servers([
    {"url": "http://localhost:8000", "name": "server1"},
    {"url": "http://localhost:8001", "name": "server2"},
])

# Combine with regular tools
all_tools = [*mcp_tools, *custom_tools]

agent = create_openai_functions_agent(llm, all_tools, prompt)
```

## MCP Server Example

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import asyncio

app = Server("my-tools")

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="file_read",
            description="Read file contents",
            inputSchema={
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"]
            }
        ),
        Tool(
            name="run_command",
            description="Run shell command",
            inputSchema={
                "type": "object",
                "properties": {"command": {"type": "string"}},
                "required": ["command"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "file_read":
        with open(arguments["path"]) as f:
            return [TextContent(type="text", text=f.read())]
    elif name == "run_command":
        proc = await asyncio.create_subprocess_shell(
            arguments["command"],
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, _ = await proc.communicate()
        return [TextContent(type="text", text=stdout.decode())]
    return [TextContent(type="text", text="Unknown tool")]

async def main():
    async with stdio_server() as streams:
        await app.run(streams[0], app.create_initialization_options())

asyncio.run(main())
```

## LCEL Agent (LangGraph)

```python
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor, ToolNode

# Define tool node
tool_node = ToolNode(tools)

# Build graph
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {"continue": "tools", "end": END}
)
workflow.add_edge("tools", "agent")

agent = workflow.compile()
```

## Combine Tools, Skills, MCP

```python
from langchain.agents import AgentExecutor, create_openai_functions_agent

# 1. Regular tools
@tool
def calculator(expr: str) -> str:
    """Calculate math expression."""
    return str(eval(expr))

# 2. Skills (as tools)
@tool
def code_reviewer(code: str) -> str:
    """Review code for issues."""
    return "OK" if len(code) < 500 else "File too large"

# Combine all
all_tools = [calculator, code_reviewer]  # + mcp_tools

# Build agent
prompt = hub.pull("hwchase17/openai-functions-agent")
agent = create_openai_functions_agent(llm, all_tools, prompt)

executor = AgentExecutor(
    agent=agent,
    tools=all_tools,
    max_iterations=15,
    verbose=True,
    handle_parsing_errors="Error. Please try again."
)

# Run
result = executor.invoke({
    "input": "Calculate 2+2 and review: def foo(): pass"
})
```

## Error Handling

```python
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=10,
    handle_parsing_errors="""An error occurred. 
    Please check your tool calls and try again.
    Error: {error}"""
)
```

## Streaming

```python
for event in agent_executor.stream({"input": "What's 2+2?"}):
    if "agent" in event:
        print(f"Agent: {event['agent']['messages'][0].content}")
    if "tools" in event:
        print(f"Tool: {event['tools']['messages']}")
```

## Memory with Agent

```python
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_openai_functions_agent

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

agent = create_openai_functions_agent(llm, tools, prompt, memory=memory)
executor = AgentExecutor(agent=agent, tools=tools)

# Multi-turn
executor.invoke({"input": "My name is Alice"})
result = executor.invoke({"input": "What's my name?"})
```