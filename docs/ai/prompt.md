---
title: Prompt Engineering
prev:
    link: '/ai/rag'
    text: 'RAG & Embeddings'
next:
    link: '/ai/function'
    text: 'Function Calling'
---

# Prompt Engineering

Techniques for effective LLM prompts.

## Basic Structure

```
System: You are [role]. [Instructions]
Context: [Relevant information]
Task: [What to do]
Format: [Output format]
```

## System Prompts

```python
# Role definition
system_prompt = """You are an expert software engineer.
Your role is to:
1. Write clean, maintainable code
2. Follow best practices
3. Include proper error handling
4. Write helpful comments

When answering:
- Be specific and practical
- Provide code examples
- Explain the "why" behind recommendations"""

# Task-specific
system_prompt = """You are a Python code reviewer.
For each code snippet:
1. Identify bugs and issues
2. Suggest improvements
3. Rate code quality 1-10
4. Provide corrected version"""

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_code}
]
```

## Few-Shot Learning

```python
# Examples in prompt
few_shot_prompt = """Convert the following to Python:

JavaScript:
const add = (a, b) => a + b;
Python:
add = lambda a, b: a + b

JavaScript:
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
Python:
numbers = [1, 2, 3]
doubled = [n * 2 for n in numbers]

JavaScript:
for (let i = 0; i < 10; i++) {{
    console.log(i);
}}
Python:"""

response = llm.complete(few_shot_prompt)
```

## Chain of Thought

```python
# Step-by-step reasoning
cot_prompt = """Solve the problem step by step.

Problem: If a train travels 60 mph for 2 hours, then 40 mph for 1 hour, what's the average speed?

Step 1: Calculate distance for first leg
60 mph × 2 hours = 120 miles

Step 2: Calculate distance for second leg
40 mph × 1 hour = 40 miles

Step 3: Total distance
120 + 40 = 160 miles

Step 4: Total time
2 + 1 = 3 hours

Step 5: Average speed
160 ÷ 3 ≈ 53.33 mph

Problem: A car travels 100 miles in 2 hours, then 100 miles in 2 hours. What's the average speed?
Solution:"""

# Enable reasoning in the model
# For models that support it
response = llm.complete(
    prompt,
    reasoning_effort="high"
)
```

## ReAct Prompting

```python
react_prompt = """Use the following format:

Question: the input question
Thought: consider what to do
Action: search[query] or finish[answer]
Observation: result of action
... (repeat)

Question: What is the capital of France?
Thought: I need to find the capital of France.
Action: search[capital of France]
Observation: Paris is the capital and largest city of France.
Thought: I now know the answer.
Action: finish[Paris]

Question: Who developed the Python programming language?
"""

# Parse and execute actions
```

## Input Formatting

```python
# Use delimiters
prompt = """Summarize the following article:

===ARTICLE===
{article_content}
===

Summary:"""

# Use structured format
prompt = """Extract key information from this text:

Text: "{text}"

Format as JSON:
{{
    "topic": "",
    "main_points": [],
    "sentiment": "positive/negative/neutral"
}}"""

# XML tags
prompt = """<instructions>Summarize the meeting notes</instructions>
<notes>{notes}</notes>
<summary>"""
```

## Controlling Output

```python
# Specify format explicitly
prompt = """List 3 benefits of exercise.

Format:
1. [Benefit 1]
2. [Benefit 2]
3. [Benefit 3]"""

# JSON schema
prompt = """Return user information.

Schema:
{{
    "name": "string",
    "age": "number",
    "email": "string | null"
}}"""

# Constrain with examples
prompt = """Classify the sentiment: "Great product, love it!"

Only respond with one word: positive, negative, or neutral"""

# Negative constraints
prompt = """Explain photosynthesis.

Do NOT use the word "chlorophyll".
Do NOT mention the color green."""
```

## Persona & Style

```python
# Persona
prompt = """You are a pirate explaining treasure hunting.
Your response should use pirate terminology and be fun.
Explain how to find buried treasure."""

# Style
prompt = """Explain quantum computing to a 5-year-old.
Use:
- Simple words
- Fun analogies
- Short sentences
- Maybe a story"""

# Tone
prompt = """Write a job description for a software engineer.

Tone: Professional but friendly
Length: 200-300 words
Must include: responsibilities, requirements, benefits"""
```

## Iterative Refinement

```python
# v1 - vague
prompt = "Write about AI"

# v2 - specific
prompt = "Write a 500-word article about the benefits of AI in healthcare"

# v3 - with constraints
prompt = """Write a 500-word article about AI in healthcare.

Target audience: Hospital administrators
Tone: Professional
Include: 3 specific examples
Structure: Intro, 3 points, conclusion"""

# v4 - with format
prompt = """Write a 500-word article about AI in healthcare.

Target audience: Hospital administrators
Tone: Professional
Include: 3 specific examples
Structure: Intro, 3 points, conclusion

Format:
## Introduction
[content]

## Main Benefits
### 1. [Benefit]
[explanation]

### 2. [Benefit]
[explanation]

### 3. [Benefit]
[explanation]

## Conclusion
[summary]"""
```

## Techniques

```python
# 1. Be specific
# Bad: "Write about Python"
# Good: "Write a 300-word guide on Python decorators"

# 2. Provide context
# Bad: "Summarize this"
# Good: "Summarize this for a non-technical audience"

# 3. Use examples
# Bad: "Convert to JSON"
# Good: "Convert to JSON. Example: {a:1} -> {\"a\": 1}"

# 4. Chain of thought for reasoning
# "Think step by step before answering"

# 5. Specify constraints
# "Respond in exactly 50 words"

# 6. Break down complex tasks
prompt = """First, explain what Python is.
Then, list 3 key features.
Finally, give one example use case."""

# 7. Negative constraints
# "Do not use technical jargon"
# "Do not include code examples"
```