const express = require('express');
const router = express.Router();
const { addToCart, viewCart, removeFromCart, updateCartQuantity } = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(authenticate);

router.post('/', addToCart);
router.get('/', viewCart);
router.delete('/:isbn', removeFromCart);
router.put('/:isbn', updateCartQuantity);

module.exports = router;

