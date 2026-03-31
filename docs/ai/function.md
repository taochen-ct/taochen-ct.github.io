---
title: Function Calling
prev:
    link: '/ai/prompt'
    text: 'Prompt Engineering'
next: false
---

# Function Calling

LLM-powered tool use and function invocation.

## OpenAI Function Calling

```python
from openai import OpenAI
from pydantic import BaseModel
from typing import Optional

client = OpenAI()

# Define function
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Use with chat
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "What's the weather in Tokyo?"}
    ],
    tools=tools
)

# Get function call
tool_call = response.choices[0].message.tool_calls[0]
print(tool_call.function.name)  # "get_weather"
print(tool_call.function.arguments)  # {"location": "Tokyo"}

# Execute function
import json
args = json.loads(tool_call.function.arguments)
weather = get_weather(args["location"], args.get("unit", "celsius"))

# Send result back
response2 = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "What's the weather in Tokyo?"},
        response.choices[0].message,
        {
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": weather
        }
    ]
)
```

## Pydantic Models

```python
from pydantic import BaseModel
from typing import Literal

class WeatherInput(BaseModel):
    location: str
    unit: Literal["celsius", "fahrenheit"] = "celsius"

class GetWeather(BaseModel):
    __name__ = "get_weather"

    location: str
    unit: Literal["celsius", "fahrenheit"] = "celsius"

# Or using function
from pydantic import create_model, Field

GetWeather = create_model(
    "get_weather",
    location=(str, Field(description="City name")),
    unit=(Literal["celsius", "fahrenheit"] = "celsius")
)

# Convert to OpenAI format
from langchain_core.utils.function_casting import cast_to_class

# Use with LangChain
from langchain_openai import ChatOpenAI
from langchain_core.utils.function_casting import cast_to_class
```

## Multiple Functions

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {"type": "object", "properties": {...}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_hotels",
            "description": "Search for hotels",
            "parameters": {"type": "object", "properties": {...}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_flight",
            "description": "Book a flight",
            "parameters": {"type": "object", "properties": {...}}
        }
    }
]

# Model will choose appropriate function
response = client.chat.completions.create(
    model="gpt-4",
    messages=[...],
    tools=tools
)

# Handle multiple calls
for tool_call in response.choices[0].message.tool_calls:
    if tool_call.function.name == "get_weather":
        result = get_weather(json.loads(tool_call.function.arguments))
    elif tool_call.function.name == "search_hotels":
        result = search_hotels(json.loads(tool_call.function.arguments))
```

## LangChain Tools

```python
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def get_weather(location: str, unit: str = "celsius") -> str:
    """Get weather for a location."""
    # Implementation
    return f"Weather in {location}: 22°C"

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Implementation
    return "Search results..."

llm = ChatOpenAI(model="gpt-4")
llm_with_tools = llm.bind_tools([get_weather, search_web])

response = llm_with_tools.invoke("What's the weather in Tokyo?")

# Check if tool calls
if response.tool_calls:
    for call in response.tool_calls:
        print(call.name, call.args)
```

## Parallel Function Calls

```python
# Model can call multiple functions at once
response = llm_with_tools.invoke(
    "What's the weather in Tokyo and New York?"
)

# Both calls in response
for call in response.tool_calls:
    print(f"Function: {call.name}")
    print(f"Args: {call.args}")
```

## Streaming with Functions

```python
# Partial function calls
stream = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Weather in Tokyo?"}],
    tools=tools,
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.tool_calls:
        print(chunk.choices[0].delta.tool_calls)
```

## Error Handling

```python
def execute_tool(tool_name: str, args: dict) -> str:
    try:
        if tool_name == "get_weather":
            return get_weather(**args)
        elif tool_name == "search_web":
            return search_web(**args)
        else:
            return f"Unknown function: {tool_name}"
    except Exception as e:
        return f"Error: {str(e)}"

# Use in response loop
messages = [...]
response = llm.chat.completions.create(...)

while response.tool_calls:
    # Add assistant message
    messages.append({
        "role": "assistant",
        "tool_calls": [
            {"id": c.id, "function": {"name": c.name, "arguments": c.arguments}}
            for c in response.tool_calls
        ]
    })

    # Execute and add results
    for call in response.tool_calls:
        result = execute_tool(call.name, json.loads(call.arguments))
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": result
        })

    # Continue
    response = llm.chat.completions.create(
        model="gpt-4",
        messages=messages
    )
```

## Real-World Pattern

```python
from typing import Union
from langgraph.graph import StateGraph
from langchain_core.messages import HumanMessage

# Define tool
@tool
def calculate(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

# Agent loop
def should_continue(state):
    if state.get("tool_calls"):
        return "continue"
    return "end"

llm_with_tools = ChatOpenAI(model="gpt-4").bind_tools([calculate])

def call_model(state):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response], "tool_calls": response.tool_calls}

def execute_tools(state):
    results = []
    for tool_call in state["messages"][-1].tool_calls:
        result = calculate.invoke(tool_call)
        results.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": str(result)
        })
    return {"messages": results}

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", execute_tools)
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {
    "continue": "tools",
    "end": END
})
workflow.add_edge("tools", "agent")

app = workflow.compile()
```

## Best Practices

```python
# 1. Clear function descriptions
@tool
def get_stock_price(symbol: str) -> str:
    """Get current stock price for a given ticker symbol.
    
    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
    
    Returns:
        Current price in USD
    """
    pass

# 2. Validate inputs with Pydantic
class CalculatorInput(BaseModel):
    expression: str = Field(description="Mathematical expression")

# 3. Handle errors gracefully
# Return error messages, don't raise

# 4. Include required and optional params
@tool
def search(query: str, limit: int = 10) -> list:
    # limit has default
    pass

# 5. Keep functions focused - do one thing well
```