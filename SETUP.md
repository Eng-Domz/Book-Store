# Setup

## Database

Run the SQL files in this order:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

`schema.sql` creates `BookStoreDB`, the app tables, indexes, foreign keys, and stock-management triggers. `seed.sql` adds sample publishers, authors, and books.

## Backend

```powershell
cd Backend
copy .env.example .env
npm install
npm run dev
```

The backend reads database settings from `.env`. If `.env` is missing, it falls back to the local XAMPP-style defaults in `Backend/config/db.js`.

## Frontend

```powershell
cd Frontend
copy .env.example .env
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default. The Vite frontend usually runs on `http://localhost:5173`.
Set `VITE_API_BASE_URL` in `Frontend/.env` if the backend API runs somewhere else.
