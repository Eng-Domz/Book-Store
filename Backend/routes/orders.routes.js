const express = require('express');
const router = express.Router();
const {
  checkout,
  getPastOrders,
  confirmOrder,
  getAllBookOrders,
  getSalesLastMonth,
  getSalesByDate,
  getTopCustomers,
  getTopSellingBooks,
  getBookOrderCount,
  createManualOrder,
  getBooksForOrdering
} = require('../controllers/orders.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminAuth } = require('../middleware/admin.middleware');

// Customer routes
router.post('/checkout', authenticate, checkout);
router.get('/my-orders', authenticate, getPastOrders);

// Admin routes
router.get('/book-orders', adminAuth, getAllBookOrders);
router.put('/book-orders/:orderId/confirm', adminAuth, confirmOrder);
router.post('/book-orders/manual', adminAuth, createManualOrder);
router.get('/books-for-ordering', adminAuth, getBooksForOrdering);

// Admin reports
router.get('/reports/sales/last-month', adminAuth, getSalesLastMonth);
router.get('/reports/sales/by-date', adminAuth, getSalesByDate);
router.get('/reports/top-customers', adminAuth, getTopCustomers);
router.get('/reports/top-books', adminAuth, getTopSellingBooks);
router.get('/reports/book-orders/:isbn', adminAuth, getBookOrderCount);

module.exports = router;

