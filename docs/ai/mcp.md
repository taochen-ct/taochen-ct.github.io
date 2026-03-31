---
title: MCP
prev:
    link: '/ai/skill'
    text: 'Skill'
next:
    link: '/ai/harness'
    text: 'Harness Engineering'
---

# MCP (Model Context Protocol)

MCP is a protocol for connecting AI models to external tools and services.

## Overview

MCP provides:
- Standardized tool definitions
- Resource management
- Prompts/templates
- Sampling/callbacks

## Core Concepts

```python
from typing import Any
from dataclasses import dataclass
from enum import Enum

class MessageRole(Enum):
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"
    SYSTEM = "system"

@dataclass
class Message:
    role: MessageRole
    content: str
    name: str | None = None
    tool_call_id: str | None = None

@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]

@dataclass
class ToolResult:
    tool_call_id: str
    content: str
    is_error: bool = False
```

## Tool Definition

```python
from typing import Callable

@dataclass
class Tool:
    name: str
    description: str
    input_schema: dict
    handler: Callable

    def to_mcp_format(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.input_schema
        }
```

## MCP Server

```python
class MCPServer:
    def __init__(self, name: str):
        self.name = name
        self.tools: dict[str, Tool] = {}
        self.resources: dict[str, Any] = {}
        self.prompts: dict[str, dict] = {}

    def tool(self, name: str, description: str, input_schema: dict):
        def decorator(func: Callable):
            self.tools[name] = Tool(name, description, input_schema, func)
            return func
        return decorator

    def resource(self, uri: str):
        def decorator(func: Callable):
            self.resources[uri] = func
            return func
        return decorator

    # Tool execution
    async def call_tool(self, name: str, arguments: dict) -> ToolResult:
        tool = self.tools.get(name)
        if not tool:
            return ToolResult(
                tool_call_id="",
                content=f"Tool not found: {name}",
                is_error=True
            )

        try:
            result = await tool.handler(**arguments)
            return ToolResult(tool_call_id="", content=str(result))
        except Exception as e:
            return ToolResult(tool_call_id="", content=str(e), is_error=True)
```

## Tool Example

```python
server = MCPServer("filesystem")

@server.tool(
    name="read_file",
    description="Read contents of a file",
    input_schema={
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Path to the file"
            }
        },
        "required": ["path"]
    }
)
async def read_file(path: str) -> str:
    with open(path, 'r') as f:
        return f.read()

@server.tool(
    name="write_file",
    description="Write content to a file",
    input_schema={
        "type": "object",
        "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"}
        },
        "required": ["path", "content"]
    }
)
async def write_file(path: str, content: str) -> str:
    with open(path, 'w') as f:
        f.write(content)
    return f"Written to {path}"
```

## Protocol Messages

```python
# Initialize
class InitializeRequest:
    protocol_version: str
    capabilities: dict
    client_info: dict

# Tools
class ToolsListRequest:
    pass

class ToolsListResponse:
    tools: list[dict]

class ToolsCallRequest:
    calls: list[ToolCall]

class ToolsCallResponse:
    results: list[ToolResult]

# Resources
class ResourcesListRequest:
    pass

class ResourcesReadRequest:
    uri: str

# Prompts
class PromptsListRequest:
    pass

class PromptsGetRequest:
    name: str
    arguments: dict
```

## MCP Client

```python
import json

class MCPClient:
    def __init__(self, server_url: str):
        self.server_url = server_url
        self.tools: list[Tool] = []

    async def initialize(self) -> dict:
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "client", "version": "1.0"}
            }
        }
        return await self._send(request)

    async def list_tools(self) -> list[Tool]:
        request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list"
        }
        response = await self._send(request)
        return [Tool(**t) for t in response.get("result", {}).get("tools", [])]

    async def call_tool(self, name: str, arguments: dict) -> ToolResult:
        request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": name,
                "arguments": arguments
            }
        }
        result = await self._send(request)
        return ToolResult(
            tool_call_id="",
            content=result.get("result", {}).get("content", "")
        )

    async def _send(self, request: dict) -> dict:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(self.server_url, json=request) as resp:
                return await resp.json()
```

## Integration with LLM

```python
async def chat_with_tools(client: MCPClient, model: Any, messages: list[Message]) -> Message:
    # Get available tools
    tools = await client.list_tools()

    # Build tool schema for model
    tool_schemas = [t.to_mcp_format() for t in tools]

    # Call model with tools
    response = await model.chat(
        messages=messages,
        tools=tool_schemas
    )

    # Handle tool calls
    while response.tool_calls:
        for call in response.tool_calls:
            result = await client.call_tool(call.name, call.arguments)
            messages.append(Message(
                role=MessageRole.TOOL,
                content=result.content,
                tool_call_id=call.id
            ))

        # Continue conversation
        response = await model.chat(messages=messages, tools=tool_schemas)

    return response
```