---
title: Context Package
prev:
    link: '/golang/generics'
    text: 'Generics'
next:
    link: '/golang/testing'
    text: 'Testing'
---

# Context Package

Context for cancellation and deadlines in Go.

## Basic Usage

```go
import "context"

func main() {
    // Background context (never cancelled)
    ctx := context.Background()

    // Empty context (same as Background)
    ctx := context.TODO()

    // With cancellation
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    // Do work
    doWork(ctx)
}

func doWork(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            return
        default:
            // Work
        }
    }
}
```

## WithTimeout

```go
func main() {
    // Timeout of 3 seconds
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()

    result, err := fetchData(ctx)
    if err != nil {
        if ctx.Err() == context.DeadlineExceeded {
            fmt.Println("Request timed out")
        }
    }
}

func fetchData(ctx context.Context) (string, error) {
    // Simulate slow operation
    time.Sleep(5 * time.Second)
    return "data", nil
}
```

## WithDeadline

```go
func main() {
    // Deadline at specific time
    deadline := time.Now().Add(5 * time.Second)
    ctx, cancel := context.WithDeadline(context.Background(), deadline)
    defer cancel()

    result, err := fetchData(ctx)
    // ...
}
```

## WithValue

```go
func main() {
    // Store values in context
    ctx := context.WithValue(
        context.Background(),
        "userID",
        "12345",
    )

    // Pass through functions
    result := processRequest(ctx)
}

func processRequest(ctx context.Context) string {
    // Retrieve value
    userID := ctx.Value("userID").(string)
    return "Processing for " + userID
}
```

## Key Type for Values

```go
// Define key type (avoid string collisions)
type contextKey string

const (
    userIDKey contextKey = "userID"
    traceIDKey contextKey = "traceID"
)

func main() {
    ctx := context.WithValue(
        context.Background(),
        userIDKey,
        "12345",
    )

    // Get value
    userID := ctx.Value(userIDKey).(string)
}
```

## Cancellation

```go
func main() {
    ctx, cancel := context.WithCancel(context.Background())

    go func() {
        // Do some work
        time.Sleep(2 * time.Second)
        cancel() // Cancel the context
    }()

    select {
    case <-ctx.Done():
        fmt.Println("Cancelled:", ctx.Err())
    case <-time.After(5 * time.Second):
        fmt.Println("Timeout")
    }
}
```

## Nested Contexts

```go
func main() {
    // Parent context
    parent, cancelParent := context.WithTimeout(
        context.Background(),
        10*time.Second,
    )
    defer cancelParent()

    // Child with its own timeout
    child, cancelChild := context.WithTimeout(
        parent,
        3*time.Second,
    )
    defer cancelChild()

    // Child inherits parent's deadline but has shorter timeout
    select {
    case <-child.Done():
        fmt.Println("Child done:", child.Err())
    }
}
```

## HTTP Server

```go
import (
    "context"
    "net/http"
    "time"
)

func handler(w http.ResponseWriter, r *http.Request) {
    // Create context with timeout
    ctx, cancel := context.WithTimeout(
        r.Context(),
        5*time.Second,
    )
    defer cancel()

    // Pass to downstream
    result, err := doSlowOperation(ctx)
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }

    w.Write([]byte(result))
}

func doSlowOperation(ctx context.Context) (string, error) {
    select {
    case <-time.After(3 * time.Second):
        return "done", nil
    case <-ctx.Done():
        return "", ctx.Err()
    }
}
```

## Database Query

```go
import (
    "context"
    "database/sql"
)

func queryWithTimeout(ctx context.Context, db *sql.DB) error {
    // Create context with timeout
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    // Use context with query
    return db.QueryRowContext(ctx, "SELECT * FROM users WHERE id = ?", 1).Scan(&user)
}
```

## Goroutine-Safe Cancel

```go
func main() {
    ctx, cancel := context.WithCancel(context.Background())

    // Multiple goroutines can listen
    go worker(ctx, 1)
    go worker(ctx, 2)
    go worker(ctx, 3)

    time.Sleep(2 * time.Second)
    cancel()  // All workers receive cancellation

    time.Sleep(1 * time.Second)
}

func worker(ctx context.Context, id int) {
    for {
        select {
        case <-ctx.Done():
            fmt.Printf("Worker %d stopped\n", id)
            return
        default:
            fmt.Printf("Worker %d working\n", id)
            time.Sleep(500 * time.Millisecond)
        }
    }
}
```

## Best Practices

```go
// 1. Pass context as first argument
func fetchUser(ctx context.Context, id string) (*User, error)

// 2. Don't store context in structs
type Service struct {
    ctx context.Context  // Bad
}

// 3. Use WithTimeout for operations with deadlines
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()

// 4. Check for cancellation
select {
case <-ctx.Done():
    return ctx.Err()
default:
    // Continue
}

// 5. Use context values for request-scoped data
// (not for optional parameters)
```

## Custom Context

```go
// Create custom context with values
func withUserID(ctx context.Context, userID string) context.Context {
    return context.WithValue(ctx, "userID", userID)
}

// Extract with type safety
func getUserID(ctx context.Context) (string, bool) {
    val := ctx.Value("userID")
    if val == nil {
        return "", false
    }
    userID, ok := val.(string)
    return userID, ok
}
```