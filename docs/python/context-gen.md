---
title: Context Managers & Generators
prev:
    link: '/python/decorator'
    text: 'Decorator'
next:
    link: '/python/generators'
    text: 'Generators'
---

# Context Managers

Context managers ensure resources are properly managed, especially for cleanup operations.

## Using `with` Statement

```python
# File operations (automatic close)
with open("file.txt", "r") as f:
    content = f.read()
# File is automatically closed here
```

## Class-based Context Manager

```python
class DatabaseConnection:
    def __enter__(self):
        self.conn = create_connection()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        return False  # Don't suppress exceptions

# Usage
with DatabaseConnection() as conn:
    conn.execute("SELECT 1")
```

## Function-based Context Manager

```python
from contextlib import contextmanager

@contextmanager
def managed_resource():
    resource = acquire_resource()
    try:
        yield resource
    finally:
        release_resource(resource)

# Usage
with managed_resource() as res:
    res.use()
```

## Common Use Cases

```python
# Locking
from threading import Lock
lock = Lock()

with lock:
    # Critical section
    pass

# Temporary directory
import tempfile
with tempfile.TemporaryDirectory() as tmpdir:
    # Work in temp directory
    pass

# Timing
import time
with timeit():
    # Code to time
    pass
```

## Suppressing Exceptions

```python
# Return True in __exit__ to suppress
class SuppressError:
    def __exit__(self, exc_type, exc_val, exc_tb):
        return True  # Suppress all exceptions

with SuppressError():
    raise ValueError("This is suppressed")
```

---

# Generators

Generators are iterators that produce values lazily, one at a time.

## Basic Generator

```python
def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1

# Usage
for num in count_up_to(5):
    print(num)  # 1, 2, 3, 4, 5

# Or convert to list
list(count_up_to(5))  # [1, 2, 3, 4, 5]
```

## Generator Expression

```python
# Like list comprehension but lazy
squares = (x**2 for x in range(10))

for sq in squares:
    print(sq)

# With next()
gen = (x**2 for x in range(3))
next(gen)  # 0
next(gen)  # 1
next(gen)  # 4
```

## Sending Values to Generator

```python
def echo():
    while True:
        received = yield
        print(received)

g = echo()
next(g)  # Start generator
g.send("Hello")  # Prints: Hello
g.send("World")  # Prints: World
```

## Yield From

```python
def chain(*iterables):
    for it in iterables:
        yield from it

# Flattens nested iterables
list(chain([1, 2], [3, 4], [5, 6]))  # [1, 2, 3, 4, 5, 6]
```

## Infinite Generator

```python
def infinite_counter():
    n = 0
    while True:
        yield n
        n += 1

# Usage - be careful!
counter = infinite_counter()
next(counter)  # 0
next(counter)  # 1
```

## Performance

```python
# Memory efficient for large sequences
# Don't do this:
big_list = [x**2 for x in range(10_000_000)]  # Loads all in memory

# Do this instead:
big_gen = (x**2 for x in range(10_000_000))  # Lazy evaluation

for val in big_gen:
    if val > 100:
        break
    print(val)
```

## Generator Pipeline

```python
# Read large file line by line
def read_lines(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()

def filter_lines(lines, keyword):
    for line in lines:
        if keyword in line:
            yield line

def process_lines(lines):
    for line in lines:
        yield line.upper()

# Chain operations (memory efficient)
for result in process_lines(filter_lines(read_lines("log.txt"), "ERROR")):
    print(result)
```