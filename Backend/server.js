const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Test route to check DB connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS result');
    res.json({ ok: true, result: rows[0] });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'BookStore API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test DB connection: http://localhost:${PORT}/test-db`);
});