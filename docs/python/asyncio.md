---
title: Asyncio
prev:
    link: '/python/eventloop'
    text: 'Event Loop'
next:
    link: '/python/fastapi'
    text: 'FastAPI'
---

# Asyncio Guide

## Basic Usage

```python
import asyncio

async def main():
    # Simple sleep
    await asyncio.sleep(1)
    print("Done!")

asyncio.run(main())
```

## Concurrent Tasks

### gather()

Run multiple coroutines concurrently:

```python
async def fetch_url(url: str):
    await asyncio.sleep(1)  # Simulate network request
    return f"Data from {url}"

async def main():
    results = await asyncio.gather(
        fetch_url("http://example.com/1"),
        fetch_url("http://example.com/2"),
        fetch_url("http://example.com/3"),
    )
    for url, data in zip(["url1", "url2", "url3"], results):
        print(f"{url}: {data}")

asyncio.run(main())
```

### TaskGroup (Python 3.11+)

```python
async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(fetch_url("url1"))
        tg.create_task(fetch_url("url2"))
    # All tasks completed
```

### create_task()

Schedule coroutine to run soon:

```python
async def main():
    task = asyncio.create_task(my_async_func())
    # Do other work
    result = await task
```

### wait()

Wait for multiple tasks:

```python
async def main():
    tasks = [asyncio.create_task(task(i)) for i in range(5)]
    done, pending = await asyncio.wait(tasks)
```

## Async Context Managers

```python
class AsyncDBConnection:
    async def __aenter__(self):
        await asyncio.sleep(0.1)  # Simulate connection
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await asyncio.sleep(0.1)  # Simulate cleanup

async def main():
    async with AsyncDBConnection() as conn:
        await conn.query("SELECT 1")
```

## Async Generators

```python
async def async_range(start, stop):
    for i in range(start, stop):
        await asyncio.sleep(0.1)
        yield i

async def main():
    async for num in async_range(0, 5):
        print(num)
```

## Semaphore

Limit concurrent operations:

```python
semaphore = asyncio.Semaphore(3)

async def limited_task(n):
    async with semaphore:
        print(f"Task {n} started")
        await asyncio.sleep(1)
        print(f"Task {n} done")

async def main():
    await asyncio.gather(*[limited_task(i) for i in range(10)])
```

## Lock

Protect shared resource:

```python
lock = asyncio.Lock()
counter = 0

async def increment():
    global counter
    async with lock:
        counter += 1
        await asyncio.sleep(0.1)
        print(counter)

async def main():
    await asyncio.gather(*[increment() for _ in range(10)])
```

## Queue

Producer-consumer pattern:

```python
async def producer(queue: asyncio.Queue):
    for i in range(5):
        await asyncio.sleep(0.5)
        await queue.put(i)
    await queue.put(None)  # Signal done

async def consumer(queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"Consumed: {item}")

async def main():
    queue = asyncio.Queue()
    await asyncio.gather(
        producer(queue),
        consumer(queue),
    )
```

## Timeout

```python
import asyncio

async def long_task():
    await asyncio.sleep(10)
    return "Done"

# Option 1: asyncio.wait_for
async def main():
    try:
        result = await asyncio.wait_for(long_task(), timeout=2)
    except asyncio.TimeoutError:
        print("Task timed out")

# Option 2: asyncio.timeout (Python 3.11+)
async def main():
    try:
        async with asyncio.timeout(2):
            await long_task()
    except asyncio.TimeoutError:
        print("Timed out")
```

## Retry with Backoff

```python
async def retry_async(func, max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(delay * (attempt + 1))
```

## Real World Example

### HTTP Requests with aiohttp

```python
import aiohttp

async def fetch_all(urls: list[str]):
    async with aiohttp.ClientSession() as session:
        async def fetch(url):
            async with session.get(url) as response:
                return await response.text()

        tasks = [fetch(url) for url in urls]
        return await asyncio.gather(*tasks)

async def main():
    urls = [
        "https://api.example.com/users",
        "https://api.example.com/posts",
    ]
    results = await fetch_all(urls)
    for url, data in zip(urls, results):
        print(f"{url}: {len(data)} bytes")
```

### Async SQLite

```python
import aiosqlite

async def query_db():
    async with aiosqlite.connect(".db") as db:
        async with db.execute("SELECT * FROM users") as cursor:
            rows = await cursor.fetchall()
            return rows
```

## Best Practices

1. **Use asyncio.run()** as entry point
2. **Avoid blocking calls** in async functions:
   ```python
   # Bad
   time.sleep(10)

   # Good
   await asyncio.sleep(10)
   ```
3. **Use gather()** for concurrent operations
4. **Handle exceptions** in gather:
   ```python
   await asyncio.gather(task1(), task2(), return_exceptions=True)
   ```
5. **Use semaphores** to limit concurrency
6. **Cancel tasks** properly:
   ```python
   task = asyncio.create_task(long_operation())
   try:
       await task
   except asyncio.CancelledError:
       task.cancel()
       raise
   ```