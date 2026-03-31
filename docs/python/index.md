---
title: Overview
prev: false
next:
    text: 'Garbage Collection'
    link: '/python/garbage-collection'
---

# Python

Python is a versatile, high-level programming language known for its readability and broad ecosystem.

## Basic Commands

```bash
# Run Python
python script.py

# Run with specific version
python3 script.py
python3.11 script.py

# Interactive mode
python -i

# Install package
pip install requests
pip install -r requirements.txt

# Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Format code
black .
ruff check .

# Type checking
mypy .
```

## Project Structure

```
myproject/
├── src/              # Source code
├── tests/            # Test files
├── venv/             # Virtual environment
├── requirements.txt  # Dependencies
├── setup.py          # Package config
└── pyproject.toml    # Project config (modern)
```

## Data Types

```python
# Basic types
x = 10          # int
y = 3.14        # float
name = "Alice"  # str
is_active = True  # bool

# Collections
numbers = [1, 2, 3]        # list
coords = (1, 2)            # tuple
data = {"key": "value"}    # dict
unique = {1, 2, 3}        # set
```

## Control Flow

```python
# Conditionals
if x > 10:
    print("big")
elif x > 5:
    print("medium")
else:
    print("small")

# Loops
for item in items:
    print(item)

while condition:
    break/continue
```

## Functions

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# Lambda
square = lambda x: x ** 2

# Type hints
def process(items: list[int]) -> int:
    return sum(items)
```

## Classes

```python
class Person:
    def __init__(self, name: str):
        self.name = name

    def greet(self) -> str:
        return f"Hello, {self.name}"

# Inheritance
class Student(Person):
    def __init__(self, name: str, grade: int):
        super().__init__(name)
        self.grade = grade
```

## Error Handling

```python
try:
    result = risky_operation()
except ValueError as e:
    print(f"Error: {e}")
except (TypeError, KeyError):
    print("Other error")
finally:
    cleanup()

# Custom exception
class MyError(Exception):
    pass
```

## File Operations

```python
# Read
with open("file.txt", "r") as f:
    content = f.read()

# Write
with open("file.txt", "w") as f:
    f.write("content")

# Context manager
with open("a.txt") as a, open("b.txt") as b:
    pass
```

## Comprehensions

```python
# List comprehension
squares = [x**2 for x in range(10)]

# Dict comprehension
word_lengths = {word: len(word) for word in words}

# Generator
gen = (x**2 for x in range(1000))
```

## Common Libraries

| Library | Purpose |
|---------|---------|
| `requests` | HTTP client |
| `json` | JSON handling |
| `datetime` | Date/time |
| `pathlib` | File paths |
| `asyncio` | Async programming |
| `functools` | Functional tools |
| `itertools` | Iterator tools |
| `collections` | Specialized containers |