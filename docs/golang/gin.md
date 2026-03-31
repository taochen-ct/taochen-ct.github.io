---
title: Gin Web Framework
prev:
    link: '/golang/goroutine'
    text: 'Goroutine & Concurrency'
next: false
---

# Gin Web Framework

Gin is a high-performance web framework for Go, known for its speed and minimal memory usage.

## Installation

```bash
go get -u github.com/gin-gonic/gin
```

## Basic Server

```go
package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    r.GET("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "pong",
        })
    })

    r.Run() // listen and serve on 0.0.0.0:8080
}
```

## Routing

### Basic Routes

```go
r.GET("/path", handler)
r.POST("/path", handler)
r.PUT("/path", handler)
r.DELETE("/path", handler)
r.PATCH("/path", handler)
r.OPTIONS("/path", handler)
r.HEAD("/path", handler)
```

### Parameters

```go
// Path parameter
r.GET("/user/:name", func(c *gin.Context) {
    name := c.Param("name")
    c.JSON(200, gin.H{"name": name})
})

// Query parameter
r.GET("/search", func(c *gin.Context) {
    query := c.Query("q")
    page := c.DefaultQuery("page", "1")
})

// Form data
r.POST("/form", func(c *gin.Context) {
    username := c.PostForm("username")
    password := c.DefaultPostForm("password", "default")
})

// JSON body
r.POST("/json", func(c *gin.Context) {
    var jsonData map[string]interface{}
    if err := c.ShouldBindJSON(&jsonData); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, jsonData)
})
```

### Route Groups

```go
v1 := r.Group("/api/v1")
{
    v1.GET("/users", getUsers)
    v1.POST("/users", createUser)
}

v2 := r.Group("/api/v2")
v2.Use(middleware()) // middleware for group
{
    v2.GET("/users", getUsers)
}
```

## Middleware

### Built-in Middleware

```go
r := gin.New()           // No middleware
r := gin.Default()       // Logger + Recovery

// Logger
r.Use(gin.Logger())

// Recovery
r.Use(gin.Recovery())

// Custom middleware
func Middleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Before request
        c.Set("key", "value")

        c.Next() // Process chain

        // After request
    }
}

r.Use(Middleware())
```

### Handler Middleware

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }
        c.Next()
    }
}

r.GET("/protected", AuthMiddleware(), func(c *gin.Context) {
    c.JSON(200, gin.H{"data": "protected"})
})
```

## Data Binding

### Struct Tags

```go
type User struct {
    Name     string `form:"name" json:"name"`
    Email    string `form:"email" json:"email"`
    Password string `form:"password" json:"-"` // "-" never bind
}

// Bind query string
func getUser(c *gin.Context) {
    var user User
    c.ShouldBindQuery(&user)
}

// Bind JSON
func createUser(c *gin.Context) {
    var user User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, user)
}
```

### Binding Validation

```go
type Login struct {
    User     string `form:"user" json:"user" binding:"required"`
    Password string `form:"password" json:"password" binding:"required,min=6"`
}

func login(c *gin.Context) {
    var l Login
    if err := c.ShouldBindJSON(&l); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, gin.H{"status": "ok"})
}
```

## Responses

```go
// JSON
c.JSON(200, gin.H{"message": "ok"})

// XML
c.XML(200, gin.H{"message": "ok"})

// YAML
c.YAML(200, gin.H{"message": "ok"})

// ProtoBuf
c.ProtoBuf(200, &proto)

// String
c.String(200, "Hello %s", "World")

// File
c.File("path/to/file")

// Stream
c.Stream(func(w io.Writer) bool {
    // streaming content
    return false
})
```

## File Upload

```go
// Single file
r.POST("/upload", func(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.SaveUploadedFile(file, dst)
    c.JSON(200, gin.H{"filename": file.Filename})
})

// Multiple files
r.POST("/upload/multiple", func(c *gin.Context) {
    form, _ := c.MultipartForm()
    files := form.File["files"]
    // process files
})
```

## Running Server

```go
func main() {
    r := gin.Default()

    // Default
    r.Run()

    // Custom address
    r.Run(":8080")
    r.Run(":8081")

    // Custom router
    router := gin.New()
    http.ListenAndServe(":8080", router)

    // With TLS
    r.RunTLS(":8080", "server.pem", "server.key")
}
```

## Project Structure

```
myapp/
├── main.go
├── handlers/
│   └── user.go
├── models/
│   └── user.go
├── middleware/
│   └── auth.go
├── config/
│   └── config.go
└── go.mod
```