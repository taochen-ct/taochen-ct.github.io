---
title: Agent Loop
prev:
    link: '/ai/context'
    text: 'Context Engineering'
next: false
---

# Agent Loop

The agent loop is the core execution cycle that drives AI agent behavior.

## Basic Loop Structure

```python
from typing import Any
from dataclasses import dataclass
from enum import Enum
import asyncio

class AgentAction(Enum):
    THINK = "think"
    TOOL = "tool"
    RESPOND = "respond"
    WAIT = "wait"
    STOP = "stop"

@dataclass
class LoopState:
    iteration: int
    action: AgentAction
    thought: str
    tool_calls: list[dict]
    response: str
    context: dict
    error: str | None = None
```

## Simple Agent Loop

```python
class SimpleAgent:
    def __init__(self, model: Any, tools: list[Any] = None):
        self.model = model
        self.tools = tools or []
        self.messages: list[dict] = []
        self.max_iterations = 20

    async def run(self, user_message: str) -> str:
        self.messages.append({"role": "user", "content": user_message})

        for i in range(self.max_iterations):
            # 1. Get model response
            response = await self.model.chat(
                messages=self.messages,
                tools=self.tools
            )

            # 2. Check for tool calls
            if response.tool_calls:
                for call in response.tool_calls:
                    result = await self.execute_tool(call)
                    self.messages.append({
                        "role": "tool",
                        "content": str(result),
                        "tool_call_id": call.id
                    })
            else:
                # 3. Return response
                self.messages.append({
                    "role": "assistant",
                    "content": response.content
                })
                return response.content

        return "Max iterations reached"
```

## ReAct Agent Loop

```python
class ReActAgent:
    def __init__(self, model: Any, tools: dict[str, Any]):
        self.model = model
        self.tools = tools
        self.max_steps = 10

    async def run(self, query: str) -> str:
        thought = f"Question: {query}\n"
        self.history = [{"role": "user", "content": query}]

        for step in range(self.max_steps):
            # Thought
            prompt = self._build_prompt(thought)
            response = await self.model.complete(prompt)

            # Parse action
            action_type, action_input = self._parse_action(response)

            if action_type == "finish":
                return action_input

            # Execute action
            if action_type == "search" or action_type == "lookup":
                observation = await self.tools[action_type](action_input)
            else:
                observation = f"Unknown action: {action_type}"

            # Append to thought
            thought += f"Thought: {response.thought}\n"
            thought += f"Action: {action_type}[{action_input}]\n"
            thought += f"Observation: {observation}\n"

        return "Max steps reached"

    def _build_prompt(self, history: str) -> str:
        return f"""Format: Thought, Action, Observation.

{history}
"""

    def _parse_action(self, response: str) -> tuple[str, str]:
        # Parse response to extract action type and input
        lines = response.split('\n')
        for line in lines:
            if line.startswith("Action:"):
                parts = line.split("[")
                if len(parts) > 1:
                    action_type = parts[0].replace("Action:", "").strip()
                    action_input = parts[1].replace("]", "").strip()
                    return action_type, action_input
        return "finish", response
```

## Tool-Using Agent

```python
class ToolAgent:
    def __init__(self, model: Any, tool_registry: dict[str, Any]):
        self.model = model
        self.tools = tool_registry

    async def step(self, context: dict) -> dict:
        messages = context.get("messages", [])

        # Get tool definitions
        tool_defs = [
            {
                "type": "function",
                "function": {
                    "name": name,
                    "description": tool.get("description", ""),
                    "parameters": tool.get("parameters", {})
                }
            }
            for name, tool in self.tools.items()
        ]

        # Call model
        response = await self.model.chat(
            messages=messages,
            tools=tool_defs
        )

        # Handle tool calls
        if response.tool_calls:
            results = []
            for call in response.tool_calls:
                tool_name = call.function.name
                args = call.function.arguments

                result = await self._execute_tool(tool_name, args)
                results.append({
                    "call_id": call.id,
                    "tool": tool_name,
                    "result": result
                })

            # Add tool results to messages
            messages.append({
                "role": "assistant",
                "content": response.content,
                "tool_calls": [
                    {"id": c.id, "function": c.function}
                    for c in response.tool_calls
                ]
            })

            for r in results:
                messages.append({
                    "role": "tool",
                    "tool_call_id": r["call_id"],
                    "content": str(r["result"])
                })

            return {
                "type": "continue",
                "messages": messages
            }

        return {
            "type": "stop",
            "content": response.content,
            "messages": messages
        }

    async def _execute_tool(self, name: str, args: dict) -> Any:
        tool = self.tools.get(name)
        if not tool:
            return f"Error: Tool {name} not found"
        try:
            return await tool(**args)
        except Exception as e:
            return f"Error: {str(e)}"
```

## State Machine Agent

```python
from enum import Enum

class AgentState(Enum):
    IDLE = "idle"
    THINKING = "thinking"
    EXECUTING = "executing"
    WAITING = "waiting"
    RESPONDING = "responding"
    DONE = "done"

class StateMachineAgent:
    def __init__(self, model: Any, tools: dict[str, Any]):
        self.model = model
        self.tools = tools
        self.state = AgentState.IDLE
        self.context: dict = {}
        self.handlers = {
            AgentState.IDLE: self.handle_idle,
            AgentState.THINKING: self.handle_thinking,
            AgentState.EXECUTING: self.handle_executing,
            AgentState.RESPONDING: self.handle_responding,
        }

    async def process(self, user_input: str):
        self.context["user_input"] = user_input
        self.context["messages"] = [{"role": "user", "content": user_input}]
        self.state = AgentState.THINKING

        while self.state != AgentState.DONE:
            handler = self.handlers.get(self.state)
            if handler:
                await handler()
            else:
                break

    async def handle_thinking(self):
        # Get model response
        response = await self.model.chat(
            messages=self.context["messages"],
            tools=self._get_tool_schemas()
        )

        if response.tool_calls:
            self.context["pending_calls"] = response.tool_calls
            self.state = AgentState.EXECUTING
        else:
            self.context["final_response"] = response.content
            self.state = AgentState.RESPONDING

    async def handle_executing(self):
        for call in self.context["pending_calls"]:
            result = await self._execute_tool(call)
            self.context["messages"].append({
                "role": "tool",
                "content": str(result),
                "tool_call_id": call.id
            })

        self.state = AgentState.THINKING

    async def handle_responding(self):
        self.state = AgentState.DONE
```

## Loop Patterns

### Parallel Execution

```python
async def parallel_agent_loop(tasks: list[dict], model: Any) -> list[dict]:
    async def run_task(task: dict) -> dict:
        agent = SimpleAgent(model, task.get("tools", []))
        result = await agent.run(task["input"])
        return {"task_id": task["id"], "result": result}

    return await asyncio.gather(*[run_task(t) for t in tasks])
```

### Iterative Refinement

```python
async def iterative_loop(query: str, model: Any, max_refinements: int = 3):
    current_result = None

    for i in range(max_refinements):
        if current_result:
            # Refine based on feedback
            query = f"Previous: {current_result}\nRefine: {query}"

        result = await model.complete(query)
        current_result = result.content

        # Check if good enough
        if meets_criteria(result):
            break

    return current_result
```

### Human-in-the-Loop

```python
async def human_in_loop(user_input: str, model: Any):
    messages = [{"role": "user", "content": user_input}]

    while True:
        response = await model.chat(messages=messages)

        if response.tool_calls:
            # Auto-execute tools
            for call in response.tool_calls:
                result = await execute_tool(call)
                messages.append({
                    "role": "tool",
                    "content": str(result)
                })
        elif needs_approval(response.content):
            # Pause for human approval
            approved = await request_human_approval(response.content)
            if not approved:
                messages.append({
                    "role": "user",
                    "content": "Please revise your response"
                })
                continue

        return response.content
```