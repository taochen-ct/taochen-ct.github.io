---
title: FastAPI
prev:
    link: '/python/asyncio'
    text: 'Asyncio'
next: false
---

# FastAPI

FastAPI is a modern, high-performance Python web framework for building APIs with automatic documentation.

## Installation

```bash
# Basic
pip install fastapi

# With uvicorn (ASGI server)
pip install "fastapi[all]"

# Or separately
pip install fastapi uvicorn
```

## Basic Server

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

@app.post("/items/")
async def create_item(item: Item):
    return {"item": item, "message": "Item created"}
```

## Running Server

```bash
# Development
uvicorn main:app --reload

# Specify host and port
uvicorn main:app --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --workers 4

# With HTTPS
uvicorn main:app --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

## Path Parameters

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# With type validation - FastAPI validates automatically
@app.get("/users/{user_id}")
async def read_user(user_id: int):
    return {"user_id": user_id}
```

## Query Parameters

```python
from typing import Optional

@app.get("/items/")
async def read_items(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = None
):
    if q:
        return {"q": q, "skip": skip, "limit": limit}
    return {"skip": skip, "limit": limit}

# Required query parameter
@app.get("/items/required")
async def required_param(item_id: int):
    return {"item_id": item_id}
```

## Request Body

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

@app.post("/items/")
async def create_item(item: Item):
    item_dict = item.model_dump()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict
```

## Query Parameter Types

```python
# Multiple values
@app.get("/items/")
async def read_items(ids: list[int] = [1, 2, 3]):
    return {"ids": ids}

# Bool conversion
@app.get("/items/")
async def read_items(active: bool = False):
    return {"active": active}

# Path with slash
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}
```

## Response Model

```python
from pydantic import BaseModel
from typing import Optional

class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    username: str
    email: str

# Only fields in UserOut will be returned
@app.post("/users/", response_model=UserOut)
async def create_user(user: UserIn):
    return user
```

## Form Data

```python
from fastapi import FastAPI, Form

@app.post("/login/")
async def login(username: str = Form(), password: str = Form()):
    return {"username": username}
```

## File Upload

```python
from fastapi import FastAPI, UploadFile, File
from typing import UploadFile

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    content = await file.read()
    return {"filename": file.filename, "content_size": len(content)}

# Multiple files
@app.post("/uploadfiles/")
async def create_upload_files(files: list[UploadFile] = File(...)):
    return {"filenames": [f.filename for f in files]}
```

## Error Handling

```python
from fastapi import FastAPI, HTTPException

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id == 0:
        raise HTTPException(status_code=400, detail="Item ID cannot be 0")
    return {"item_id": item_id}

# Custom error handler
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=418,
        content={"message": "ValueError occurred"}
    )
```

## Dependencies

```python
from fastapi import Depends

# Simple dependency
async def common_parameters(q: str | None = None, skip: int = 0):
    return {"q": q, "skip": skip}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons

# Class dependency
class CommonQueryParams:
    def __init__(self, q: str | None = None, skip: int = 0):
        self.q = q
        self.skip = skip

@app.get("/items/")
async def read_items(commons: CommonQueryParams = Depends(CommonQueryParams)):
    return commons
```

## Middleware

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Background Tasks

```python
from fastapi import BackgroundTasks

def write_log(message: str):
    with open("log.txt", "a") as f:
        f.write(message)

@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_log, f"Notification sent to {email}")
    return {"message": "Notification sent"}
```

## WebSockets

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message: {data}")
    except Exception:
        await websocket.close()
```

## Testing

```python
# With TestClient
from fastapi.testclient import TestClient

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_item():
    response = client.post(
        "/items/",
        json={"name": "Test", "price": 10.0}
    )
    assert response.status_code == 200
```

## Project Structure

```
myapp/
├── main.py           # FastAPI app
├── models/
│   └── item.py       # Pydantic models
├── routers/
│   └── items.py      # Route handlers
├── dependencies/
│   └── auth.py       # Dependencies
├── schemas/
│   └── __init__.py
└── requirements.txt
```

## With Database (SQLAlchemy)

```python
from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/", response_model=list[User])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users
```