---
title: Goroutine and Concurrency
prev:
    link: '/golang/new-and-make'
    text: 'New and Make'
next: false
---

# Goroutine and Concurrency

## Goroutine

A goroutine is a lightweight thread managed by the Go runtime.

```go
// Start a goroutine
go func() {
    fmt.Println("Running in background")
}()

// Goroutine with function
go doWork()

func doWork() {
    for i := 0; i < 3; i++ {
        fmt.Println("Working...", i)
    }
}
```

## Channel

Channels are the pipes that connect concurrent goroutines.

### Basic Channel Operations

```go
// Create channel
ch := make(chan int)

// Send to channel
ch <- 10

// Receive from channel
value := <-ch

// Close channel
close(ch)
```

### Buffered Channel

```go
// Channel with buffer size
ch := make(chan int, 3)

// Can send 3 values without receiver
ch <- 1
ch <- 2
ch <- 3
```

### Select

Handle multiple channels simultaneously:

```go
select {
case msg := <-ch1:
    fmt.Println("Received from ch1:", msg)
case msg := <-ch2:
    fmt.Println("Received from ch2:", msg)
case <-time.After(time.Second):
    fmt.Println("Timeout")
default:
    fmt.Println("No activity")
}
```

### Range and Close

```go
// Receive until channel closed
for msg := range ch {
    fmt.Println(msg)
}

// Check if channel is closed
msg, ok := <-ch
if !ok {
    // Channel closed
}
```

## Synchronization

### WaitGroup

```go
var wg sync.WaitGroup

for i := 0; i < 3; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        fmt.Println("Worker", id)
    }(i)
}

wg.Wait() // Block until all done
```

### Mutex

```go
var (
    mu    sync.Mutex
    count int
)

// Lock before accessing
mu.Lock()
count++
mu.Unlock()

// Or use Lock with defer
mu.Lock()
defer mu.Unlock()
count++
```

### RWMutex

Multiple readers, single writer:

```go
var rwmu sync.RWMutex

// Read operation
rwmu.RLock()
defer rwmu.RUnlock()
value := data

// Write operation
rwmu.Lock()
defer rwmu.Unlock()
data = newValue
```

### Once

Ensure code runs exactly once:

```go
var once sync.Once
once.Do(func() {
    fmt.Println("This runs only once")
})
```

## Context

```go
// Create context with timeout
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// Pass to goroutine
go func(ctx context.Context) {
    select {
    case <-time.After(2 * time.Second):
        fmt.Println("Done")
    case <-ctx.Done():
        fmt.Println("Cancelled:", ctx.Err())
    }
}(ctx)
```

## Best Practices

1. **Don't communicate by sharing memory; share memory by communicating**
   ```go
   // Instead of shared variables, use channels
   result := make(chan int)
   go func() {
       result <- heavyComputation()
   }()
   ```

2. **Close channels from the sender side**
   ```go
   ch := make(chan int)
   go func() {
       defer close(ch)
       // send values
   }()
   ```

3. **Use select with default for non-blocking operations**
   ```go
   select {
   case msg := <-ch:
       fmt.Println(msg)
   default:
       fmt.Println("No message")
   }
   ```

4. **Handle goroutine leaks**
   ```go
   // Always signal goroutine to exit
   ctx, cancel := context.WithCancel(context.Background())
   defer cancel()

   go func(ctx context.Context) {
       for {
           select {
           case <-ctx.Done():
               return
           default:
               // work
           }
       }
   }(ctx)
   ```

## Patterns

### Fan-out, Fan-in

```go
func fanOut(in <-chan int, numWorkers int) []<-chan int {
    workers := make([]<-chan int, numWorkers)
    for i := 0; i < numWorkers; i++ {
        workers[i] = worker(in)
    }
    return workers
}

func fanIn(channels ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)

    output := func(ch <-chan int) {
        defer wg.Done()
        for n := range ch {
            out <- n
        }
    }

    wg.Add(len(channels))
    for _, ch := range channels {
        go output(ch)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

### Pipeline

```go
func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// Usage
for n := range square(generate(1, 2, 3, 4, 5)) {
    fmt.Println(n)
}
```