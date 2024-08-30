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
vbnet
复制代码
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
vbnet
复制代码
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





# 项目使用

在这里使用了类装饰器的写法，在装饰器初始化时，添加属性，在被调用时根据配置选择策略来进行拦截和认证

```python
class ThirdPartyInterceptor:
    """拦截器"""

    def __init__(self, source_type="SHARE", auth_type="SNB"):
        self.auth_type = auth_type
        self.source_type = source_type
        self._strategy = None

    @property
    def strategy(self):
        if self._strategy is not None:
            return self._strategy
        if self.auth_type.lower() == AuthType.feishu.value:
            self._strategy = FeishuInterceptor()
        elif self.auth_type.lower() == AuthType.snb.value:
            self._strategy = SNBInterceptor()
        return self._strategy

    def __call__(self, method):
        async def wrapper(self_instance, *args, **kwargs):
            # 专题分析，图表库获取source_type
            source_type = None
            if self.source_type == "THEMATIC_CHART":
                source_type = (
                    "THEMATIC"
                    if self_instance.get_argument("type") != "render"
                    else "CHARTS_REPO"
                )
            try:
                if not self.strategy.intercept(
                    self_instance,
                    (source_type if source_type else self.source_type),
                    kwargs,
                ):
                    return
            except SkipAuth:
                pass
            except Redirect:
                self.strategy.handle_redirect_exception(self_instance, kwargs)
                return
            except NoAuth as e:
                self.strategy.handle_no_auth_exception(self_instance, error=e)
                return
            if inspect.iscoroutinefunction(method):
                await method(self_instance, *args, **kwargs)
            else:
                return method(self_instance, *args, **kwargs)

        return wrapper
```

### 主要组件

1. **初始化 (`__init__`)**:
   - 设置 `source_type` 和 `auth_type` 属性。
   - 将 `_strategy` 初始化为 `None`。
2. **属性方法 (`strategy`)**:
   - 检查 `_strategy` 是否已经设置，如果设置了则返回它。
   - 根据 `auth_type` 确定适当的策略（`FeishuInterceptor` 或 `SNBInterceptor`）。
3. **调用方法 (`__call__`)**:
   - 使得该类实例可以作为装饰器使用。
   - 将目标方法包装在一个异步函数 (`wrapper`) 中。
   - 根据 `self.source_type` 的条件确定 `source_type`。
   - 使用策略的 `intercept` 方法进行必要的拦截和检查。
   - 处理 `SkipAuth`、`Redirect` 和 `NoAuth` 等异常：
     - `SkipAuth`: 忽略认证检查。
     - `Redirect`: 处理重定向异常。
     - `NoAuth`: 处理没有认证的异常。
   - 如果目标方法是协程函数，则使用 `await` 调用它；否则直接调用同步方法。