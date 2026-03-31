---
title: Logging
prev:
    link: '/python/pytest'
    text: 'Testing (pytest)'
next:
    link: '/python/sqlalchemy'
    text: 'Database (SQLAlchemy)'
---

# Logging

Python's logging module for application logging.

## Basic Usage

```python
import logging

# Create logger
logger = logging.getLogger(__name__)

# Set level
logger.setLevel(logging.DEBUG)

# Add handler
handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG)
logger.addHandler(handler)

# Log messages
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical message")
```

## Configuration

### Basic Config

```python
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
```

### From File

```ini
# logging.conf
[loggers]
keys=root,myapp

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=DEBUG
handlers=consoleHandler

[logger_myapp]
level=DEBUG
handlers=fileHandler
qualname=myapp
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=DEBUG
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=INFO
formatter=simpleFormatter
args=('app.log', 'a')

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

```python
logging.config.fileConfig('logging.conf')
```

### From Dict

```python
config = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'default'
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'app.log',
            'formatter': 'default'
        }
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file']
    }
}

logging.config.dictConfig(config)
```

## Handlers

```python
# Console
console = logging.StreamHandler()
console.setLevel(logging.DEBUG)

# File
file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.INFO)

# Rotating File
from logging.handlers import RotatingFileHandler
rotate = RotatingFileHandler('app.log', maxBytes=10_000_000, backupCount=5)

# Timed Rotating
from logging.handlers import TimedRotatingFileHandler
timed = TimedRotatingFileHandler('app.log', when='midnight', interval=1, backupCount=30)

# Syslog
import logging.handlers
syslog = logging.handlers.SysLogHandler(address='/dev/log')
```

## Formatters

```python
# Simple
formatter = logging.Formatter('%(levelname)s - %(message)s')

# Detailed
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - '
    '%(filename)s:%(lineno)d - %(message)s'
)

# Custom
class CustomFormatter(logging.Formatter):
    def format(self, record):
        # Add custom fields
        record.custom = "custom_value"
        return super().format(record)
```

## Logger Hierarchy

```python
# Parent logger
app_logger = logging.getLogger('myapp')

# Child loggers
auth_logger = logging.getLogger('myapp.auth')
db_logger = logging.getLogger('myapp.db')

# Configure parent - children inherit
app_logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
app_logger.addHandler(handler)

# myapp.auth uses parent's settings
auth_logger.info("Auth message")  # Gets logged
```

## Custom Logger for Module

```python
# mymodule.py
import logging
logger = logging.getLogger(__name__)

def do_something():
    logger.debug("Doing something")

# main.py
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("mymodule")
logger.debug("Debug from main")
```

## Contextvars (for async)

```python
import logging
from contextvars import ContextVar

request_id: ContextVar[str] = ContextVar('request_id', default='-')

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id.get()
        return True

handler = logging.StreamHandler()
handler.addFilter(RequestIdFilter())
logging.basicConfig(handlers=[handler], format='%(request_id)s - %(message)s')
```

## Best Practices

```python
# __init__.py or app.py
import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

# Use module logger
logger = logging.getLogger(__name__)

# Don't do this (pollutes root logger)
logging.info("message")  # BAD

# Do this instead
logger = logging.getLogger(__name__)
logger.info("message")   # GOOD
```

## Log Levels

| Level | Value | Description |
|-------|-------|-------------|
| CRITICAL | 50 | Fatal errors |
| ERROR | 40 | Errors |
| WARNING | 30 | Warnings |
| INFO | 20 | General info |
| DEBUG | 10 | Debug info |
| NOTSET | 0 | Not set |