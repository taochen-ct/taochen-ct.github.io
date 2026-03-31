---
title: Database (SQLAlchemy)
prev:
    link: '/python/logging'
    text: 'Logging'
next:
    link: '/python/fastapi'
    text: 'FastAPI'
---

# SQLAlchemy

SQLAlchemy is Python's SQL toolkit and ORM.

## Installation

```bash
pip install sqlalchemy
pip install pymysql        # MySQL
pip install psycopg2      # PostgreSQL
pip install sqlite3       # Built-in (no install needed)
```

## Basic Setup

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite
engine = create_engine('sqlite:///app.db', echo=True)

# MySQL
engine = create_engine(
    'mysql+pymysql://user:password@localhost/dbname'
)

# PostgreSQL
engine = create_engine(
    'postgresql://user:password@localhost/dbname'
)

Base = declarative_base()
```

## Define Models

```python
from datetime import datetime

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True)
    age = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.name}>"

# Create tables
Base.metadata.create_all(engine)
```

## Session Management

```python
# Create session
Session = sessionmaker(bind=engine)
session = Session()

# Or with context manager
from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## CRUD Operations

```python
# Create
user = User(name='John', email='john@example.com')
session.add(user)
session.commit()
session.refresh(user)  # Get ID

# Read
# Get by ID
user = session.query(User).get(1)

# Get first or None
user = session.query(User).filter_by(email='john@example.com').first()

# Get all
users = session.query(User).all()

# Filter
active_users = session.query(User).filter(User.age >= 18).all()

# Multiple conditions
users = session.query(User).filter(
    User.age >= 18,
    User.name.like('J%')
).all()

# SQL expressions
from sqlalchemy import and_, or_, not_
users = session.query(User).filter(
    or_(User.name == 'John', User.age > 20)
)

# Update
user = session.query(User).first()
user.name = 'Jane'
session.commit()

# Delete
session.delete(user)
session.commit()
```

## Query Methods

```python
# All results
session.query(User).all()

# First result
session.query(User).first()

# One or error
session.query(User).get(1)  # Returns None if not found
session.query(User).filter(...).one()  # Raises if not exactly one

# Limit/Offset
session.query(User).limit(10).offset(20).all()

# Order by
session.query(User).order_by(User.name).all()
session.query(User).order_by(User.age.desc()).all()

# Count
count = session.query(User).count()

# Distinct
session.query(User.name).distinct().all()
```

## Relationships

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True)
    title = Column(String(200))
    user_id = Column(Integer, ForeignKey('users.id'))
    
    user = relationship('User', back_populates='posts')

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    
    posts = relationship('Post', back_populates='user')

# Usage
user = session.query(User).first()
for post in user.posts:
    print(post.title)

# Access user from post
post = session.query(Post).first()
print(post.user.name)
```

## Many-to-Many

```python
association_table = Table(
    'student_course',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    courses = relationship('Course', secondary=association_table, back_populates='students')

class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    students = relationship('Student', secondary=association_table, back_populates='courses')
```

## Joins

```python
# Join
results = session.query(User, Post).join(Post).all()

# Filter on joined
results = session.query(User).join(Post).filter(
    Post.title.like('%Python%')
).all()

# Left outer join
results = session.query(User, Post).outerjoin(Post).all()
```

## Transactions

```python
try:
    user1 = User(name='User1')
    user2 = User(name='User2')
    session.add_all([user1, user2])
    session.commit()
except Exception:
    session.rollback()
    raise
```

## Raw SQL

```python
from sqlalchemy import text

# Execute raw SQL
result = session.execute(text("SELECT * FROM users WHERE age > :age"), {"age": 18})
for row in result:
    print(row)

# Insert
session.execute(text("INSERT INTO users (name, email) VALUES (:name, :email)"),
    {"name": "John", "email": "john@example.com"})
session.commit()
```

## Pagination

```python
def paginate(query, page=1, per_page=20):
    return query.offset((page - 1) * per_page).limit(per_page)

# Usage
users = paginate(session.query(User), page=2, per_page=10)
```

## Async (SQLAlchemy 1.4+)

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine("sqlite+aiosqlite:///app.db")
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_users():
    async with async_session() as session:
        result = await session.execute(select(User))
        return result.scalars().all()
```