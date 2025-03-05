---
prev: false
next:
   text: 'Garbage Collection'
   link: '/golang/garbage-collection'
---


# 基本语法

<br>

##### 数组和切片操作

Go 的数组和切片是处理集合的基本数据结构：

| 数据结构  | 语法                   | 时间复杂度 | 空间复杂度 | 描述                         |
|-------|----------------------|-------|-------|----------------------------|
| Array | `var arr [n]T`       | O(1)  | O(n)  | 声明一个固定大小为 `n`、类型为 `T` 的数组。 |
|       | `arr[index]`         | O(1)  | O(1)  | 访问指定索引处的元素。                |
|       | `arr[index] = value` | O(1)  | O(1)  | 更新指定索引处的元素。                |

##### 切片

| 数据结构  | 语法                                     | 时间复杂度   | 空间复杂度 | 描述                    |
|-------|----------------------------------------|---------|-------|-----------------------|
| Slice | `slice := arr[start:end]`              | O(1)    | O(1)  | 从数组或另一个切片创建切片。        |
|       | `slice := make([]T, length, capacity)` | O(1)    | O(n)  | 创建具有指定长度和容量的切片。       |
|       | `append(slice, value)`                 | 分摊 O(1) | O(n)  | 将元素追加到切片尾部。           |
|       | `len(slice)`                           | O(1)    | O(1)  | 返回切片中元素个数。            |
|       | `cap(slice)`                           | O(1)    | O(1)  | 返回切片容量。               |
|       | `copy(dst, src)`                       | O(n)    | O(1)  | 将元素从 `src` 拷贝到 `dst`。 |

##### Map 和结构操作

| 数据结构 | 语法                        | 时间复杂度   | 空间复杂度 | 描述                           |
|------|---------------------------|---------|-------|------------------------------|
| Map  | `m := make(map[K]V)`      | O(1)    | O(n)  | 创建一个新的空映射，键类型为 `K`，值类型为 `V`。 |
|      | `m[key] = value`          | 平均 O(1) | O(1)  | 在映射中插入或更新键值对。                |
|      | `value = m[key]`          | 平均 O(1) | O(1)  | 检索与键关联的值。                    |
|      | `delete(m, key)`          | 平均 O(1) | O(1)  | 从映射中删除键值对。                   |
|      | `value, exists := m[key]` | 平均 O(1) | O(1)  | 检查映射中是否存在键。                  |
|      | `len(m)`                  | O(1)    | O(1)  | 返回映射中键值对的个数。                 |

##### 结构

| 数据结构   | 语法                                   | 时间复杂度 | 空间复杂度 | 描述                |
|--------|--------------------------------------|-------|-------|-------------------|
| Struct | `type Person struct { Name string }` | O(1)  | O(1)  | 定义新数据类型 `Person`。 |
|        | `p := Person{Name: "Alice"}`         | O(1)  | O(1)  | 创建 `Person` 的新实例。 |
|        | `p.Name`                             | O(1)  | O(1)  | 访问或修改结构体中的字段。     |
|        | Embedded Structs                     | O(1)  | O(1)  | 结构体可以包含其他结构体。     |
|        | Tags                                 | O(1)  | O(1)  | 结构字段可以有元数据标记。     |

##### 字符串和迭代器操作

| 函数            | 语法                                | 时间复杂度 | 空间复杂度 | 描述                      |
|---------------|-----------------------------------|-------|-------|-------------------------|
| Length        | `len(s)`                          | O(1)  | O(1)  | 返回字符串长度。                |
| Concatenation | `s = s1 + s2`                     | O(n)  | O(n)  | 连接两个字符串。                |
| Substring     | `substr = s[start:end]`           | O(1)  | O(1)  | 从字符串中获取子串。              |
| Contains      | `strings.Contains(s, substr)`     | O(n)  | O(1)  | 检查 `s` 是否包含子串 `substr`。 |
| Split         | `strings.Split(s, sep)`           | O(n)  | O(n)  | 用 `sep` 切割字符串。          |
| Replace       | `strings.Replace(s, old, new, n)` | O(n)  | O(n)  | 将‘ old ’替换为‘ new ’。     |
| ToUpper       | `strings.ToUpper(s)`              | O(n)  | O(n)  | 将字符串转换为大写。              |
| TrimSpace     | `strings.TrimSpace(s)`            | O(n)  | O(n)  | 去除字符串前后的空白。             |
| Index         | `strings.Index(s, substr)`        | O(n)  | O(1)  | 返回 `substr` 第一次出现的索引。   |
| Join          | `strings.Join(slice, sep)`        | O(n)  | O(n)  | 将切片的元素连接成单个字符串。         |

##### 迭代

| 循环类型          | 语法                                        | 时间复杂度 | 空间复杂度 | 描述                   |
|---------------|-------------------------------------------|-------|-------|----------------------|
| For Loop      | `for i := 0; i < n; i++ {}`               | O(n)  | O(1)  | 从 `0` 到 `n-1` 的标准循环。 |
| For Range     | `for index, value := range collection {}` | O(n)  | O(1)  | 迭代集合中的元素。            |
| Infinite Loop | `for { /* code */ }`                      | 看情况   | O(1)  | 创建无限循环，直到满足中断条件。     |

##### Goroutine

| 操作    | 语法                  | 时间复杂度 | 空间复杂度 | 描述                                 |
|-------|---------------------|-------|-------|------------------------------------|
| Start | `go functionName()` | O(1)  | O(1)  | 启动一个执行 `functionName` 的 goroutine。 |

##### 通道（Channel）

| 操作           | 语法                             | 时间复杂度         | 空间复杂度 | 描述                |
|--------------|--------------------------------|---------------|-------|-------------------|
| Create       | `ch := make(chan T)`           | O(1)          | O(1)  | 创建类型为 `T` 的非缓冲通道。 |
| Buffered     | `ch := make(chan T, capacity)` | O(1)          | O(n)  | 创建特定容量的缓冲通道。      |
| Send         | `ch <- value`                  | O(1)          | O(1)  | 向通道发送值。           |
| Receive      | `value := <-ch`                | O(1)          | O(1)  | 从通道接收值。           |
| Close        | `close(ch)`                    | O(1)          | O(1)  | 关闭通道。             |
| Select       | `select { case ... }`          | O(1) per case | O(1)  | 等待多通道操作。          |
| Default Case | `default:`                     | O(1)          | O(1)  | 当没有其他事件发生时执行。     |

##### 同步原语

| 原语        | 语法                      | 时间复杂度 | 空间复杂度 | 描述                       |
|-----------|-------------------------|-------|-------|--------------------------|
| WaitGroup | `var wg sync.WaitGroup` | O(1)  | O(1)  | 同步多个 goroutine。          |
|           | `wg.Add(delta)`         | O(1)  | O(1)  | 向WaitGroup计数器增加 `delta`。 |
|           | `wg.Done()`             | O(1)  | O(1)  | WaitGroup计数器减1。          |
|           | `wg.Wait()`             | O(1)  | O(1)  | 阻塞直到WaitGroup计数器为零。      |
| Mutex     | `var mu sync.Mutex`     | O(1)  | O(1)  | 确保临界区互斥。                 |
|           | `mu.Lock()`             | O(1)  | O(1)  | 锁定互斥对象。                  |
|           | `mu.Unlock()`           | O(1)  | O(1)  | 解锁互斥对象。                  |
| RWMutex   | `var rwmu sync.RWMutex` | O(1)  | O(1)  | 允许多读单写。                  |
|           | `rwmu.RLock()`          | O(1)  | O(1)  | 锁定读互斥锁。                  |
|           | `rwmu.RUnlock()`        | O(1)  | O(1)  | 解锁读互斥锁。                  |
|           | `rwmu.Lock()`           | O(1)  | O(1)  | 锁定写互斥锁。                  |
|           | `rwmu.Unlock()`         | O(1)  | O(1)  | 解锁写互斥锁。                  |
| Once      | `var once sync.Once`    | O(1)  | O(1)  | 确保函数只被调用一次。              |
|           | `once.Do(func())`       | O(1)  | O(1)  | 如果尚未完成，则调用该函数。           |
| Cond      | `var cond *sync.Cond`   | O(1)  | O(1)  | 实现条件变量。                  |
|           | `cond.Wait()`           | O(1)  | O(1)  | 等待信号。                    |
|           | `cond.Signal()`         | O(1)  | O(1)  | 唤醒一个等待的 goroutine。       |
|           | `cond.Broadcast()`      | O(1)  | O(1)  | 唤醒所有等待的 goroutine。       |

##### 文件 I/O 和系统操作

| 操作          | 语法                                 | 时间复杂度 | 空间复杂度 | 描述                |
|-------------|------------------------------------|-------|-------|-------------------|
| Open File   | `file, err := os.Open(filename)`   | O(1)* | O(1)  | 打开准备读取的文件。        |
| Create File | `file, err := os.Create(filename)` | O(1)* | O(1)  | 创建或打开用于写入的文件。     |
| Read        | `n, err := file.Read(buf)`         | O(n)* | O(1)  | 将数据读取到缓冲区 `buf`。  |
| Write       | `n, err := file.Write(data)`       | O(n)* | O(1)  | 将数据从 `data` 写入文件。 |
| Close       | `err := file.Close()`              | O(1)* | O(1)  | 关闭文件。             |
| Stat        | `info, err := os.Stat(filename)`   | O(1)* | O(1)  | 获取文件信息。           |
| Remove      | `err := os.Remove(filename)`       | O(1)* | O(1)  | 删除文件。             |

##### 错误处理和调试

| 操作         | 语法                               | 时间复杂度 | 空间复杂度 | 描述                  |
|------------|----------------------------------|-------|-------|---------------------|
| Create     | `err := errors.New("message")`   | O(1)  | O(1)  | 创建带描述消息的新错误。        |
| Return     | `return value, err`              | O(1)  | O(1)  | 返回错误。               |
| Check      | `if err != nil { /* handle */ }` | O(1)  | O(1)  | 检查是否发生错误。           |
| Wrap Error | `fmt.Errorf("... %w", err)`      | O(1)  | O(1)  | 用附加上下文包装现有错误。       |
| Unwrap     | `errors.Unwrap(err)`             | O(1)  | O(1)  | 检索链中的下一个错误。         |
| Is         | `errors.Is(err, targetErr)`      | O(n)  | O(1)  | 检查错误是否与目标错误匹配。      |
| As         | `errors.As(err, &targetType)`    | O(n)  | O(1)  | 检查是否可以将错误强制转换为特定类型。 |

##### 调试

| 工具           | 语法                               | 描述              |
|--------------|----------------------------------|-----------------|
| `fmt.Printf` | `fmt.Printf("Value: %v", value)` | 为调试目的格式化并打印变量。  |
| `log.Fatal`  | `log.Fatal(err)`                 | 记录错误消息并退出。      |
| `panic`      | `panic("message")`               | 停止执行并打印堆栈跟踪。    |
| `recover`    | `recover()`                      | 从延迟函数的panic中恢复。 |

##### 反射

| 操作        | 语法                        | 时间复杂度 | 空间复杂度 | 描述                            |
|-----------|---------------------------|-------|-------|-------------------------------|
| Get Type  | `t := reflect.TypeOf(x)`  | O(1)  | O(1)  | 获取 `x` 的类型。                   |
| Get Value | `v := reflect.ValueOf(x)` | O(1)  | O(1)  | 获取 `x` 的值。                    |
| Set Value | `v.Set(newValue)`         | O(1)  | O(1)  | 设置新值; `v` 必须是可设置的。            |
| Kind      | `k := t.Kind()`           | O(1)  | O(1)  | 获取类型种类 (`struct`, `int`, 等等)。 |
| NumField  | `n := t.NumField()`       | O(1)  | O(1)  | 获取结构中字段的数目。                   |
| Field     | `f := v.Field(i)`         | O(1)  | O(1)  | 通过索引访问字段。                     |

##### 同步软件包

| 原语        | 语法                                              | 时间复杂度 | 空间复杂度 | 描述         |
|-----------|-------------------------------------------------|-------|-------|------------|
| sync.Map  | `var m sync.Map`                                | O(1)  | O(n)  | 支持并发安全的映射。 |
|           | `m.Store(key, value)`                           | O(1)  | O(1)  | 保存键值对。     |
|           | `value, ok := m.Load(key)`                      | O(1)  | O(1)  | 通过键获取值。    |
|           | `m.Delete(key)`                                 | O(1)  | O(1)  | 删除键值对。     |
|           | `m.Range(func(k, v interface{}) bool)`          | O(n)  | O(1)  | 迭代所有键值对。   |
| sync.Pool | `var p = sync.Pool{New: func() interface{} {}}` | O(1)  | O(n)  | 临时对象池。     |
|           | `p.Get()`                                       | O(1)  | O(1)  | 从池中检索对象。   |
|           | `p.Put(x)`                                      | O(1)  | O(1)  | 返回对象到对象池。  |

##### 上下文软件包

| 操作          | 语法                                                        | 描述                |
|-------------|-----------------------------------------------------------|-------------------|
| Background  | `ctx := context.Background()`                             | 返回空上下文。           |
| WithCancel  | `ctx, cancel := context.WithCancel(parentCtx)`            | 创建一个可取消的上下文。      |
| WithTimeout | `ctx, cancel := context.WithTimeout(parentCtx, duration)` | 设置超时时间。           |
| WithValue   | `ctx := context.WithValue(parentCtx, key, value)`         | 向上下文添加一个值。        |
| Done        | `<-ctx.Done()`                                            | 等待上下文被取消或超时。      |
| Err         | `err := ctx.Err()`                                        | 返回错误，解释上下文被取消的原因。 |

##### JSON 编解码

| 操作        | 语法                                | 时间复杂度 | 空间复杂度 | 描述                           |
|-----------|-----------------------------------|-------|-------|------------------------------|
| Marshal   | `data, err := json.Marshal(v)`    | O(n)  | O(n)  | 将 Go 值 `v` 转成 JSON。          |
| Unmarshal | `err := json.Unmarshal(data, &v)` | O(n)  | O(n)  | 将JSON数据解析为 Go 值 `v`.         |
| Decoder   | `dec := json.NewDecoder(r)`       | O(1)  | O(1)  | 从 `io.Reader` 创建JSON解码器。     |
| Encoder   | `enc := json.NewEncoder(w)`       | O(1)  | O(1)  | 创建一个写入 `io.Writer` 的JSON编码器。 |
