import { useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.view();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (isbn) => {
    try {
      await cartAPI.remove(isbn);
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (isbn, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.updateQuantity(isbn, newQuantity);
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update quantity');
    }
  };

  if (loading) return <div>Loading cart...</div>;

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Your Cart is Empty</h2>
          <p>Start shopping to add items to your cart!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ color: '#212529', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>Shopping Cart</h2>
      <div style={{ marginBottom: '2rem' }}>
        {cart.cartItems.map((item) => (
          <div key={item.isbn} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.title}</h4>
              <p>ISBN: {item.isbn}</p>
              <p>Authors: {item.authors || 'N/A'}</p>
              <p>Price: ${item.price} each</p>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button onClick={() => handleUpdateQuantity(item.isbn, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item.isbn, item.quantity + 1)}>+</button>
              </div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0066cc' }}>${item.item_total}</p>
              <button
                onClick={() => handleRemove(item.isbn)}
                className="btn btn-danger"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ textAlign: 'right' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#212529' }}>Total: <span style={{ color: '#0066cc' }}>${cart.total}</span></h3>
        <button
          onClick={() => navigate('/checkout')}
          className="btn btn-success"
          style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
};

export default Cart;

