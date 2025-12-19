import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../services/api';
import { FiCreditCard, FiCalendar, FiCheck, FiArrowLeft } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ cartItems: [], total: '0.00' });
  const [formData, setFormData] = useState({
    creditCardNumber: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.view();
      setCart(response.data);
      if (response.data.cartItems.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === 'creditCardNumber') {
      value = value.replace(/\s/g, '').replace(/\D/g, '');
      if (value.length > 0) {
        value = value.match(/.{1,4}/g).join(' ');
      }
    }
    
    if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const cardNumber = formData.creditCardNumber.replace(/\s/g, '');
      const response = await ordersAPI.checkout({
        creditCardNumber: cardNumber,
        expiryDate: formData.expiryDate
      });
      
      navigate('/orders', { 
        state: { 
          message: `Order placed successfully! Order ID: ${response.data.orderId}` 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiCreditCard className="spinner-icon" />
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <button onClick={() => navigate('/cart')} className="back-button">
          <FiArrowLeft />
          Back to Cart
        </button>

        <div className="checkout-content">
          <div className="checkout-form-container glass-strong fade-in">
            <h1 className="checkout-title">Checkout</h1>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <h2 className="section-title">Payment Information</h2>
                
                <div className="input-group">
                  <label className="input-label">
                    <FiCreditCard /> Card Number
                  </label>
                  <input
                    type="text"
                    name="creditCardNumber"
                    className="input"
                    placeholder="1234 5678 9012 3456"
                    value={formData.creditCardNumber}
                    onChange={handleChange}
                    maxLength="19"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <FiCalendar /> Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    className="input"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    maxLength="5"
                    required
                  />
                </div>
              </div>

              <div className="order-summary-section">
                <h2 className="section-title">Order Summary</h2>
                <div className="order-items">
                  {cart.cartItems.map((item) => (
                    <div key={item.isbn} className="order-item">
                      <span>{item.title} x{item.quantity}</span>
                      <span>${parseFloat(item.item_total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total:</span>
                  <span>${parseFloat(cart.total).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-large"
                disabled={processing}
              >
                {processing ? (
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }} />
                ) : (
                  <>
                    <FiCheck />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
