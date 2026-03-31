---
title: Testing
prev:
    link: '/golang/context'
    text: 'Context Package'
next:
    link: '/golang/grpc'
    text: 'gRPC'
---

# Testing

Testing in Go with the standard library and beyond.

## Basic Test

```go
// math.go
package math

func Add(a, b int) int {
    return a + b
}

func Subtract(a, b int) int {
    return a - b
}

// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}

func TestSubtract(t *testing.T) {
    result := Subtract(5, 3)
    if result != 2 {
        t.Errorf("Subtract(5, 3) = %d; want 2", result)
    }
}
```

## Running Tests

```bash
# Run all tests
go test ./...

# Run specific test
go test -run TestAdd

# Run with verbose
go test -v

# Run with coverage
go test -cover

# Run benchmarks
go test -bench=.

# Run with race detector
go test -race

# Run with CPU profile
go test -cpuprofile=cpu.out
```

## Test Tables

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 2, 3, 5},
        {"negative", -1, -2, -3},
        {"mixed", -5, 10, 5},
        {"zero", 0, 0, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

## Subtests

```go
func TestMath(t *testing.T) {
    t.Run("Add", func(t *testing.T) {
        if Add(2, 3) != 5 {
            t.Fail()
        }
    })

    t.Run("Subtract", func(t *testing.T) {
        if Subtract(5, 3) != 2 {
            t.Fail()
        }
    })
}
```

## Setup and Teardown

```go
func TestMain(m *testing.M) {
    // Setup
    setup()
    code := m.Run()
    // Teardown
    teardown()
    os.Exit(code)
}

func TestExample(t *testing.T) {
    // Per-test setup
    resource := acquireResource()
    defer releaseResource(resource)

    // Test
    // ...
}
```

## Assertions with testify

```bash
go get github.com/stretchr/testify
```

```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestWithAssertions(t *testing.T) {
    result := Add(2, 3)

    // Simple assertion
    assert.Equal(t, 5, result)

    // With message
    assert.Equal(t, 5, result, "Add should return correct result")

    // Require (fails fast)
    require.Equal(t, 5, result)

    // Other assertions
    assert.NotEqual(t, 4, result)
    assert.Nil(t, nilValue)
    assert.NotNil(t, nonNilValue)
    assert.True(t, trueValue)
    assert.Contains(t, "hello world", "world")
}
```

## Mocking

```go
// Interface
type Database interface {
    GetUser(id string) (*User, error)
}

// Real implementation
type RealDB struct{}

func (db *RealDB) GetUser(id string) (*User, error) {
    // Actual DB call
    return &User{ID: id}, nil
}

// Mock
type MockDB struct {
    Users map[string]*User
}

func (db *MockDB) GetUser(id string) (*User, error) {
    if user, ok := db.Users[id]; ok {
        return user, nil
    }
    return nil, errors.New("not found")
}

// Test
func TestGetUser(t *testing.T) {
    mock := &MockDB{
        Users: map[string]*User{
            "1": {ID: "1", Name: "Alice"},
        },
    }

    user, err := mock.GetUser("1")
    assert.NoError(t, err)
    assert.Equal(t, "Alice", user.Name)
}
```

## HTTP Testing

```go
import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func handler(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello"))
}

func TestHandler(t *testing.T) {
    // Create request
    req := httptest.NewRequest("GET", "/", nil)

    // Create response recorder
    rr := httptest.NewRecorder()

    // Execute
    handler(rr, req)

    // Check
    if rr.Code != http.StatusOK {
        t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
    }

    if rr.Body.String() != "Hello" {
        t.Errorf("Expected body 'Hello', got '%s'", rr.Body.String())
    }
}

// Test with middleware
func TestMiddleware(t *testing.T) {
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("OK"))
    })

    wrapped := middleware(handler)

    req := httptest.NewRequest("GET", "/", nil)
    rr := httptest.NewRecorder()

    wrapped.ServeHTTP(rr, req)

    // Check middleware effects
    assert.Equal(t, "test-value", rr.Header().Get("X-Test"))
}
```

## Benchmark Tests

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(2, 3)
    }
}

func BenchmarkAddParallel(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            Add(2, 3)
        }
    })
}
```

## Example Tests

```go
func ExampleAdd() {
    result := Add(2, 3)
    fmt.Println(result)
    // Output: 5
}

func ExampleAdd_multiple() {
    fmt.Println(Add(1, 2))
    fmt.Println(Add(10, 20))
    // Output:
    // 3
    // 30
}
```

## Skip Tests

```go
func TestSkip(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping in short mode")
    }

    // Long running test
    time.Sleep(10 * time.Second)
}
```

## Test Coverage

```bash
# Generate coverage
go test -coverprofile=coverage.out

# View coverage
go tool cover -html=coverage.out

# Coverage by function
go test -coverfunc=coverage.out
```

## Fuzz Testing

```bash
go test -fuzz=FuzzAdd
```

```go
func FuzzAdd(f *testing.F) {
    f.Fuzz(func(t *testing.T, a, b int) {
        result := Add(a, b)
        // Check properties
        if result != a+b {
            t.Errorf("Add(%d, %d) = %d", a, b, result)
        }
    })
}
```

## Golden Files

```go
import "testdata"

func TestGolden(t *testing.T) {
    // Read golden file
    expected, err := os.ReadFile("testdata/expected.json")
    require.NoError(t, err)

    // Generate
    actual := generate()

    // Compare
    assert.JSONEq(t, string(expected), string(actual))
}
```