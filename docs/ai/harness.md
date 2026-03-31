---
title: Harness Engineering
prev:
    link: '/ai/mcp'
    text: 'MCP'
next:
    link: '/ai/context'
    text: 'Context Engineering'
---

# Harness Engineering

Harness engineering builds the infrastructure and tooling for AI agent development.

## Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    Harness Layer                        │
├──────────────┬──────────────┬──────────────────────────┤
│   Execution  │   Memory     │    Tool Integration      │
│   Engine     │   Manager    │    (MCP, A2A)            │
├──────────────┼──────────────┼──────────────────────────┤
│   State      │   Logging    │    Evaluation            │
│   Machine    │   Tracing    │    Framework             │
└──────────────┴──────────────┴──────────────────────────┘
```

## Execution Engine

```python
from typing import Any, Callable
from dataclasses import dataclass, field
from enum import Enum
import asyncio

class AgentState(Enum):
    IDLE = "idle"
    RUNNING = "running"
    WAITING = "waiting"
    ERROR = "error"
    COMPLETED = "completed"

@dataclass
class ExecutionFrame:
    step: int
    action: str
    state: AgentState
    context: dict[str, Any]
    result: Any = None
    error: str | None = None

class ExecutionEngine:
    def __init__(self):
        self.frames: list[ExecutionFrame] = []
        self.max_steps = 100

    async def execute(
        self,
        agent: Any,
        initial_context: dict
    ) -> tuple[AgentState, list[ExecutionFrame]]:
        context = initial_context.copy()
        step = 0

        while step < self.max_steps:
            frame = ExecutionFrame(
                step=step,
                action="thinking",
                state=AgentState.RUNNING,
                context=context.copy()
            )

            # Agent step
            try:
                result = await agent.step(context)
                frame.result = result

                if result.get("type") == "stop":
                    frame.state = AgentState.COMPLETED
                    break
                elif result.get("type") == "wait":
                    frame.state = AgentState.WAITING
                    await self._handle_wait(result, context)
                else:
                    context.update(result.get("context", {}))

            except Exception as e:
                frame.error = str(e)
                frame.state = AgentState.ERROR
                break

            self.frames.append(frame)
            step += 1

        return frame.state, self.frames
```

## Memory Manager

```python
from typing import Any
import time

class MemoryManager:
    def __init__(self, max_tokens: int = 8000):
        self.max_tokens = max_tokens
        self.short_term: list[dict] = []
        self.long_term: dict[str, Any] = {}
        self.working: dict[str, Any] = {}

    def add(self, item: dict):
        self.short_term.append({
            **item,
            "timestamp": time.time()
        })
        self._compact()

    def _compact(self):
        # Keep last N items
        max_items = 50
        if len(self.short_term) > max_items:
            self.short_term = self.short_term[-max_items:]

    def get_recent(self, n: int = 10) -> list[dict]:
        return self.short_term[-n:]

    def get_working(self, key: str) -> Any:
        return self.working.get(key)

    def set_working(self, key: str, value: Any):
        self.working[key] = value

    def clear_working(self):
        self.working.clear()

    def to_messages(self) -> list[dict]:
        messages = []
        for item in self.short_term[-20:]:
            role = item.get("role", "user")
            content = item.get("content", "")
            messages.append({"role": role, "content": content})
        return messages
```

## Tool Integration

```python
class ToolIntegrator:
    def __init__(self):
        self.tools: dict[str, Callable] = {}
        self.mcp_clients: dict[str, Any] = {}

    def register(self, name: str, tool: Callable):
        self.tools[name] = tool

    def register_mcp(self, name: str, client: Any):
        self.mcp_clients[name] = client

    async def execute(self, tool_call: dict) -> Any:
        name = tool_call.get("name")
        args = tool_call.get("arguments", {})

        # Local tool
        if name in self.tools:
            return await self.tools[name](**args)

        # MCP tool
        for client in self.mcp_clients.values():
            result = await client.call_tool(name, args)
            if result:
                return result

        raise ValueError(f"Tool not found: {name}")
```

## Logging & Tracing

```python
import logging
from datetime import datetime
import json

class AgentLogger:
    def __init__(self, agent_id: str, log_file: str):
        self.agent_id = agent_id
        self.log_file = log_file
        self.logger = logging.getLogger(f"agent.{agent_id}")
        self.logger.setLevel(logging.DEBUG)

        handler = logging.FileHandler(log_file)
        handler.setFormatter(
            logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        )
        self.logger.addHandler(handler)

    def log_step(self, step: int, action: str, context: dict, result: Any):
        self.logger.info(json.dumps({
            "step": step,
            "action": action,
            "context_keys": list(context.keys()),
            "result_type": type(result).__name__,
            "timestamp": datetime.now().isoformat()
        }))

    def log_error(self, step: int, error: Exception):
        self.logger.error(json.dumps({
            "step": step,
            "error": str(error),
            "type": type(error).__name__,
            "timestamp": datetime.now().isoformat()
        }))

    def get_trace(self) -> list[dict]:
        traces = []
        with open(self.log_file, 'r') as f:
            for line in f:
                traces.append(json.loads(line))
        return traces
```

## Evaluation Framework

```python
from typing import Callable
import asyncio

@dataclass
class EvaluationResult:
    metric: str
    score: float
    details: dict

class EvaluationFramework:
    def __init__(self):
        self.metrics: dict[str, Callable] = {}

    def metric(self, name: str):
        def decorator(func: Callable):
            self.metrics[name] = func
            return func
        return decorator

    async def evaluate(
        self,
        agent: Any,
        test_cases: list[dict],
        metrics: list[str] | None = None
    ) -> list[EvaluationResult]:
        metrics = metrics or list(self.metrics.keys())
        results = []

        for test in test_cases:
            context = test["initial_context"]
            expected = test.get("expected", {})

            await agent.reset()
            await agent.run(context)

            for metric_name in metrics:
                if metric_name in self.metrics:
                    score = await self.metrics[metric_name](agent, expected)
                    results.append(EvaluationResult(
                        metric=metric_name,
                        score=score,
                        details={"test": test.get("name")}
                    ))

        return results

# Built-in metrics
@EvaluationFramework.metric
async def accuracy(agent: Any, expected: dict) -> float:
    # Check if final state matches expected
    return 1.0 if agent.final_state == expected.get("state") else 0.0

@EvaluationFramework.metric
async def efficiency(agent: Any, expected: dict) -> float:
    # Fewer steps is better
    optimal = expected.get("optimal_steps", 10)
    actual = len(agent.frames)
    return max(0, 1 - (actual - optimal) / optimal)
```