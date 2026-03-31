---
title: Generics
prev:
    link: '/golang/http-client'
    text: 'HTTP Client'
next:
    link: '/golang/context'
    text: 'Context Package'
---

# Generics

Generic types in Go (1.18+).

## Basic Syntax

```go
// Type parameter
func Print[T any](s []T) {
    for _, v := range s {
        fmt.Println(v)
    }
}

// Use
Print([]int{1, 2, 3})
Print([]string{"a", "b", "c"})
```

## Type Parameters in Functions

```go
// Multiple type parameters
func Map[T, U any](s []T, fn func(T) U) []U {
    result := make([]U, len(s))
    for i, v := range s {
        result[i] = fn(v)
    }
    return result
}

// Use
numbers := []int{1, 2, 3}
squared := Map(numbers, func(i int) int { return i * i })

// Or with generic function
strings := []string{"a", "b", "c"}
upper := Map(strings, strings.ToUpper)
```

## Type Parameters in Types

```go
// Generic struct
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

// Use
intStack := Stack[int]{}
intStack.Push(10)
val, _ := intStack.Pop()

stringStack := Stack[string]{}
stringStack.Push("hello")
```

## Constraints

```go
// Interface as constraint
type Printable interface {
    Print()
}

func PrintAll[T Printable](items []T) {
    for _, item := range items {
        item.Print()
    }
}

// Comparable constraint (built-in)
func Index[T comparable](s []T, v T) int {
    for i, item := range s {
        if item == v {
            return i
        }
    }
    return -1
}
```

## Custom Constraints

```go
// Number constraint
type Number interface {
    int | int32 | int64 | float32 | float64
}

func Sum[T Number](nums []T) T {
    var sum T
    for _, n := range nums {
        sum += n
    }
    return sum
}

// String constraint
type Stringish interface {
    string | []rune
}

func Len[T Stringish](s T) int {
    return len(s)
}
```

## Method with Type Parameters

```go
type Container[T any] struct {
    Value T
}

// Method with separate type parameter
func (c Container[T]) Get() T {
    return c.Value
}

// Generic method (Go 1.18+)
func (c Container[T]) MapTo[U any](fn func(T) U) Container[U] {
    return Container[U]{Value: fn(c.Value)}
}
```

## Using any Instead of interface{}

```go
// Before generics
func PrintAny(s []interface{}) {
    for _, v := range s {
        fmt.Println(v)
    }
}

// With generics
func Print[T any](s []T) {
    for _, v := range s {
        fmt.Println(v)
    }
}
```

## Type Inference

```go
func Map[T, U any](s []T, fn func(T) U) []U {
    result := make([]U, len(s))
    for i, v := range s {
        result[i] = fn(v)
    }
    return result
}

// Type inference works automatically
numbers := []int{1, 2, 3}
squared := Map(numbers, func(i int) int { return i * i })
// Compiler infers Map[int, int]
```

## When to Use Generics

```go
// Good use cases
type Pair[K, V any] struct {
    Key   K
    Value V
}

func Reverse[T any](s []T) []T {
    result := make([]T, len(s))
    for i, v := range s {
        result[len(s)-1-i] = v
    }
    return result
}

func Filter[T any](s []T, fn func(T) bool) []T {
    var result []T
    for _, v := range s {
        if fn(v) {
            result = append(result, v)
        }
    }
    return result
}

// Not necessary
func Add(a, b int) int {  // Simple, no need for generics
    return a + b
}
```

## Real World Examples

```go
// Cache implementation
type Cache[K comparable, V any] struct {
    data map[K]V
}

func NewCache[K comparable, V any]() *Cache[K, V] {
    return &Cache[K, V]{data: make(map[K]V)}
}

func (c *Cache[K, V]) Set(key K, value V) {
    c.data[key] = value
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
    v, ok := c.data[key]
    return v, ok
}

// Result type
type Result[T any] struct {
    Data  T
    Error error
}

func SafeCall[T any](fn func() T) Result[T] {
    defer func() {
        if r := recover(); r != nil {
            // handle
        }
    }()
    return Result[T]{Data: fn()}
}
```