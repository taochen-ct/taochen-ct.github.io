---
title: Context Engineering
prev:
    link: '/ai/harness'
    text: 'Harness Engineering'
next:
    link: '/ai/agent-loop'
    text: 'Agent Loop'
---

# Context Engineering

Context engineering manages the information and state that AI agents use to make decisions.

## Core Concepts

```python
from typing import Any, Callable
from dataclasses import dataclass, field
from datetime import datetime
import json
```

## Context Structure

```python
@dataclass
class ConversationTurn:
    role: str  # "user", "assistant", "system", "tool"
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: dict = field(default_factory=dict)

@dataclass
class AgentContext:
    session_id: str
    user_id: str
    conversation: list[ConversationTurn] = field(default_factory=list)
    working_memory: dict[str, Any] = field(default_factory=dict)
    long_term: dict[str, Any] = field(default_factory=dict)
    tools: list[dict] = field(default_factory=list)

    def add_turn(self, turn: ConversationTurn):
        self.conversation.append(turn)

    def to_messages(self) -> list[dict]:
        return [
            {"role": t.role, "content": t.content}
            for t in self.conversation
        ]
```

## Context Manager

```python
class ContextManager:
    def __init__(
        self,
        max_tokens: int = 8000,
        system_prompt: str = ""
    ):
        self.max_tokens = max_tokens
        self.system_prompt = system_prompt
        self.sessions: dict[str, AgentContext] = {}

    def get_or_create(self, session_id: str) -> AgentContext:
        if session_id not in self.sessions:
            self.sessions[session_id] = AgentContext(
                session_id=session_id,
                user_id=""
            )
        return self.sessions[session_id]

    def build_prompt(
        self,
        context: AgentContext,
        include_tools: bool = True
    ) -> list[dict]:
        messages = []

        # System prompt
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})

        # Conversation
        messages.extend(context.to_messages())

        # Tools
        if include_tools and context.tools:
            messages.append({
                "role": "system",
                "content": "Available tools: " + json.dumps(context.tools)
            })

        return messages
```

## RAG Context

```python
from typing import Any
import asyncio

class RagContext:
    def __init__(self, vector_store: Any):
        self.vector_store = vector_store
        self.cache: dict[str, list[dict]] = {}

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: dict | None = None
    ) -> list[dict]:
        cache_key = f"{query}:{top_k}:{json.dumps(filters or {})}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        results = await self.vector_store.search(
            query=query,
            top_k=top_k,
            filters=filters
        )

        self.cache[cache_key] = results
        return results

    def inject_into_context(
        self,
        context: AgentContext,
        query: str,
        max_items: int = 3
    ):
        docs = asyncio.run(self.retrieve(query, top_k=max_items))

        context.add_turn(ConversationTurn(
            role="system",
            content="Relevant context:\n" +
                "\n".join([f"- {d['content']}" for d in docs]),
            metadata={"type": "rag", "source": "retrieval"}
        ))
```

## Context Compression

```python
class ContextCompressor:
    def __init__(self, max_turns: int = 20):
        self.max_turns = max_turns

    def compress(self, context: AgentContext) -> AgentContext:
        if len(context.conversation) <= self.max_turns:
            return context

        # Keep first and last N turns
        keep = self.max_turns // 2
        compressed = AgentContext(
            session_id=context.session_id,
            user_id=context.user_id,
            tools=context.tools
        )

        # Add summary
        compressed.add_turn(ConversationTurn(
            role="system",
            content=f"[Earlier {len(context.conversation) - self.max_turns} turns summarized]"
        ))

        # Add preserved turns
        compressed.conversation.extend(context.conversation[:keep])
        compressed.conversation.extend(context.conversation[-keep:])

        return compressed

    def summarize_old_turns(self, context: AgentContext) -> str:
        old_turns = context.conversation[:-self.max_turns]
        if not old_turns:
            return ""

        # Simple summary - could use LLM for better results
        topics = set()
        for turn in old_turns:
            if turn.role == "user":
                topics.add(turn.content[:50])

        return f"Previously discussed: {', '.join(topics)}"
```

## Context for Planning

```python
class PlanningContext:
    def __init__(self):
        self.goals: list[dict] = []
        self.plan: list[dict] = []
        self.current_step: int = 0

    def add_goal(self, goal: str, priority: int = 1):
        self.goals.append({
            "goal": goal,
            "priority": priority,
            "status": "pending",
            "created_at": datetime.now()
        })
        self.goals.sort(key=lambda x: -x["priority"])

    def update_plan(self, steps: list[str]):
        self.plan = [
            {"step": i, "description": s, "status": "pending"}
            for i, s in enumerate(steps)
        ]

    def complete_step(self, result: Any):
        if self.current_step < len(self.plan):
            self.plan[self.current_step]["status"] = "completed"
            self.plan[self.current_step]["result"] = result
            self.current_step += 1

    def get_current_goal(self) -> str | None:
        for goal in self.goals:
            if goal["status"] == "pending":
                return goal["goal"]
        return None

    def to_context_string(self) -> str:
        lines = ["## Goals"]
        for g in self.goals:
            lines.append(f"- [{g['status']}] {g['goal']}")

        if self.plan:
            lines.append("\n## Plan")
            for p in self.plan:
                status = "x" if p["status"] == "completed" else " "
                lines.append(f"- [{status}] Step {p['step']}: {p['description']}")

        return "\n".join(lines)
```

## Best Practices

```python
# 1. Separate working and persistent context
context.working_memory = {}  # Current task
context.long_term = {}       # User preferences, history

# 2. Use structured metadata
turn = ConversationTurn(
    role="user",
    content="Calculate revenue",
    metadata={"intent": "calculation", "domain": "finance"}
)

# 3. Prune unused context
context.working_memory = {
    k: v for k, v in context.working_memory.items()
    if self._is_relevant(k, current_task)
}

# 4. Validate context before LLM call
def validate_context(context: AgentContext) -> bool:
    if not context.conversation:
        return False  # Need at least user message
    if len(context.to_messages()) > 100:
        return False  # Too long
    return True
```

## Context Injection Patterns

```python
from typing import Any, Callable
import json

class ContextInjector:
    """Inject context into agent prompts."""

    def __init__(self):
        self.injectors: list[Callable] = []

    def register(self, injector: Callable[[], dict]):
        self.injectors.append(injector)

    def build_context(self, base_messages: list[dict]) -> list[dict]:
        messages = base_messages.copy()

        for injector in self.injectors:
            context = injector()
            if context:
                messages.append({
                    "role": "system",
                    "content": json.dumps(context),
                    "name": context.get("source", "injector")
                })

        return messages


# Example: User preference injector
def user_preferences_injector(user_id: str) -> dict:
    prefs = load_user_preferences(user_id)  # From database
    return {
        "source": "user_preferences",
        "preferences": prefs,
        "format": "Key-value pairs for user preferences"
    }

injector = ContextInjector()
injector.register(lambda: user_preferences_injector("user123"))
```

## Context Window Management

```python
from typing import Any

class ContextWindowManager:
    """Manage context window to stay within token limits."""

    def __init__(
        self,
        max_tokens: int = 8000,
        model: str = "gpt-4"
    ):
        self.max_tokens = max_tokens
        # Rough token estimation: 1 token ≈ 4 characters
        self.char_per_token = 4

    def estimate_tokens(self, text: str) -> int:
        return len(text) // self.char_per_token

    def fit_within_limit(self, messages: list[dict]) -> list[dict]:
        """Truncate messages to fit within token limit."""
        total = sum(
            self.estimate_tokens(m.get("content", ""))
            for m in messages
        )

        if total <= self.max_tokens:
            return messages

        # Keep system prompt and recent messages
        result = [messages[0]] if messages[0].get("role") == "system" else []

        remaining = self.max_tokens - self.estimate_tokens(
            "".join(m.get("content", "") for m in result)
        )

        # Add recent messages until limit
        for msg in reversed(messages[1:]):
            msg_tokens = self.estimate_tokens(msg.get("content", ""))
            if remaining >= msg_tokens:
                result.insert(1, msg)
                remaining -= msg_tokens
            else:
                # Truncate content
                max_chars = remaining * self.char_per_token
                truncated = {**msg, "content": msg["content"][:max_chars]}
                result.insert(1, truncated)
                break

        return result

    def summarize_and_compress(
        self,
        messages: list[dict],
        summarizer: Any = None
    ) -> list[dict]:
        """Compress old messages using summarization."""
        if len(messages) <= 10:
            return messages

        # Keep recent messages
        recent = messages[-10:]

        # Summarize older messages
        older = messages[1:-10]  # Exclude system and recent
        if older and summarizer:
            summary = summarizer.summarize(older)
            messages = [messages[0], {"role": "system", "content": f"Summary: {summary}"}]
            messages.extend(recent)

        return messages
```

## Multi-Agent Context Sharing

```python
from typing import Any
from dataclasses import dataclass, field
import json

@dataclass
class SharedContext:
    """Shared context across multiple agents."""
    session_id: str
    global_state: dict[str, Any] = field(default_factory=dict)
    agent_states: dict[str, dict[str, Any]] = field(default_factory=dict)
    message_bus: list[dict] = field(default_factory=list)

    def broadcast(self, from_agent: str, message: dict):
        """Broadcast message to all agents."""
        self.message_bus.append({
            "from": from_agent,
            "message": message,
            "type": "broadcast"
        })

    def send_to(self, from_agent: str, to_agent: str, message: dict):
        """Send message to specific agent."""
        self.message_bus.append({
            "from": from_agent,
            "to": to_agent,
            "message": message,
            "type": "direct"
        })

    def get_messages_for(self, agent_id: str) -> list[dict]:
        """Get all messages for an agent."""
        return [
            m for m in self.message_bus
            if m.get("to") == agent_id or m.get("type") == "broadcast"
        ]


class MultiAgentCoordinator:
    """Coordinate context across multiple agents."""

    def __init__(self):
        self.shared: dict[str, SharedContext] = {}

    def create_session(self, session_id: str) -> SharedContext:
        self.shared[session_id] = SharedContext(session_id=session_id)
        return self.shared[session_id]

    async def delegate(
        self,
        from_agent: str,
        to_agent: str,
        task: dict,
        session_id: str
    ) -> Any:
        """Delegate task to another agent with shared context."""
        context = self.shared.get(session_id)
        if not context:
            raise ValueError(f"Session {session_id} not found")

        # Send task to target agent
        context.send_to(from_agent, to_agent, {
            "task": task,
            "caller": from_agent
        })

        # Update agent state
        context.agent_states[from_agent] = {
            "status": "waiting_delegation",
            "delegated_to": to_agent
        }

        return {"status": "delegated", "to": to_agent}
```

## Context Security

```python
import hashlib
from typing import Any

class SecureContextManager:
    """Manage sensitive data in context."""

    def __init__(self):
        self.allowed_keys: set[str] = {"user_id", "session_id"}
        self.redacted_value = "[REDACTED]"

    def sanitize(self, context: dict[str, Any]) -> dict[str, Any]:
        """Remove sensitive information from context."""
        sanitized = {}

        for key, value in context.items():
            if key in self.allowed_keys:
                sanitized[key] = value
            elif isinstance(value, dict):
                sanitized[key] = self.sanitize(value)
            elif isinstance(value, str) and self._is_sensitive(key):
                sanitized[key] = self.redacted_value
            else:
                sanitized[key] = value

        return sanitized

    def _is_sensitive(self, key: str) -> bool:
        sensitive_patterns = [
            "password", "token", "secret", "api_key", "credential"
        ]
        return any(p in key.lower() for p in sensitive_patterns)

    def add_audit(self, context: dict, action: str, agent_id: str) -> dict:
        """Add audit trail to context."""
        import datetime
        return {
            **context,
            "_audit": {
                "action": action,
                "agent_id": agent_id,
                "timestamp": datetime.datetime.now().isoformat()
            }
        }
```