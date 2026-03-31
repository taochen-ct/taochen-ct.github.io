---
title: Overview
prev: false
next:
    text: 'Garbage Collection'
    link: '/golang/garbage-collection'
---

# Golang

Go is a statically typed, compiled programming language designed for simplicity and high performance.

## Basic Commands

```bash
# Run program
go run main.go

# Build binary
go build -o app main.go

# Run tests
go test ./...

# Format code
go fmt ./...

# Get dependencies
go get ./...

# Build and install
go install

# View documentation
go doc fmt
go doc http.ListenAndServe

# Environment info
go env
go version
```

## Project Structure

```
myproject/
├── go.mod          # Module definition
├── go.sum          # Dependency checksums
├── main.go         # Entry point
├── pkg/            # Internal packages
├── cmd/            # Application commands
└── internal/       # Private packages
```

## Package Management

```bash
# Initialize module
go mod init github.com/username/project

# Add dependency
go get github.com/pkg/errors

# Update dependencies
go get -u

# Tidy module files
go mod tidy

# List dependencies
go list -m all
```

## Common Packages

| Package | Import | Purpose |
|---------|--------|---------|
| fmt | `fmt` | Formatting I/O |
| os | `os` | OS operations |
| io | `io` | I/O primitives |
| time | `time` | Time operations |
| strings | `strings` | String utilities |
| json | `encoding/json` | JSON encoding |
| http | `net/http` | HTTP server/client |
| gorilla/mux | `github.com/gorilla/mux` | HTTP router |

## Data Structures

| Type | Syntax | Description |
|------|--------|-------------|
| Array | `var arr [5]int` | Fixed-size |
| Slice | `s := []int{}` | Dynamic array |
| Map | `m := map[string]int{}` | Key-value |
| Struct | `type Person struct{}` | Custom type |

## Error Handling

```go
// Return error
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// Handle error
result, err := divide(10, 0)
if err != nil {
    log.Fatal(err)
}
```

## Concurrency

```go
// Goroutine
go func() {
    // async work
}()

// Channel
ch := make(chan int)
ch <- 10
value := <-ch

// WaitGroup
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    // work
}()
wg.Wait()
```