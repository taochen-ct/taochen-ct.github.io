---
title: Skill
prev:
    link: '/ai/a2a'
    text: 'A2A Protocol'
next:
    link: '/ai/mcp'
    text: 'MCP'
---

# Skill

Skills define reusable capabilities that AI agents can invoke.

## Concept

A skill is a self-contained unit of functionality that:
- Has clear inputs and outputs
- Can be discovered and invoked
- Encapsulates domain logic

## Skill Definition

```python
from typing import Any, Callable
from dataclasses import dataclass
from enum import Enum

class SkillType(Enum):
    ACTION = "action"      # Executes and returns result
    QUERY = "query"         # Fetches information
    TRANSFORM = "transform" # Transforms data

@dataclass
class Skill:
    name: str
    description: str
    type: SkillType
    parameters: dict[str, Any]
    handler: Callable
    required_capabilities: list[str] = []

@dataclass
class SkillResult:
    success: bool
    data: Any = None
    error: str = None
    metadata: dict[str, Any] = None
```

## Skill Implementation

```python
class SkillRegistry:
    def __init__(self):
        self.skills: dict[str, Skill] = {}

    def register(self, skill: Skill):
        self.skills[skill.name] = skill

    def get(self, name: str) -> Skill | None:
        return self.skills.get(name)

    def list(self, skill_type: SkillType | None = None) -> list[Skill]:
        if skill_type:
            return [s for s in self.skills.values() if s.type == skill_type]
        return list(self.skills.values())

    def find_by_capability(self, capability: str) -> list[Skill]:
        return [
            s for s in self.skills.values()
            if capability in s.required_capabilities
        ]
```

## Defining Skills

```python
# Query skill
@dataclass
class SearchParams:
    query: str
    limit: int = 10

search_skill = Skill(
    name="search",
    description="Search for information",
    type=SkillType.QUERY,
    parameters={
        "query": {"type": "string", "required": True},
        "limit": {"type": "integer", "default": 10}
    },
    handler=search_handler,
    required_capabilities=["web_access"]
)

async def search_handler(params: dict, context: dict) -> SkillResult:
    try:
        results = await web_search(params["query"], params["limit"])
        return SkillResult(success=True, data=results)
    except Exception as e:
        return SkillResult(success=False, error=str(e))

# Action skill
file_write_skill = Skill(
    name="write_file",
    description="Write content to a file",
    type=SkillType.ACTION,
    parameters={
        "path": {"type": "string", "required": True},
        "content": {"type": "string", "required": True}
    },
    handler=write_handler,
    required_capabilities=["file_system"]
)
```

## Skill Execution

```python
class SkillExecutor:
    def __init__(self, registry: SkillRegistry):
        self.registry = registry

    async def execute(
        self,
        skill_name: str,
        params: dict,
        context: dict
    ) -> SkillResult:
        skill = self.registry.get(skill_name)
        if not skill:
            return SkillResult(
                success=False,
                error=f"Skill not found: {skill_name}"
            )

        # Validate parameters
        for param_name, schema in skill.parameters.items():
            if schema.get("required", False) and param_name not in params:
                return SkillResult(
                    success=False,
                    error=f"Missing required parameter: {param_name}"
                )

        # Execute
        try:
            result = await skill.handler(params, context)
            return result
        except Exception as e:
            return SkillResult(success=False, error=str(e))
```

## Skill Composition

```python
class CompositeSkill:
    def __init__(self, name: str, steps: list[tuple[str, dict]]):
        self.name = name
        self.steps = steps  # [(skill_name, default_params), ...]

    async def execute(self, executor: SkillExecutor, initial_params: dict) -> SkillResult:
        context = {"results": {}}
        current_params = initial_params.copy()

        for skill_name, default_params in self.steps:
            params = {**default_params, **current_params}
            result = await executor.execute(skill_name, params, context)

            if not result.success:
                return result

            context["results"][skill_name] = result.data
            current_params.update(result.data or {})

        return SkillResult(success=True, data=context["results"])
```

## Invocation from AI

```python
# Prompt engineering for skill invocation
SKILL_INVOCATION_PROMPT = """
You have access to the following skills:
{skill_descriptions}

To invoke a skill, respond in this format:
SKILL: skill_name
PARAMS:
  param1: value1
  param2: value2
END
"""

# Parse skill invocation from model output
def parse_invocation(text: str) -> tuple[str, dict] | None:
    lines = text.strip().split('\n')
    if lines[0].startswith("SKILL:"):
        skill_name = lines[0].split(":")[1].strip()
        params = {}
        in_params = False
        for line in lines[1:]:
            if line.strip() == "PARAMS:":
                in_params = True
                continue
            if line.strip() == "END":
                break
            if in_params and ":" in line:
                key, value = line.split(":", 1)
                params[key.strip()] = value.strip()
        return skill_name, params
    return None
```