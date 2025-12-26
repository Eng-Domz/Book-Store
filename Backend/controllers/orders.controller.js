const db = require('../config/db');

// Helper function to get user's cart
const getUserCart = async (userId) => {
  const [carts] = await db.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
  if (carts.length === 0) return null;
  return carts[0].cart_id;
};

// Checkout cart (place order)
const checkout = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { creditCardNumber, expiryDate } = req.body;

    if (!creditCardNumber || !expiryDate) {
      return res.status(400).json({ error: 'Credit card number and expiry date are required' });
    }

    // Validate credit card (basic validation - check format)
    const cardNumberRegex = /^\d{13,19}$/;
    if (!cardNumberRegex.test(creditCardNumber.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid credit card number' });
    }

    // Validate expiry date (format: MM/YY or MM/YYYY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    if (!expiryRegex.test(expiryDate)) {
      return res.status(400).json({ error: 'Invalid expiry date format. Use MM/YY or MM/YYYY' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Get user's cart
      const cartId = await getUserCart(userId);
      if (!cartId) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Get cart items
      const [cartItems] = await db.query(
        `SELECT ci.isbn, ci.quantity, b.price, b.stock_quantity, b.title
         FROM cart_items ci
         JOIN books b ON ci.isbn = b.isbn
         WHERE ci.cart_id = ?`,
        [cartId]
      );

      if (cartItems.length === 0) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Check stock availability
      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            error: `Insufficient stock for book: ${item.title}` 
          });
        }
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const [orderResult] = await db.query(
        `INSERT INTO orders (user_id, order_date, total_price)
         VALUES (?, NOW(), ?)`,
        [userId, total]
      );

      const orderId = orderResult.insertId;

      // Create order items (trigger will handle stock reduction)
      for (const item of cartItems) {
        await db.query(
          `INSERT INTO order_items (order_id, isbn, quantity, price_at_purchase)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.isbn, item.quantity, item.price]
        );
      }

      // Clear cart (delete cart items and cart)
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
      await db.query('DELETE FROM carts WHERE cart_id = ?', [cartId]);

      await db.query('COMMIT');

      res.status(201).json({
        message: 'Order placed successfully',
        orderId,
        total: total.toFixed(2)
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

// View past orders (customer)
const getPastOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [orders] = await db.query(
      `SELECT o.order_id, o.order_date, o.total_price
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.order_date DESC`,
      [userId]
    );

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await db.query(
          `SELECT oi.isbn, b.title, oi.quantity, oi.price_at_purchase,
                  (oi.quantity * oi.price_at_purchase) as item_total,
                  GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
           FROM order_items oi
           JOIN books b ON oi.isbn = b.isbn
           LEFT JOIN book_authors ba ON b.isbn = ba.isbn
           LEFT JOIN authors a ON ba.author_id = a.author_id
           WHERE oi.order_id = ?
           GROUP BY oi.isbn, b.title, oi.quantity, oi.price_at_purchase`,
          [order.order_id]
        );

        return {
          ...order,
          items
        };
      })
    );

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Get past orders error:', error);
    res.status(500).json({ error: 'Failed to get past orders' });
  }
};

// Confirm order from publisher (Admin only)
const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and is pending
    const [orders] = await db.query(
      'SELECT * FROM publisher_orders WHERE order_id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    if (order.order_status === 'Confirmed') {
      return res.status(400).json({ error: 'Order already confirmed' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Update order status to confirmed (trigger will add quantity to stock)
      await db.query(
        'UPDATE publisher_orders SET order_status = "Confirmed" WHERE order_id = ?',
        [orderId]
      );

      await db.query('COMMIT');
      res.json({ message: 'Order confirmed successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
};

// Get all book orders (Admin only)
const getAllBookOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT po.*, b.title
       FROM publisher_orders po
       JOIN books b ON po.isbn = b.isbn
       ORDER BY po.order_date DESC`
    );

    res.json({ orders });
  } catch (error) {
    console.error('Get all book orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Admin Reports
const getSalesLastMonth = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT SUM(total_price) as total_sales
       FROM orders
       WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
       AND order_date < CURDATE()`
    );

    res.json({
      period: 'Last month',
      totalSales: result[0].total_sales || 0
    });
  } catch (error) {
    console.error('Get sales last month error:', error);
    res.status(500).json({ error: 'Failed to get sales report' });
  }
};

const getSalesByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required (format: YYYY-MM-DD)' });
    }

    const [result] = await db.query(
      `SELECT SUM(total_price) as total_sales
       FROM orders
       WHERE DATE(order_date) = ?`,
      [date]
    );

    res.json({
      date,
      totalSales: result[0].total_sales || 0
    });
  } catch (error) {
    console.error('Get sales by date error:', error);
    res.status(500).json({ error: 'Failed to get sales report' });
  }
};

const getTopCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(
      `SELECT u.user_id, u.email, u.first_name, u.last_name,
              SUM(o.total_price) as total_purchases
       FROM users u
       JOIN orders o ON u.user_id = o.user_id
       WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
       GROUP BY u.user_id, u.email, u.first_name, u.last_name
       ORDER BY total_purchases DESC
       LIMIT 5`
    );

    res.json({ topCustomers: customers });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({ error: 'Failed to get top customers' });
  }
};

const getTopSellingBooks = async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT b.isbn, b.title,
              SUM(oi.quantity) as total_sold
       FROM books b
       JOIN order_items oi ON b.isbn = oi.isbn
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
       GROUP BY b.isbn, b.title
       ORDER BY total_sold DESC
       LIMIT 10`
    );

    res.json({ topBooks: books });
  } catch (error) {
    console.error('Get top selling books error:', error);
    res.status(500).json({ error: 'Failed to get top selling books' });
  }
};

const getBookOrderCount = async (req, res) => {
  try {
    const { isbn } = req.params;

    const [result] = await db.query(
      `SELECT COUNT(*) as order_count
       FROM publisher_orders
       WHERE isbn = ?`,
      [isbn]
    );

    const [bookInfo] = await db.query(
      'SELECT title FROM books WHERE isbn = ?',
      [isbn]
    );

    res.json({
      isbn,
      bookTitle: bookInfo.length > 0 ? bookInfo[0].title : 'Unknown',
      orderCount: result[0].order_count
    });
  } catch (error) {
    console.error('Get book order count error:', error);
    res.status(500).json({ error: 'Failed to get book order count' });
  }
};

// Create manual book order from publisher (Admin only)
const createManualOrder = async (req, res) => {
  try {
    const { isbn, quantity } = req.body;

    if (!isbn || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'ISBN and valid quantity are required' });
    }

    // Check if book exists
    const [books] = await db.query('SELECT title FROM books WHERE isbn = ?', [isbn]);
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Create the order
    const [result] = await db.query(
      `INSERT INTO publisher_orders (isbn, quantity, order_date, order_status)
       VALUES (?, ?, NOW(), 'Pending')`,
      [isbn, quantity]
    );

    res.status(201).json({
      message: 'Publisher order created successfully',
      orderId: result.insertId,
      bookTitle: books[0].title,
      quantity
    });
  } catch (error) {
    console.error('Create manual order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get all books for dropdown (Admin only)
const getBooksForOrdering = async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT isbn, title, stock_quantity, threshold 
       FROM books 
       ORDER BY title`
    );
    res.json({ books });
  } catch (error) {
    console.error('Get books for ordering error:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
};

module.exports = {
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
};
