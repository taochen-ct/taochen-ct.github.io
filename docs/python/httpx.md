---
title: Async HTTP (httpx)
prev:
    link: '/python/advanced-asyncio'
    text: 'Advanced Asyncio'
next:
    link: '/python/poetry'
    text: 'Package Management'
---

# httpx

Async HTTP client for Python.

## Installation

```bash
pip install httpx
```

## Basic Usage

```python
import httpx

# Synchronous
response = httpx.get("https://example.com")
print(response.status_code)
print(response.text)

# Async
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://example.com")
        print(response.status_code)
        print(response.json())

asyncio.run(main())
```

## Client Configuration

```python
import httpx

# Create client with options
client = httpx.AsyncClient(
    base_url="https://api.example.com",
    timeout=10.0,
    headers={"Authorization": "Bearer token"},
    follow_redirects=True,
)

# Use base_url
response = await client.get("/users")  # GET https://api.example.com/users

await client.aclose()
```

## HTTP Methods

```python
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # GET
        response = await client.get("https://api.example.com/users")

        # POST with JSON
        response = await client.post(
            "https://api.example.com/users",
            json={"name": "Alice", "email": "alice@example.com"}
        )

        # PUT
        response = await client.put(
            "https://api.example.com/users/1",
            json={"name": "Bob"}
        )

        # PATCH
        response = await client.patch(
            "https://api.example.com/users/1",
            json={"age": 30}
        )

        # DELETE
        response = await client.delete("https://api.example.com/users/1")
```

## Query Parameters

```python
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # Dictionary
        response = await client.get(
            "https://api.example.com/users",
            params={"page": 1, "limit": 10}
        )

        # List
        response = await client.get(
            "https://api.example.com/users",
            params=[("page", 1), ("limit", 10)]
        )
```

## Headers

```python
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # Custom headers
        response = await client.get(
            "https://api.example.com/data",
            headers={
                "Authorization": "Bearer token",
                "X-Custom-Header": "value"
            }
        )

        # Content type
        response = await client.post(
            "https://api.example.com/data",
            content=b"binary data",
            headers={"Content-Type": "application/octet-stream"}
        )
```

## Request Body

```python
import httpx
import json

async def main():
    async with httpx.AsyncClient() as client:
        # JSON (automatic)
        response = await client.post(
            "https://api.example.com/users",
            json={"name": "Alice"}
        )

        # Form data
        response = await client.post(
            "https://api.example.com/login",
            data={"username": "alice", "password": "secret"}
        )

        # Multipart
        response = await client.post(
            "https://api.example.com/upload",
            files={"file": open("data.txt", "rb")}
        )

        # Raw bytes
        response = await client.post(
            "https://api.example.com/data",
            content=b"raw bytes"
        )
```

## Response Handling

```python
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/users/1")

        # Status
        print(response.status_code)
        print(response.reason_phrase)

        # Content
        print(response.text)           # String
        print(response.content)        # Bytes
        print(response.json())         # Parsed JSON

        # Headers
        print(response.headers)
        print(response.headers["Content-Type"])

        # Cookies
        print(response.cookies)
```

## Timeouts

```python
import httpx

# Global timeout
client = httpx.AsyncClient(timeout=10.0)

# Per-request timeout
response = await client.get(
    "https://api.example.com",
    timeout=5.0
)

# Detailed timeout
client = httpx.AsyncClient(
    timeout=httpx.Timeout(
        connect=5.0,
        read=10.0,
        write=5.0,
        pool=5.0  # Timeout for getting connection from pool
    )
)

# No timeout
client = httpx.AsyncClient(timeout=None)
```

## Error Handling

```python
import httpx
from httpx import ConnectError, TimeoutException, HTTPStatusError

async def main():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("https://api.example.com")
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            print(f"Status error: {e.response.status_code}")
        except httpx.ConnectError:
            print("Connection error")
        except httpx.TimeoutException:
            print("Request timed out")

# Auto-raise for 4xx/5xx
response = await client.get("https://api.example.com")
response.raise_for_status()
```

## Retry

```python
import httpx
from httpx import Retry

# Automatic retry
client = httpx.AsyncClient(
    mounts=[
        httpx.Mount(
            "http://",
            transport=httpx.HTTPTransport(retries=1)
        ),
        httpx.Mount(
            "https://",
            transport=httpx.HTTPTransport(retries=3)  # Retry 3 times
        )
    ]
)

# More control
retry_strategy = Retry(
    total=3,
    backoff_factor=0.5,
    status_forcelist=[500, 502, 503, 504],
    allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE"]
)

transport = httpx.HTTPTransport(retries=retry_strategy)
client = httpx.AsyncClient(transport=transport)
```

## Streaming

```python
import httpx

# Streaming response
async def main():
    async with httpx.AsyncClient() as client:
        async with client.stream("GET", "https://api.example.com/large") as response:
            # Process chunk by chunk
            async for chunk in response.aiter_bytes():
                print(chunk)

            # Or iter text
            async for text in response.aiter_text():
                print(text)

        # Response is closed automatically
```

## Cookies

```python
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # Send cookies
        response = await client.get(
            "https://api.example.com",
            cookies={"session": "abc123"}
        )

        # Get cookies from response
        print(response.cookies)
        print(response.cookies.get("session_id"))

        # Persist cookies across requests
        client = httpx.AsyncClient(cookies={"session": "abc123"})
        # All requests will include this cookie
```

## HTTP/2

```python
import httpx

# HTTP/2 support (automatic negotiation)
client = httpx.AsyncClient(http2=True)

# Check if connection is HTTP/2
async with client.stream("GET", "https://example.com") as response:
    print(response.extensions.get("http_version"))
```

## Sync Client

```python
import httpx

# Synchronous usage
with httpx.Client() as client:
    response = client.get("https://api.example.com")
    print(response.json())

# Context manager ensures connection closure
```

## Best Practices

```python
# 1. Reuse client
client = httpx.AsyncClient(base_url="https://api.example.com")

# 2. Use context manager
async with httpx.AsyncClient() as client:
    response = await client.get("/endpoint")

# 3. Set appropriate timeouts
client = httpx.AsyncClient(timeout=httpx.Timeout(10.0))

# 4. Handle errors explicitly
try:
    response = await client.get(url)
    response.raise_for_status()
except httpx.HTTPStatusError:
    # Handle

# 5. Use params for query strings
response = await client.get("/search", params={"q": "query"})
```