---
title: Event Loop
prev:
    link: '/python/decorator'
    text: 'Decorator'
next:
    link: '/python/asyncio'
    text: 'Asyncio'
---

# Event Loop

The event loop is the core of asynchronous programming in Python. It enables handling multiple I/O operations concurrently within a single thread.

## How Event Loop Works

1. **Register Events**: Register callbacks for I/O operations (network, file) or timers
2. **Wait**: Monitor for event readiness (non-blocking)
3. **Execute**: Run associated callbacks when events are ready
4. **Repeat**: Continue processing until all tasks complete

## Event Loop in asyncio

```python
import asyncio

async def main():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

asyncio.run(main())
```

## Key Concepts

### Coroutines

```python
# Coroutine function
async def fetch_data():
    await asyncio.sleep(1)
    return "data"

# Calling coroutine
async def main():
    result = await fetch_data()
    print(result)
```

### Tasks

```python
# Create task from coroutine
async def main():
    task = asyncio.create_task(fetch_data())
    # Do other work
    result = await task
```

### Futures

```python
# Future represents eventual result
async def main():
    loop = asyncio.get_event_loop()
    future = loop.create_future()
    await future
```

## Running Event Loop

```python
# Primary way (Python 3.7+)
asyncio.run(main())

# Manual control
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
try:
    loop.run_until_complete(main())
finally:
    loop.close()
```

## Multiple Coroutines

```python
import asyncio

async def task1():
    await asyncio.sleep(1)
    return "Task 1"

async def task2():
    await asyncio.sleep(2)
    return "Task 2"

async def main():
    # Run concurrently
    results = await asyncio.gather(task1(), task2())
    print(results)  # ['Task 1', 'Task 2']

asyncio.run(main())
```