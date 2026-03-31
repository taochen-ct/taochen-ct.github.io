---
title: Advanced Asyncio
prev:
    link: '/python/typing'
    text: 'Type Hints & Pydantic'
next:
    link: '/python/httpx'
    text: 'Async HTTP (httpx)'
---

# Advanced Asyncio

Advanced patterns for concurrent programming.

## TaskGroup (Python 3.11+)

```python
import asyncio

async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(coro1())
        task2 = tg.create_task(coro2())

    # All tasks completed here
    print(task1.result(), task2.result())

# Automatic cancellation on exception
async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(coro1())
            tg.create_task(coro_may_fail())  # raises exception
    except* ValueError as eg:
        print(f"Caught {eg.exceptions}")
```

## Structured Concurrency

```python
import asyncio

# Background task with structured concurrency
async def main():
    # Task is part of current task group
    async with asyncio.TaskGroup() as tg:
        tg.create_task(background_service())
        await asyncio.sleep(1)

    # background_service is cancelled when exiting

# Running in separate thread
async def background_service():
    try:
        while True:
            await asyncio.sleep(1)
            print("running")
    except asyncio.CancelledError:
        print("Cleaning up...")
        raise  # Re-raise to propagate
```

## Timeout

```python
import asyncio

# Method 1: asyncio.wait_for
async def main():
    try:
        result = await asyncio.wait_for(long_operation(), timeout=5.0)
    except asyncio.TimeoutError:
        print("Operation timed out")

# Method 2: asyncio.timeout (Python 3.11+)
async def main():
    try:
        async with asyncio.timeout(5.0):
            await long_operation()
    except asyncio.TimeoutError:
        print("Timed out")

# Timeout with shield (protect from cancellation)
async def main():
    try:
        async with asyncio.timeout(1.0):
            # This won't be cancelled even if timeout
            result = await asyncio.shield(critical_operation())
    except asyncio.TimeoutError:
        print("Timeout, but critical operation completed")
```

## gather with Options

```python
import asyncio

# Gather with return_exceptions
async def main():
    results = await asyncio.gather(
        coro1(),
        coro2(),
        return_exceptions=True  # Don't raise on first exception
    )

    for r in results:
        if isinstance(r, Exception):
            print(f"Error: {r}")
        else:
            print(f"Result: {r}")

# Gather with different tasks
async def main():
    # Run coroutines concurrently
    results = await asyncio.gather(
        asyncio.create_task(coro1()),
        asyncio.create_task(coro2()),
    )

# Control concurrency with semaphore
async def main():
    semaphore = asyncio.Semaphore(3)

    async def limited_coro(n):
        async with semaphore:
            await asyncio.sleep(1)
            return n

    results = await asyncio.gather(*[limited_coro(i) for i in range(10)])
```

## wait

```python
import asyncio

# Wait for tasks with timeout
async def main():
    tasks = [asyncio.create_task(coro(i)) for i in range(5)]

    done, pending = await asyncio.wait(
        tasks,
        timeout=2.0,
        return_when=asyncio.FIRST_COMPLETED
    )

    print(f"Done: {len(done)}")
    print(f"Pending: {len(pending)}")

    # Cancel pending
    for task in pending:
        task.cancel()
```

## Asyncio Queues

```python
import asyncio

# Producer-Consumer
async def producer(queue: asyncio.Queue, n: int):
    for i in range(n):
        await asyncio.sleep(0.5)
        await queue.put(i)
    await queue.put(None)  # Signal end

async def consumer(queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"Consumed: {item}")
        queue.task_done()

async def main():
    queue = asyncio.Queue()
    await asyncio.gather(
        producer(queue, 10),
        consumer(queue)
    )

# Priority queue
async def main():
    queue = asyncio.PriorityQueue()

    await queue.put((2, "low priority"))
    await queue.put((1, "high priority"))
    await queue.put((3, "medium priority"))

    # Get in priority order
    priority, item = await queue.get()
    print(item)  # "high priority"
```

## Event

```python
import asyncio

async def waiter(event: asyncio.Event):
    print("Waiting for event...")
    await event.wait()
    print("Event received!")

async def setter(event: asyncio.Event):
    await asyncio.sleep(2)
    event.set()

async def main():
    event = asyncio.Event()
    await asyncio.gather(
        waiter(event),
        setter(event)
    )
```

## Lock & Semaphore

```python
import asyncio

# asyncio.Lock - protect shared resource
async def access_shared_resource(n: int, lock: asyncio.Lock):
    async with lock:
        print(f"Task {n} acquired lock")
        await asyncio.sleep(1)
        print(f"Task {n} released lock")

async def main():
    lock = asyncio.Lock()
    await asyncio.gather(*[access_shared_resource(i, lock) for i in range(3)])

# asyncio.Semaphore - limit concurrency
async def limited_access(n: int, sem: asyncio.Semaphore):
    async with sem:
        print(f"Task {n} access granted")
        await asyncio.sleep(1)
        print(f"Task {n} access released")

async def main():
    sem = asyncio.Semaphore(2)  # Max 2 concurrent
    await asyncio.gather(*[limited_access(i, sem) for i in range(5)])
```

## Create Task Options

```python
import asyncio

async def main():
    # Options for create_task

    # 1. Basic
    task = asyncio.create_task(coro())

    # 2. With name (Python 3.8+)
    task = asyncio.create_task(coro(), name="my_task")
    print(task.get_name())

    # 3. With cancellation
    task = asyncio.create_task(coro())
    # Later...
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Cancelled")

    # 4. Wait for task in different context
    # (Advanced) Use contextvars for task-local state
```

## Async Generator

```python
import asyncio

# Async generator
async def async_range(start: int, stop: int):
    for i in range(start, stop):
        await asyncio.sleep(0.1)
        yield i

# Using async generator
async def main():
    async for num in async_range(0, 5):
        print(num)

    # Convert to list
    result = [x async for x in async_range(0, 5)]
```

## Async Context Manager

```python
import asyncio

class AsyncResource:
    async def __aenter__(self):
        await asyncio.sleep(0.1)  # Connect
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await asyncio.sleep(0.1)  # Disconnect
        return False

async def main():
    async with AsyncResource() as resource:
        # Use resource
        pass
    # Automatically cleaned up

# Create async context manager
from contextlib import asynccontextmanager

@asynccontextmanager
async def managed_connection():
    conn = await connect()
    try:
        yield conn
    finally:
        await conn.disconnect()
```

## Best Practices

```python
# 1. Use TaskGroup for multiple tasks
async with asyncio.TaskGroup() as tg:
    tg.create_task(coro1())
    tg.create_task(coro2())

# 2. Always handle CancelledError
try:
    await task
except asyncio.CancelledError:
    # Clean up
    raise  # or don't re-raise if handled

# 3. Use timeout to prevent infinite wait
await asyncio.wait_for(coro(), timeout=10)

# 4. Don't block in async code
# Bad
time.sleep(1)
# Good
await asyncio.sleep(1)

# 5. Use semaphore for rate limiting
sem = asyncio.Semaphore(10)
async def limited():
    async with sem:
        # ...
```