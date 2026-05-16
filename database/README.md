# Database Setup

This folder contains the MySQL setup files for the Book Store backend.

## Files

- `schema.sql`: creates `BookStoreDB`, all required tables, indexes, foreign keys, and stock-management triggers.
- `seed.sql`: adds sample publishers, authors, and books.

## Usage

Run `schema.sql` first:

```sql
SOURCE database/schema.sql;
```

Then optionally run the sample data:

```sql
SOURCE database/seed.sql;
```

The backend is configured to connect to database `BookStoreDB` in `Backend/config/db.js`.

User passwords must be bcrypt hashes. Create users through the app where possible, or insert bcrypt-hashed passwords manually when seeding admin accounts.
