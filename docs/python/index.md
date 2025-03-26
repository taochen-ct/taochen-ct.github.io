---
title: Overview
prev: false
next:
    text: 'Garbage Collection'
    link: '/python/garbage-collection'
---

# Base Data Structure and Operations

<br>

Python 的基本语法简洁且易读，主要包括以下几个方面：

### 变量与数据类型
```python
x = 10         # 整数 (int)
y = 3.14       # 浮点数 (float)
name = "Alice" # 字符串 (str)
is_ok = True   # 布尔值 (bool)
nums = [1, 2, 3]  # 列表 (list)
info = {"name": "Bob", "age": 25}  # 字典 (dict)
```

### 控制流
条件判断 (if-elif-else)

```python
age = 18
if age >= 18:
    print("Adult")
elif age >= 12:
    print("Teenager")
else:
    print("Child")
```
循环 (for 和 while)

```python
# for 循环
for i in range(5):  
    print(i)  # 输出 0 到 4

# while 循环
count = 0
while count < 5:
    print(count)
    count += 1
```

### 函数

```python
def add(a, b):
    return a + b

result = add(3, 5)  # 8
```

### 面向对象编程 (OOP)

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, my name is {self.name}"
        
p = Person("Alice", 25)
print(p.greet())  # "Hello, my name is Alice"
```

### 异常处理

```python
try:
    x = 1 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
finally:
    print("Execution finished")
```

### 文件操作

```python
# 读取文件
with open("file.txt", "r") as f:
    content = f.read()

# 写入文件
with open("file.txt", "w") as f:
    f.write("Hello, World!")
```
   
### 模块与库

```python
import math
print(math.sqrt(16))  # 4.0

# 导入自定义模    
import mymodule 
```

### 列表推导式

```python
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]
```
   
### Lambda 匿名函数


```python
add = lambda x, y: x + y
print(add(3, 5))  # 8
```

### 多线程

```python
import threading

def worker():
    print("Thread is running")

t = threading.Thread(target=worker)
t.start()
t.join()
```



