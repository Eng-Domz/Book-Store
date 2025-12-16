const express = require('express');
const router = express.Router();
const { addBook, updateBook, searchBooks, getBookByISBN, getAllBooks } = require('../controllers/books.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminAuth } = require('../middleware/admin.middleware');

// Public search route (available to all authenticated users)
router.get('/search', authenticate, searchBooks);
router.get('/:isbn', authenticate, getBookByISBN);

// Admin only routes
router.post('/', adminAuth, addBook);
router.put('/:isbn', adminAuth, updateBook);
router.get('/', adminAuth, getAllBooks);

module.exports = router;

