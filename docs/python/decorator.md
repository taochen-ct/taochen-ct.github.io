---
title: Decorator
next: 
  text: 'Event Loop'
  link: '/python/eventloop'
prev:
  text: 'Garbage Collection'
  link: '/python/garbage-collection'
---

# Decorator

<br>

在 Python 中，装饰器是一种用于包装函数或方法的工具，可以对其行为进行修改或扩展。装饰器有两种常见的写法：一种是使用函数实现的装饰器，另一种是使用类实现的装饰器。

### 1. 使用函数实现装饰器

函数装饰器通常是最常见的装饰器写法。它本质上是一个函数，接收一个函数作为参数，并返回一个新函数。

#### 示例代码

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before the function is called.")
        result = func(*args, **kwargs)
        print("After the function is called.")
        return result
    return wrapper

@my_decorator
def say_hello(name):
    print(f"Hello, {name}!")

# 调用被装饰的函数
say_hello("Alice")
```

#### 输出结果

```
Before the function is called.
Hello, Alice!
After the function is called.
```

#### 说明

- `my_decorator` 是一个函数装饰器，它接收 `say_hello` 作为参数，并返回一个 `wrapper` 函数。
- `wrapper` 函数在调用原函数 `func` 前后分别打印一些信息，从而实现了功能扩展。

### 2. 使用类实现装饰器

类装饰器通过 `__call__` 方法实现。它允许装饰器持有状态或在类中定义更多的功能。

#### 示例代码

```python
class MyDecorator:
    def __init__(self, func):
        self.func = func

    def __call__(self, *args, **kwargs):
        print("Before the function is called.")
        result = self.func(*args, **kwargs)
        print("After the function is called.")
        return result

@MyDecorator
def say_hello(name):
    print(f"Hello, {name}!")

# 调用被装饰的函数
say_hello("Alice")
```

#### 输出结果

```
Before the function is called.
Hello, Alice!
After the function is called.
```

#### 说明

- `MyDecorator` 是一个类装饰器，它通过 `__init__` 方法保存被装饰的函数。
- `__call__` 方法使类的实例可以像函数一样被调用，类似于函数装饰器中的 `wrapper` 函数。

### 总结

- **函数装饰器**：简单直接，适合大多数不需要保持状态的场景。
- **类装饰器**：更灵活，适合需要在装饰器中保持状态或需要实现更多功能的场景。

这两种写法在功能上是等价的，但类装饰器可以持有更多的状态或逻辑，因此在需要更加复杂的装饰器时，类装饰器可能会更加合适。
