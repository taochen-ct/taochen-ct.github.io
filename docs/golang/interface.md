---
title: Interface
prev:
    link: '/golang/goroutine'
    text: 'Goroutine & Concurrency'
next:
    link: '/golang/error'
    text: 'Error Handling'
---

# Interface

Interfaces define behavior contracts without specifying implementation.

## Basic Interface

```go
// Define interface
type Writer interface {
    Write(p []byte) (n int, err error)
}

// Implement implicitly
type MyWriter struct{}

func (w MyWriter) Write(p []byte) (n int, err error) {
    // Implementation
    return len(p), nil
}

// Use interface
func WriteTo(w io.Writer, data string) {
    w.Write([]byte(data))
}
```

## Interface with Multiple Methods

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Combined interface
type ReadCloser interface {
    Reader
    Closer
}
```

## Empty Interface

```go
// Accept any type
func printValue(v interface{}) {
    fmt.Println(v)
}

// Type assertion
func process(v interface{}) {
    str, ok := v.(string)
    if ok {
        fmt.Println("String:", str)
    }
}

// Switch on type
func process(v interface{}) {
    switch v := v.(type) {
    case string:
        fmt.Println("String:", v)
    case int:
        fmt.Println("Int:", v)
    default:
        fmt.Println("Unknown type")
    }
}
```

## Type Assertion

```go
var i interface{} = "hello"

// Basic
str := i.(string)

// Safe with ok
str, ok := i.(string)
if !ok {
    // Not a string
}

// Type switch
switch v := i.(type) {
case string:
    // v is string
case int:
    // v is int
}
```

## Common Interfaces

```go
// Stringer (fmt.Stringer)
type Stringer interface {
    String() string
}

type Person struct {
    Name string
}

func (p Person) String() string {
    return "Person: " + p.Name
}

// Error
type Error interface {
    Error() string
}

// The empty interface (any type)
var anything interface{} = 42
anything = "string"
anything = []int{1, 2, 3}
```

## Interface Composition

```go
type ReadWriter interface {
    Reader
    Writer
}

type ReadCloser interface {
    Reader
    Closer
}

// Embedding
type ReadWriteCloser interface {
    ReadWriter
    Closer
}
```

## Practical Example

```go
type Storage interface {
    Save(key string, data []byte) error
    Load(key string) ([]byte, error)
    Delete(key string) error
}

type FileStorage struct {
    path string
}

func (f FileStorage) Save(key string, data []byte) error {
    return os.WriteFile(f.path+"/"+key, data, 0644)
}

func (f FileStorage) Load(key string) ([]byte, error) {
    return os.ReadFile(f.path + "/" + key)
}

func (f FileStorage) Delete(key string) error {
    return os.Remove(f.path + "/" + key)
}

// Use with any implementation
func SaveData(s Storage, key string, data []byte) error {
    return s.Save(key, data)
}
```

## Nil Interface

```go
var w io.Writer  // nil, not nil interface but with nil value

// Check for nil interface
var w io.Writer
if w == nil {
    fmt.Println("w is nil")
}

// Check if interface holds nil value
var w io.Writer = (*MyWriter)(nil)
if w == nil {
    fmt.Println("w is nil")  // Won't print! Interface is not nil
}
```

## Best Practices

```go
// 1. Use small interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// io.ReadCloser, io.ReadWriter, etc. combine them

// 2. Don't export interfaces unless needed
// Prefer concrete types, accept interfaces

func WriteTo(w io.Writer) {  // Returns io.Writer, takes io.Reader
    // ...
}

// 3. Interface usually defined near usage
// Not in the type definition file
```