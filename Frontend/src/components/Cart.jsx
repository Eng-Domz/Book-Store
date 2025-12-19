import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiArrowRight,
  FiBook
} from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState({ cartItems: [], total: '0.00' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.view();
      setCart(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (isbn) => {
    try {
      await cartAPI.remove(isbn);
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (isbn, quantity) => {
    if (quantity < 1) return;
    
    try {
      await cartAPI.updateQuantity(isbn, quantity);
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update quantity');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiShoppingCart className="spinner-icon" />
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">Review your items</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {cart.cartItems.length === 0 ? (
          <div className="empty-state">
            <FiShoppingCart className="empty-state-icon" />
            <p className="empty-state-text">Your cart is empty</p>
            <p className="empty-state-subtext">Start adding books to your cart</p>
            <Link to="/" className="btn btn-primary">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.cartItems.map((item) => (
                <div key={item.isbn} className="cart-item glass-card fade-in">
                  <div className="cart-item-info">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-authors">by {item.authors || 'Unknown'}</p>
                    <div className="cart-item-price">${parseFloat(item.price).toFixed(2)} each</div>
                  </div>

                  <div className="cart-item-quantity">
                    <button
                      onClick={() => handleUpdateQuantity(item.isbn, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.isbn, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ${parseFloat(item.item_total).toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleRemove(item.isbn)}
                    className="cart-item-remove"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary glass-strong">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${parseFloat(cart.total).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${parseFloat(cart.total).toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary btn-full checkout-btn"
              >
                Proceed to Checkout
                <FiArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
