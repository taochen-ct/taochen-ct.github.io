---
title: Type Hints & Pydantic
prev:
    link: '/python/sqlalchemy'
    text: 'Database (SQLAlchemy)'
next:
    link: '/python/fastapi'
    text: 'FastAPI'
---

# Type Hints

Python type hints for better code quality and IDE support.

## Basic Types

```python
# Basic types
x: int = 10
y: float = 3.14
name: str = "Alice"
is_active: bool = True

# Collections
numbers: list[int] = [1, 2, 3]
names: list[str] = ["Alice", "Bob"]
coords: tuple[int, int] = (1, 2)
data: dict[str, int] = {"a": 1, "b": 2}
unique: set[int] = {1, 2, 3}
```

## Optional & Union

```python
from typing import Optional, Union

# Optional - can be None
name: Optional[str] = None
name: str | None = None  # Python 3.10+

# Union - multiple types
result: Union[int, str] = 10
result: int | str = 10  # Python 3.10+
```

## Callable

```python
from typing import Callable, TypeVar

# Function type
def callback(f: Callable[[int, int], int]) -> int:
    return f(1, 2)

# TypeVar
T = TypeVar('T')
def first(lst: list[T]) -> T | None:
    return lst[0] if lst else None
```

## Generics

```python
from typing import Generic, TypeVar

T = TypeVar('T')
U = TypeVar('U')

class Container(Generic[T]):
    def __init__(self, value: T):
        self.value = value

    def get(self) -> T:
        return self.value

# Multiple type parameters
class Pair(Generic[T, U]):
    def __init__(self, first: T, second: U):
        self.first = first
        self.second = second

# Usage
c: Container[int] = Container(10)
p: Pair[str, int] = Pair("age", 25)
```

## Protocol

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None:
        print("Drawing circle")

# Structural subtyping
def render(d: Drawable) -> None:
    d.draw()

c = Circle()
render(c)  # Works!
```

## TypedDict

```python
from typing import TypedDict, NotRequired

class UserDict(TypedDict):
    name: str
    age: int
    email: NotRequired[str]  # Optional field

# Usage
user: UserDict = {"name": "Alice", "age": 25}
user2: UserDict = {"name": "Bob", "age": 30, "email": "bob@example.com"}
```

## Type Guards

```python
from typing import TypeGuard

def is_string_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

# Usage - narrows type
def process(items: list[object]) -> None:
    if is_string_list(items):
        # items is narrowed to list[str]
        print(" ".join(items))
```

---

# Pydantic

Data validation using Python type annotations.

## Basic Model

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str
    age: int
    email: str | None = None

# Create instance
user = User(name="Alice", age=25)
print(user.name)
print(user.model_dump())

# From dict
data = {"name": "Bob", "age": 30}
user2 = User(**data)
```

## Field Validation

```python
from pydantic import Field, field_validator, model_validator
from typing import Annotated

class User(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=0, le=150)
    email: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if '@' not in v:
            raise ValueError('Invalid email')
        return v.lower()

    @model_validator(mode='after')
    def validate_model(self):
        if self.name == self.email:
            raise ValueError('name and email cannot match')
        return self
```

## Nested Models

```python
from pydantic import BaseModel

class Address(BaseModel):
    street: str
    city: str
    country: str

class User(BaseModel):
    name: str
    address: Address

# Nested validation
user = User(
    name="Alice",
    address={"street": "123 Main St", "city": "NYC", "country": "USA"}
)
```

## Config

```python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        frozen=True,  # Immutable
        extra='forbid',  # Reject extra fields
    )

    name: str
    age: int
```

## Aliases

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    first_name: str = Field(alias='firstName')
    last_name: str = Field(alias='lastName')

# Using alias
user = User(firstName='John', lastName='Doe')
print(user.first_name)  # "John"
print(user.model_dump(by_alias=True))  # {"firstName": "John", ...}
```

## Computed Fields

```python
from pydantic import computed_field

class Rectangle(BaseModel):
    width: float
    height: float

    @computed_field
    @property
    def area(self) -> float:
        return self.width * self.height

    @computed_field
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)
```

## Validation Error

```python
from pydantic import ValidationError

try:
    user = User(name="", age=-5)
except ValidationError as e:
    print(e.errors())
    # [
    #   {'type': 'string_too_short', 'loc': ('name',), 'msg': ..., 'input': ''},
    #   {'type': 'greater_than_equal', 'loc': ('age',), 'msg': ..., 'input': -5}
    # ]
```

## Settings

```python
from pydantic_settings import BaseSettings

class Settings(BaseModel):
    app_name: str = "My App"
    debug: bool = False
    database_url: str
    api_key: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Usage
settings = Settings()  # Loads from env
print(settings.database_url)
```

## Generic Models

```python
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar('T')

class Response(BaseModel, Generic[T]):
    data: T
    message: str
    status: int

# Usage
user_response: Response[User] = Response(
    data=User(name="Alice", age=25),
    message="success",
    status=200
)
```

## Migration from v1

```python
# v2 migration notes
# 1. Import from pydantic, not pydantic v1
from pydantic import BaseModel, Field

# 2. field_validator replaces @validator
@field_validator('name')
@classmethod
def name_must_be_valid(cls, v):
    return v

# 3. model_validator replaces @root_validator
@model_validator(mode='before')
def parse_data(cls, values):
    return values

# 4. Config is now model_config
class Model(BaseModel):
    model_config = ConfigDict(strict=True)
```