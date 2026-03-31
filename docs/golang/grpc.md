---
title: gRPC
prev:
    link: '/golang/testing'
    text: 'Testing'
next:
    link: '/golang/gin'
    text: 'Gin Framework'
---

# gRPC

High-performance RPC framework using Protocol Buffers.

## Installation

```bash
# Install protoc
brew install protobuf

# Install Go plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.31
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3

# Install Go packages
go get google.golang.org/grpc
go get google.golang.org/protobuf
```

## Protocol Buffers

```protobuf
// user.proto
syntax = "proto3";

package pb;

option go_package = "example/pb";

message User {
    string id = 1;
    string name = 2;
    string email = 3;
    int32 age = 4;
}

message CreateUserRequest {
    string name = 1;
    string email = 2;
    int32 age = 3;
}

message GetUserRequest {
    string id = 1;
}

message UserResponse {
    User user = 1;
}

service UserService {
    rpc CreateUser(CreateUserRequest) returns (UserResponse);
    rpc GetUser(GetUserRequest) returns (UserResponse);
    rpc GetUsers(GetUserRequest) returns (stream UserResponse);
    rpc CreateUsers(stream CreateUserRequest) returns (UserResponse);
}
```

## Generate Code

```bash
protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    user.proto
```

## Server

```go
package main

import (
    "context"
    "log"
    "net"

    "example/pb"
    "google.golang.org/grpc"
)

type server struct {
    pb.UnimplementedUserServiceServer
    users map[string]*pb.User
}

func (s *server) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.UserResponse, error) {
    user := &pb.User{
        Id:    generateID(),
        Name:  req.Name,
        Email: req.Email,
        Age:   req.Age,
    }
    s.users[user.Id] = user
    return &pb.UserResponse{User: user}, nil
}

func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    user, ok := s.users[req.Id]
    if !ok {
        return nil, fmt.Errorf("user not found")
    }
    return &pb.UserResponse{User: user}, nil
}

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatal(err)
    }

    s := grpc.NewServer()
    pb.RegisterUserServiceServer(s, &server{users: make(map[string]*pb.User)})

    log.Printf("Server started on :50051")
    if err := s.Serve(lis); err != nil {
        log.Fatal(err)
    }
}
```

## Client

```go
package main

import (
    "context"
    "log"

    "example/pb"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)

func main() {
    conn, err := grpc.Dial(
        "localhost:50051",
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    client := pb.NewUserServiceClient(conn)

    // Create user
    createResp, err := client.CreateUser(
        context.Background(),
        &pb.CreateUserRequest{
            Name:  "Alice",
            Email: "alice@example.com",
            Age:   25,
        },
    )
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("Created user: %v", createResp.User)

    // Get user
    getResp, err := client.GetUser(
        context.Background(),
        &pb.GetUserRequest{Id: createResp.User.Id},
    )
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("Got user: %v", getResp.User)
}
```

## Streaming

```go
// Server-side streaming
func (s *server) GetUsers(req *pb.GetUserRequest, stream pb.UserService_GetUsersServer) error {
    for _, user := range s.users {
        if err := stream.Send(&pb.UserResponse{User: user}); err != nil {
            return err
        }
    }
    return nil
}

// Client-side streaming
func (s *server) CreateUsers(stream pb.UserService_CreateUsersServer) error {
    count := 0
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            break
        }
        if err != nil {
            return err
        }
        user := &pb.User{
            Id:    generateID(),
            Name:  req.Name,
            Email: req.Email,
            Age:   req.Age,
        }
        s.users[user.Id] = user
        count++
    }
    return stream.SendAndClose(&pb.UserResponse{
        User: &pb.User{Id: "total", Name: "Created", Age: int32(count)},
    })
}

// Bidirectional streaming
func (s *server) Chat(stream pb.UserService_ChatServer) error {
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            return nil
        }
        if err != nil {
            return err
        }
        // Process message
        resp := &pb.ChatResponse{Message: "Echo: " + req.Message}
        if err := stream.Send(resp); err != nil {
            return err
        }
    }
}
```

## Error Handling

```go
import (
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
)

func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    user, ok := s.users[req.Id]
    if !ok {
        return nil, status.Errorf(codes.NotFound, "user not found: %s", req.Id)
    }
    return &pb.UserResponse{User: user}, nil
}

// Client
resp, err := client.GetUser(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.NotFound:
            log.Println("User not found")
        case codes.Internal:
            log.Println("Internal error:", st.Message())
        default:
            log.Println("Error:", st.Message())
        }
    }
}
```

## Interceptors

```bash
go get github.com/grpc-ecosystem/go-grpc-middleware
```

```go
import (
    "context"
    "log"
    "google.golang.org/grpc"
    "google.golang.org/grpc/metadata"
)

// Unary interceptor
func loggingUnaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    log.Printf("Request: %s", info.FullMethod)
    resp, err := handler(ctx, req)
    return resp, err
}

// Stream interceptor
func loggingStreamInterceptor(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
    log.Printf("Stream: %s", info.FullMethod)
    return handler(srv, ss)
}

// Server with interceptors
server := grpc.NewServer(
    grpc.UnaryInterceptor(loggingUnaryInterceptor),
    grpc.StreamInterceptor(loggingStreamInterceptor),
)
```

## Metadata

```go
// Server - read metadata
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    md, ok := metadata.FromIncomingContext(ctx)
    if ok {
        if token := md.Get("authorization"); len(token) > 0 {
            log.Println("Token:", token[0])
        }
    }
    // ...
}

// Client - send metadata
md := metadata.Pairs(
    "authorization", "Bearer token",
)
ctx := metadata.NewOutgoingContext(context.Background(), md)
client.GetUser(ctx, req)
```

## Authentication

```go
// Token authentication
type TokenAuth struct {
    Token string
}

func (t *TokenAuth) GetRequestMetadata(ctx context.Context, uri ...string) (map[string]string, error) {
    return map[string]string{
        "authorization": "Bearer " + t.Token,
    }, nil
}

func (t *TokenAuth) RequireTransportSecurity() bool {
    return false
}

// Use
creds := grpc.WithPerRPCCredentials(&TokenAuth{Token: "mytoken"})
conn, _ := grpc.Dial("localhost:50051", creds)
```

## Health Check

```bash
go get github.com/grpc-ecosystem/grpc-health-probe
```

```go
import "google.golang.org/grpc/health"
import "google.golang.org/grpc/health/grpc_health_v1"

healthServer := health.NewServer()
grpc_health_v1.RegisterHealthServer(s, healthServer)

healthServer.SetServingStatus("user.service", grpc_health_v1.HealthCheckResponse_SERVING)
```