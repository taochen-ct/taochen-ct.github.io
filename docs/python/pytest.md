---
title: Testing with pytest
prev:
    link: '/python/context-gen'
    text: 'Context & Generators'
next:
    link: '/python/logging'
    text: 'Logging'
---

# pytest

pytest is the most popular Python testing framework.

## Installation

```bash
pip install pytest

# With coverage
pip install pytest-cov
```

## Basic Test

```python
# test_example.py
def test_addition():
    assert 1 + 1 == 2

def test_string():
    s = "hello"
    assert s.upper() == "HELLO"
    assert "he" in s
```

## Running Tests

```bash
pytest                  # Run all tests
pytest test_file.py     # Run specific file
pytest -v               # Verbose output
pytest -vv              # More verbose
pytest -k "test_name"   # Run matching tests
pytest --collect-only   # Show collected tests
```

## Assertions

```python
# Basic
assert x == y
assert x != y
assert x is y
assert x in y
assert x not in y

# With messages
assert result == expected, f"Expected {expected}, got {result}"

# Collections
assert [1, 2] == [1, 2]
assert {"a": 1} == {"a": 1}

# Exceptions
def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError):
        1 / 0

def test_exception_message():
    with pytest.raises(ValueError, match="invalid"):
        raise ValueError("invalid input")
```

## Fixtures

```python
import pytest

@pytest.fixture
def database():
    """Setup and teardown for tests"""
    db = Database()
    db.connect()
    yield db
    db.disconnect()

@pytest.fixture
def sample_user():
    return {"name": "John", "email": "john@example.com"}

# Use in test
def test_create_user(database, sample_user):
    user = database.create(sample_user)
    assert user["name"] == "John"
```

## Fixture Scope

```python
# Function (default) - runs per test
@pytest.fixture
def config():
    return load_config()

# Class - runs once per class
@pytest.fixture(scope="class")
def db_connection():
    return create_connection()

# Module - runs once per module
@pytest.fixture(scope="module")
def spark():
    return create_spark_session()

# Session - runs once per session
@pytest.fixture(scope="session")
def browser():
    return launch_browser()
```

## Parametrized Tests

```python
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
])
def test_double(input, expected):
    assert input * 2 == expected

# Multiple parameters
@pytest.mark.parametrize("a,b,result", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, result):
    assert a + b == result
```

## Mocking

```python
from unittest.mock import Mock, patch, MagicMock

# Mock function
def test_api_call():
    with patch('requests.get') as mock_get:
        mock_get.return_value = Mock(status_code=200, json=lambda: {"data": "test"})
        
        result = call_api()
        assert result["data"] == "test"

# Mock object
mock_obj = Mock()
mock_obj.method.return_value = "mocked"

# Spy - track calls
with patch('module.function', wraps=module.function) as spy:
    module.function()
    spy.assert_called_once()
```

## Skip and xfail

```python
import pytest

@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.version_info < (3, 9), reason="Requires Python 3.9+")
def test_new_feature():
    pass

@pytest.mark.xfail(reason="Known bug")
def test_known_bug():
    assert False
```

## Test Organization

```
project/
├── tests/
│   ├── __init__.py
│   ├── test_main.py
│   ├── test_auth/
│   │   ├── __init__.py
│   │   ├── test_login.py
│   │   └── test_register.py
│   └── fixtures/
│       └── conftest.py
└── pytest.ini
```

## pytest.ini

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --strict-markers
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
```

## Coverage

```bash
pytest --cov=src --cov-report=html
pytest --cov=src --cov-report=term-missing

# With fails
pytest --cov=src --cov-fail-under=80
```