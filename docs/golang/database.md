---
title: Database
prev:
    link: '/golang/error'
    text: 'Error Handling'
next:
    link: '/golang/http-client'
    text: 'HTTP Client'
---

# Database (Go)

Working with databases in Go using database/sql.

## Installation

```bash
go get github.com/go-sql-driver/mysql
go get github.com/lib/pq   # PostgreSQL
go get github.com/mattn/go-sqlite3  # SQLite
```

## Basic Setup

```go
import (
    "database/sql"
    "fmt"
    
    _ "github.com/go-sql-driver/mysql"
    _ "github.com/lib/pq"
    _ "github.com/mattn/go-sqlite3"
)

// MySQL
db, err := sql.Open("mysql", "user:password@tcp(localhost:3306)/dbname")

// PostgreSQL  
db, err := sql.Open("postgres", "user=root password=secret dbname=test sslmode=disable")

// SQLite
db, err := sql.Open("sqlite3", "./test.db")

// Check connection
if err := db.Ping(); err != nil {
    log.Fatal(err)
}

defer db.Close()
```

## CRUD Operations

```go
// Create
func createUser(db *sql.DB, name, email string) (int64, error) {
    result, err := db.Exec(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        name, email,
    )
    if err != nil {
        return 0, err
    }
    return result.LastInsertId()
}

// Read single row
func getUser(db *sql.DB, id int) (*User, error) {
    row := db.QueryRow("SELECT id, name, email FROM users WHERE id = ?", id)
    
    var user User
    err := row.Scan(&user.ID, &user.Name, &user.Email)
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// Read multiple rows
func getAllUsers(db *sql.DB) ([]User, error) {
    rows, err := db.Query("SELECT id, name, email FROM users")
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var users []User
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
            return nil, err
        }
        users = append(users, user)
    }
    return users, rows.Err()
}

// Update
func updateUser(db *sql.DB, id int, name string) error {
    _, err := db.Exec(
        "UPDATE users SET name = ? WHERE id = ?",
        name, id,
    )
    return err
}

// Delete
func deleteUser(db *sql.DB, id int) error {
    _, err := db.Exec("DELETE FROM users WHERE id = ?", id)
    return err
}
```

## Query with Parameters

```go
// Named parameters (with named queries)
import "github.com/jmoiron/sqlx"

dbx := sqlx.Connect("mysql", "...")

// Named query
results, err := dbx.NamedQuery(
    "SELECT * FROM users WHERE name = :name",
    map[string]interface{}{"name": "John"},
)

// Struct binding
type User struct {
    ID   int    `db:"id"`
    Name string `db:"name"`
}

var user User
err := dbx.Get(&user, "SELECT * FROM users WHERE id = ?", 1)
var users []User
err := dbx.Select(&users, "SELECT * FROM users")

// In clause
ids := []int{1, 2, 3}
query, args, err := sqlx.In("SELECT * FROM users WHERE id IN (?)", ids)
query = dbx.Rebind(query)  // Rebind for MySQL
rows, err := dbx.Query(query, args...)
```

## Transactions

```go
func transferMoney(db *sql.DB, fromID, toID int, amount float64) error {
    tx, err := db.Begin()
    if err != nil {
        return err
    }
    
    // Rollback on panic
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    // Deduct from sender
    _, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", amount, fromID)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Add to receiver  
    _, err = tx.Exec("UPDATE accounts SET balance = balance + ? WHERE id = ?", amount, toID)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    return tx.Commit()
}
```

## Prepared Statements

```go
// Create once, use many times
stmt, err := db.Prepare("INSERT INTO users (name, email) VALUES (?, ?)")
if err != nil {
    log.Fatal(err)
}
defer stmt.Close()

// Use
for _, user := range users {
    _, err := stmt.Exec(user.Name, user.Email)
    if err != nil {
        log.Fatal(err)
    }
}
```

## Connection Pool

```go
// Settings
db.SetMaxOpenConns(25)           // Max open connections
db.SetMaxIdleConns(5)            // Max idle connections
db.SetConnMaxLifetime(5 * time.Minute)  // Connection lifetime
db.SetConnMaxIdleTime(1 * time.Minute)    // Idle time
```

## NULL Values

```go
import "database/sql"

// Use sql.NullString, sql.NullInt64, etc.
type User struct {
    ID    int
    Name  string
    Email sql.NullString  // Can be NULL
}

// Scan
var email sql.NullString
row.Scan(&email)
if email.Valid {
    fmt.Println(email.String)
} else {
    fmt.Println("Email is NULL")
}

// Insert NULL
db.Exec("INSERT INTO users (name, email) VALUES (?, ?)", "John", nil)
```

## Using GORM (optional)

```go
import "gorm.io/gorm"

type User struct {
    ID    uint
    Name  string
    Email string `gorm:"uniqueIndex"`
}

db, _ := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})

// Create
db.Create(&user)

// Read
db.First(&user, 1)
db.Where("name = ?", "John").First(&user)

// Update
db.Model(&user).Update("name", "Jane")

// Delete
db.Delete(&user)

// Transactions
db.Transaction(func(tx *gorm.DB) error {
    return tx.Create(&order).Error
})
```