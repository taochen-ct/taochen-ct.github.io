---
title: A2A Protocol
prev:
    link: '/ai/transformers'
    text: 'Transformers'
next:
    link: '/ai/skill'
    text: 'Skill'
---

# A2A (Agent-to-Agent)

A2A is a protocol for agents to communicate and collaborate with each other.

## Core Concept

A2A defines how agents can:
- Discover each other
- Exchange messages
- Coordinate actions
- Share context

## Protocol Structure

```python
from typing import Any
from dataclasses import dataclass
from enum import Enum

class MessageType(Enum):
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    ERROR = "error"

@dataclass
class A2AMessage:
    id: str
    type: MessageType
    sender: str
    receiver: str
    action: str
    payload: dict[str, Any]
    context: dict[str, Any]
    timestamp: float
```

## Agent Registry

```python
from abc import ABC, abstractmethod

class AgentRegistry(ABC):
    @abstractmethod
    def register(self, agent_id: str, capabilities: list[str], endpoint: str):
        pass

    @abstractmethod
    def discover(self, capability: str) -> list[dict]:
        pass

    @abstractmethod
    def unregister(self, agent_id: str):
        pass

class InMemoryRegistry(AgentRegistry):
    def __init__(self):
        self.agents: dict[str, dict] = {}

    def register(self, agent_id: str, capabilities: list[str], endpoint: str):
        self.agents[agent_id] = {
            "capabilities": capabilities,
            "endpoint": endpoint,
            "registered_at": time.time()
        }

    def discover(self, capability: str) -> list[dict]:
        return [
            {"agent_id": id, "endpoint": info["endpoint"]}
            for id, info in self.agents.items()
            if capability in info["capabilities"]
        ]

    def unregister(self, agent_id: str):
        self.agents.pop(agent_id, None)
```

## Sending Messages

```python
import aiohttp

class A2AClient:
    def __init__(self, registry: AgentRegistry):
        self.registry = registry

    async def send_request(self, receiver: str, action: str, payload: dict) -> dict:
        message = A2AMessage(
            id=str(uuid.uuid4()),
            type=MessageType.REQUEST,
            sender=self.agent_id,
            receiver=receiver,
            action=action,
            payload=payload,
            context={},
            timestamp=time.time()
        )

        endpoint = self.registry.discover(receiver)[0]["endpoint"]
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{endpoint}/message", json=asdict(message)) as resp:
                return await resp.json()

    async def broadcast(self, action: str, payload: dict) -> list[dict]:
        # Send to all agents
        pass
```

## Receiving Messages

```python
from aiohttp import web

class A2AAgent:
    def __init__(self, agent_id: str, capabilities: list[str]):
        self.agent_id = agent_id
        self.capabilities = capabilities
        self.handlers: dict[str, callable] = {}

    def handle(self, action: str):
        def decorator(func):
            self.handlers[action] = func
            return func
        return decorator

    async def handle_message(self, request):
        message = await request.json()

        handler = self.handlers.get(message["action"])
        if not handler:
            return web.json_response(
                {"error": f"No handler for action: {message['action']}"},
                status=404
            )

        result = await handler(message["payload"], message["context"])
        return web.json_response({"result": result})
```

## Context Passing

```python
@dataclass
class AgentContext:
    session_id: str
    user_id: str
    history: list[dict]
    variables: dict[str, Any]

    def add_turn(self, agent_id: str, action: str, result: Any):
        self.history.append({
            "agent": agent_id,
            "action": action,
            "result": result,
            "timestamp": time.time()
        })
```

## Example: Multi-Agent Task

```python
# Agent 1: Research Agent
research_agent = A2AAgent("researcher", ["search", "read"])
@research_agent.handle("research")
async def research(query: str, context: AgentContext):
    results = await search_web(query)
    return {"summary": summarize(results)}

# Agent 2: Writer Agent
writer_agent = A2AAgent("writer", ["write", "edit"])
@writer_agent.handle("write")
async def write(topic: str, context: AgentContext):
    content = await research_agent.send_request(
        "researcher", "research", {"query": topic}
    )
    return await generate_article(content)

# Usage
context = AgentContext(session_id="sess1", user_id="user1", history=[], variables={})
result = await writer_agent.send_request("writer", "write", {"topic": "AI"})
```