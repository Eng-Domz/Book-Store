import { useState } from 'react';
import { ordersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [creditCard, setCreditCard] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ordersAPI.checkout({
        creditCardNumber: creditCard.replace(/\s/g, ''),
        expiryDate,
      });
      alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Credit Card Number:</label>
          <input
            type="text"
            value={creditCard}
            onChange={(e) => setCreditCard(e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="1234567890123456"
            required
          />
        </div>
        <div className="form-group">
          <label>Expiry Date (MM/YY):</label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
              }
              setExpiryDate(value);
            }}
            placeholder="12/25"
            maxLength="5"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-success"
          style={{ width: '100%' }}
        >
          {loading ? 'Processing...' : '✅ Complete Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;

