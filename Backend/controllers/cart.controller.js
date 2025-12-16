const db = require('../config/db');

// Helper function to get or create cart for user
const getOrCreateCart = async (userId) => {
  let [carts] = await db.query('SELECT cart_id FROM Carts WHERE user_id = ?', [userId]);
  
  if (carts.length === 0) {
    const [result] = await db.query('INSERT INTO Carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
  }
  
  return carts[0].cart_id;
};

// Add book to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { isbn, quantity } = req.body;

    if (!isbn || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'ISBN and valid quantity are required' });
    }

    // Check if book exists and is available
    const [books] = await db.query(
      'SELECT isbn, title, price, stock_quantity FROM Books WHERE isbn = ?',
      [isbn]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];
    if (book.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    // Get or create cart
    const cartId = await getOrCreateCart(userId);

    // Check if item already in cart
    const [existingItems] = await db.query(
      'SELECT quantity FROM Cart_Items WHERE cart_id = ? AND isbn = ?',
      [cartId, isbn]
    );

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      if (book.stock_quantity < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock available' });
      }
      await db.query(
        'UPDATE Cart_Items SET quantity = ? WHERE cart_id = ? AND isbn = ?',
        [newQuantity, cartId, isbn]
      );
      res.json({ message: 'Cart updated successfully' });
    } else {
      // Add new item
      await db.query(
        'INSERT INTO Cart_Items (cart_id, isbn, quantity) VALUES (?, ?, ?)',
        [cartId, isbn, quantity]
      );
      res.json({ message: 'Item added to cart successfully' });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// View cart
const viewCart = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get user's cart
    const [carts] = await db.query('SELECT cart_id FROM Carts WHERE user_id = ?', [userId]);
    
    if (carts.length === 0) {
      return res.json({ cartItems: [], total: '0.00' });
    }

    const cartId = carts[0].cart_id;

    const [cartItems] = await db.query(
      `SELECT ci.isbn, b.title, b.price, ci.quantity,
              (b.price * ci.quantity) as item_total,
              GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
       FROM Cart_Items ci
       JOIN Books b ON ci.isbn = b.isbn
       LEFT JOIN Book_Authors ba ON b.isbn = ba.isbn
       LEFT JOIN Authors a ON ba.author_id = a.author_id
       WHERE ci.cart_id = ?
       GROUP BY ci.isbn, b.title, b.price, ci.quantity`,
      [cartId]
    );

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.item_total), 0);

    res.json({
      cartItems,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('View cart error:', error);
    res.status(500).json({ error: 'Failed to view cart' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { isbn } = req.params;

    // Get user's cart
    const [carts] = await db.query('SELECT cart_id FROM Carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartId = carts[0].cart_id;

    const [result] = await db.query(
      'DELETE FROM Cart_Items WHERE cart_id = ? AND isbn = ?',
      [cartId, isbn]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Update cart item quantity
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { isbn } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Get user's cart
    const [carts] = await db.query('SELECT cart_id FROM Carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartId = carts[0].cart_id;

    // Get cart item and check stock
    const [cartItems] = await db.query(
      `SELECT ci.isbn, b.stock_quantity 
       FROM Cart_Items ci 
       JOIN Books b ON ci.isbn = b.isbn 
       WHERE ci.cart_id = ? AND ci.isbn = ?`,
      [cartId, isbn]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItems[0].stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    await db.query(
      'UPDATE Cart_Items SET quantity = ? WHERE cart_id = ? AND isbn = ?',
      [quantity, cartId, isbn]
    );

    res.json({ message: 'Cart quantity updated successfully' });
  } catch (error) {
    console.error('Update cart quantity error:', error);
    res.status(500).json({ error: 'Failed to update cart quantity' });
  }
};

module.exports = {
  addToCart,
  viewCart,
  removeFromCart,
  updateCartQuantity
};
