---
title: Error Handling
prev:
    link: '/golang/interface'
    text: 'Interface'
next:
    link: '/golang/database'
    text: 'Database'
---

# Error Handling

Go's explicit error handling approach.

## Basic Error

```go
import "errors"

func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    fmt.Println("Error:", err)
    return
}
fmt.Println("Result:", result)
```

## Custom Errors

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return e.Field + ": " + e.Message
}

func validate(name string) error {
    if name == "" {
        return &ValidationError{Field: "name", Message: "cannot be empty"}
    }
    return nil
}
```

## Error Wrapping

```go
import "fmt"
import "errors"

func readFile(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        // Wrap with context
        return nil, fmt.Errorf("failed to read file %s: %w", path, err)
    }
    return data, nil
}

// Check wrapped error
if errors.Is(err, os.ErrNotExist) {
    // File doesn't exist
}

// Unwrap for type assertion
var pathErr *os.PathError
if errors.As(err, &pathErr) {
    fmt.Println("Failed at:", pathErr.Path)
}
```

## Error Types

```go
// Sentinel errors
var (
    ErrNotFound = errors.New("not found")
    ErrInvalid  = errors.New("invalid input")
)

// Using with Is/As
if errors.Is(err, ErrNotFound) {
    // Handle not found
}

// Custom error type
type AppError struct {
    Code    int
    Message string
    Err     error
}

func (e *AppError) Error() string {
    return e.Message
}

func (e *AppError) Unwrap() error {
    return e.Err
}
```

## Panic and Recover

```go
func safeCall(fn func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic: %v", r)
        }
    }()
    fn()
    return nil
}

// Custom panic/recover
func handlePanic() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered:", r)
        }
    }()
    panic("something went wrong")
}
```

## Error Handling Patterns

```go
// Option 1: Check and return
func process() error {
    err := doSomething()
    if err != nil {
        return fmt.Errorf("doSomething failed: %w", err)
    }
    return nil
}

// Option 2: Handle immediately
func process() error {
    if err := doSomething(); err != nil {
        return err
    }
    return nil
}

// Option 3: Multiple errors
func processAll() error {
    var errs []error
    
    if err := step1(); err != nil {
        errs = append(errs, fmt.Errorf("step1: %w", err))
    }
    if err := step2(); err != errs, fmt.Errorf("step2: %w", err))
    }
    
    if len(errs) > 0 {
        return errors.Join(errs...)
    }
    return nil
}

// Option 4: Log and continue
func process() {
    if err := doSomething(); err != nil {
        log.Printf("warning: doSomething failed: %v", err)
    }
}
```

## Error Variables

```go
var (
    ErrNotFound    = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
)

func getUser(id int) (*User, error) {
    if id == 0 {
        return nil, ErrNotFound
    }
    // ...
    if !authorized {
        return nil, ErrUnauthorized
    }
    return &User{ID: id}, nil
}

// Usage
user, err := getUser(1)
if errors.Is(err, ErrNotFound) {
    // Handle not found
}
```

## Best Practices

```go
// 1. Return errors, don't log and continue
func bad() error {
    if err := doThing(); err != nil {
        log.Println(err)  // BAD: still returns nil
    }
    return nil
}

func good() error {
    if err := doThing(); err != nil {
        return err  // GOOD: propagate error
    }
    return nil
}

// 2. Wrap errors with context
func bad() error {
    return os.ReadFile("config.json")  // BAD: no context
}

func good() error {
    data, err := os.ReadFile("config.json")
    if err != nil {
        return fmt.Errorf("read config: %w", err)  // GOOD: wraps
    }
    return nil
}

// 3. Use sentinel errors for known conditions
// 4. Use custom errors for domain-specific errors
// 5. Handle errors at the appropriate level
```