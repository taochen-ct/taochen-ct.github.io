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

## Agent Session State Management

```python
from typing import Any
from dataclasses import dataclass

class HookState:
    """Mutable wrapper for a single hook's state.

    Changes are written back to the session state automatically.
    """

    def __init__(self, session_state: dict[str, dict[str, Any]], source_id: str):
        self._session_state = session_state
        self._source_id = source_id
        if source_id not in session_state:
            session_state[source_id] = {}

    def get(self, key: str, default: Any = None) -> Any:
        return self._session_state[self._source_id].get(key, default)

    def set(self, key: str, value: Any) -> None:
        self._session_state[self._source_id][key] = value

    def update(self, values: dict[str, Any]) -> None:
        self._session_state[self._source_id].update(values)


class SessionState:
    """Structured state container for a session."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.service_session_id: str | None = None
        self._hook_state: dict[str, dict[str, Any]] = {}

    def get_hook_state(self, source_id: str) -> HookState:
        """Get mutable state wrapper for a specific hook."""
        return HookState(self._hook_state, source_id)


class AgentSession:
    """Lightweight conversation session container."""

    def __init__(self, *, session_id: str | None = None):
        import uuid
        self._session_id = session_id or str(uuid.uuid4())
        self._state = SessionState(self._session_id)

    @property
    def session_id(self) -> str:
        return self._session_id

    @property
    def state(self) -> SessionState:
        return self._state
```

## Context Provider Pattern

```python
from typing import Any, Protocol, Sequence
from abc import ABC, abstractmethod

class ContextProvider(ABC):
    """Base class for context providers that modify session state."""

    def __init__(self, source_id: str):
        self.source_id = source_id

    async def before_run(
        self,
        agent: Any,
        session: AgentSession,
        context: Any,
        state: dict[str, Any]
    ) -> None:
        """Called before agent execution."""
        pass

    async def after_run(
        self,
        agent: Any,
        session: AgentSession,
        context: Any,
        state: dict[str, Any]
    ) -> None:
        """Called after agent execution."""
        pass


class InMemoryHistoryProvider(ContextProvider):
    """Provider that maintains chat history in session state."""

    def __init__(self, source_id: str = "memory", load_messages: bool = True):
        super().__init__(source_id)
        self.load_messages = load_messages

    async def before_run(
        self,
        agent: Any,
        session: AgentSession,
        context: Any,
        state: dict[str, Any]
    ) -> None:
        if not self.load_messages:
            return
        my_state = state.get(self.source_id, {})
        messages = my_state.get("messages", [])
        context.extend_messages(self.source_id, messages)

    async def after_run(
        self,
        agent: Any,
        session: AgentSession,
        context: Any,
        state: dict[str, Any]
    ) -> None:
        my_state = state.setdefault(self.source_id, {})
        messages = my_state.get("messages", [])
        my_state["messages"] = [
            *messages,
            *context.input_messages,
            *(context.response.messages or []),
        ]


class TimeContextProvider(ContextProvider):
    """Stateless provider that adds time context."""

    def __init__(self):
        super().__init__("time")

    async def before_run(
        self,
        agent: Any,
        session: AgentSession,
        context: Any,
        state: dict[str, Any]
    ) -> None:
        from datetime import datetime
        context.extend_instructions(
            self.source_id,
            f"Current time: {datetime.now().isoformat()}"
        )
```

## Evaluation with GAIA Benchmark

```python
from datasets import load_dataset

# Evaluate against GAIA benchmark
gaia = load_dataset("gaia-benchmark/GAIA", "2023_level1", split="test")

@evaluator
def exact_match(response: str, expected_output: str) -> bool:
    return expected_output.strip().lower() in response.strip().lower()

results = await evaluate_agent(
    agent=agent,
    queries=[task["Question"] for task in gaia],
    expected_output=[task["Final answer"] for task in gaia],
    evaluators=LocalEvaluator(exact_match),
)
```

## Best Practices

```python
# 1. Separate agent logic from execution harness
class Agent:
    def __init__(self):
        self.context_providers: list[ContextProvider] = []

    async def run(self, input: str, session: AgentSession):
        # Agent logic only - harness handles execution
        pass

# 2. Use structured state with HookState wrapper
state = session.state.get_hook_state("my_plugin")
state.set("key", value)  # Auto-saves to session

# 3. Implement proper cleanup in after_run
async def after_run(self, agent, session, context, state):
    # Always save state even on errors
    state.set("last_run", datetime.now())

# 4. Evaluate with real benchmarks
results = await evaluate_agent(
    agent=agent,
    queries=test_queries,
    expected_output=expected_outputs,
    evaluators=[LocalEvaluator(custom_check)]
)