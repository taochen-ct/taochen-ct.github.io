---
title: HTTP Client
prev:
    link: '/golang/database'
    text: 'Database'
next:
    link: '/golang/gin'
    text: 'Gin Framework'
---

# HTTP Client

Making HTTP requests in Go.

## Basic GET

```go
import (
    "fmt"
    "net/http"
    "io"
)

resp, err := http.Get("https://api.example.com/data")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

body, err := io.ReadAll(resp.Body)
if err != nil {
    log.Fatal(err)
}

fmt.Println(string(body))
fmt.Println("Status:", resp.StatusCode)
```

## POST Request

```go
import (
    "bytes"
    "encoding/json"
)

// POST with JSON
data := map[string]string{"name": "John", "email": "john@example.com"}
jsonData, _ := json.Marshal(data)

resp, err := http.Post(
    "https://api.example.com/users",
    "application/json",
    bytes.NewBuffer(jsonData),
)
defer resp.Body.Close()
```

## Custom Client

```go
// Create custom client
client := &http.Client{
    Timeout: 10 * time.Second,
}

// Add headers
req, _ := http.NewRequest("GET", "https://api.example.com", nil)
req.Header.Set("Authorization", "Bearer token")
req.Header.Set("Content-Type", "application/json")

resp, err := client.Do(req)
```

## Query Parameters

```go
import "net/url"

params := url.Values{}
params.Add("page", "1")
params.Add("limit", "10")

url := "https://api.example.com/users?" + params.Encode()
resp, err := http.Get(url)
```

## Form Data

```go
import "net/url"

data := url.Values{}
data.Add("username", "john")
data.Add("password", "secret")

resp, err := http.PostForm(
    "https://api.example.com/login",
    data,
)
```

## JSON Response

```go
import "encoding/json"

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

resp, _ := client.Do(req)
defer resp.Body.Close()

var user User
if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
    log.Fatal(err)
}

fmt.Println(user.Name)
```

## Error Handling

```go
resp, err := http.Get("https://api.example.com")
if err != nil {
    log.Fatal("Request failed:", err)
}

if resp.StatusCode != http.StatusOK {
    body, _ := io.ReadAll(resp.Body)
    log.Fatalf("Request failed with status %d: %s", resp.StatusCode, string(body))
}
```

## Reuse Client

```go
// Single client for all requests
var client = &http.Client{
    Timeout: 30 * time.Second,
}

func fetchData() error {
    resp, err := client.Get("https://api.example.com")
    // ...
    return nil
}
```

## With Context

```go
import "context"

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

req, _ := http.NewRequestWithContext(ctx, "GET", "https://api.example.com", nil)
resp, err := client.Do(req)

if ctx.Err() == context.DeadlineExceeded {
    fmt.Println("Request timed out")
}
```

## Retry Logic

```go
func doWithRetry(client *http.Client, req *http.Request, retries int) (*http.Response, error) {
    for i := 0; i < retries; i++ {
        resp, err := client.Do(req)
        if err == nil && resp.StatusCode < 500 {
            return resp, nil
        }
        time.Sleep(time.Duration(i+1) * time.Second)
    }
    return nil, fmt.Errorf("max retries exceeded")
}
```

## Using Resty (第三方库)

```bash
go get github.com/go-resty/resty/v2
```

```go
import "github.com/go-resty/resty/v2"

client := resty.New()

// GET
resp, err := client.R().
    SetHeader("Content-Type", "application/json").
    Get("https://api.example.com/users")

// POST
resp, err := client.R().
    SetBody(User{Name: "John", Email: "john@example.com"}).
    Post("https://api.example.com/users")

// Response handling
fmt.Println(resp.StatusCode())
fmt.Println(string(resp.Body()))

// Bind to struct
var user User
resp, err := client.R().
    SetResult(&user).
    Get("https://api.example.com/users/1")
```

## Using gorequest (optional)

```bash
go get github.com/parnurzeal/gorequest
```

```go
import "github.com/parnureal/gorequest"

request := gorequest.New()
resp, body, errs := request.Get("https://api.example.com").
    Set("Authorization", "Bearer token").
    End()

if len(errs) > 0 {
    log.Fatal(errs[0])
}
fmt.Println(body)
```

## File Download

```go
resp, err := http.Get("https://example.com/file.zip")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

out, err := os.Create("file.zip")
if err != nil {
    log.Fatal(err)
}
defer out.Close()

_, err = io.Copy(out, resp.Body)
```

## Best Practices

```go
// 1. Reuse client
var httpClient = &http.Client{Timeout: 10 * time.Second}

// 2. Use context for cancellation
req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

// 3. Close response body
defer resp.Body.Close()

// 4. Set appropriate headers
req.Header.Set("User-Agent", "MyApp/1.0")

// 5. Don't use default client in production
// http.Get() uses DefaultClient with no timeout
```