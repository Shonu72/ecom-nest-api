# 🐘 PostgreSQL (psql) Cheatsheet

A quick reference for daily PostgreSQL usage via `psql`.

---

## 🔹 1. Basic Navigation (psql commands)

> These are NOT SQL. They start with `\`

```
\l                -- list all databases
\c db_name        -- connect to a database
\dt               -- list tables
\d table_name     -- describe table
\dn               -- list schemas
\du               -- list users/roles
\q                -- quit psql
```

---

## 🔹 2. Database Operations

```
CREATE DATABASE mydb;

DROP DATABASE mydb;

-- connect to database
\c mydb
```

---

## 🔹 3. Table Operations

### Create Table

```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Show Tables

```
\dt
```

### Describe Table

```
\d users
```

### Drop Table

```
DROP TABLE users;
```

---

## 🔹 4. CRUD Operations

### Insert

```
INSERT INTO users (name, email)
VALUES ('Shourya', 'shourya@email.com');
```

### Select

```
SELECT * FROM users;

SELECT name, email FROM users;

SELECT * FROM users WHERE id = 1;
```

### Update

```
UPDATE users
SET name = 'New Name'
WHERE id = 1;
```

### Delete

```
DELETE FROM users WHERE id = 1;
```

---

## 🔹 5. Useful Queries

### Limit & Offset

```
SELECT * FROM users LIMIT 10 OFFSET 5;
```

### Order By

```
SELECT * FROM users ORDER BY created_at DESC;
```

### Count

```
SELECT COUNT(*) FROM users;
```

---

## 🔹 6. Indexes

```
CREATE INDEX idx_users_email ON users(email);

DROP INDEX idx_users_email;
```

---

## 🔹 7. Relationships (Foreign Keys)

```
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title TEXT,
    content TEXT
);
```

---

## 🔹 8. Transactions

```
BEGIN;

INSERT INTO users (name) VALUES ('Test');

ROLLBACK;  -- undo
COMMIT;    -- save
```

---

## 🔹 9. Show Current DB / User

```
SELECT current_database();

SELECT current_user;
```

---

## 🔹 10. Debugging & Help

```
\?        -- psql commands help
\h        -- SQL help
\x        -- expanded output mode
```

---

## 🔹 11. Common Mistakes

❌ Missing semicolon

```
CREATE DATABASE mydb
```

✅ Correct

```
CREATE DATABASE mydb;
```

---

## 🔹 12. Prompt Meaning

| Prompt     | Meaning             |
| ---------- | ------------------- |
| postgres=# | Ready for new query |
| postgres-# | Query not complete  |

---

## 🔹 13. MySQL → PostgreSQL Mapping

| MySQL           | PostgreSQL |
| --------------- | ---------- |
| SHOW DATABASES; | \l         |
| USE db;         | \c db      |
| SHOW TABLES;    | \dt        |
| DESCRIBE table; | \d table   |

---

## 🚀 Pro Tips

* Use `\x` for better readability of large rows
* Use `EXPLAIN ANALYZE` to debug slow queries
* Always add indexes on frequently searched columns

---

## ✅ Quick Start Workflow

```
CREATE DATABASE mydb;
\c mydb

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT
);

INSERT INTO users (name) VALUES ('Test');

SELECT * FROM users;
```

---

Keep this file in your project root for quick access 🔥
