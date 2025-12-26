import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { 
  FiPackage, 
  FiCheck, 
  FiClock, 
  FiBook,
  FiCalendar,
  FiArrowLeft,
  FiLoader,
  FiPlus,
  FiX
} from 'react-icons/fi';
import './BookOrders.css';

const BookOrders = () => {
  const [orders, setOrders] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ isbn: '', quantity: 10 });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, booksRes] = await Promise.all([
        ordersAPI.getAllBookOrders(),
        ordersAPI.getBooksForOrdering()
      ]);
      setOrders(ordersRes.data.orders || []);
      setBooks(booksRes.data.books || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAllBookOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load book orders');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.isbn || !orderForm.quantity || orderForm.quantity <= 0) {
      setError('Please select a book and enter a valid quantity');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await ordersAPI.createManualOrder({
        isbn: orderForm.isbn,
        quantity: parseInt(orderForm.quantity)
      });
      setSuccess('Order created successfully!');
      setShowOrderForm(false);
      setOrderForm({ isbn: '', quantity: 10 });
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    setConfirming(orderId);
    setError('');
    setSuccess('');

    try {
      await ordersAPI.confirmOrder(orderId);
      setSuccess('Order confirmed successfully!');
      fetchOrders(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm order');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiLoader className="spinner-icon" />
            <p>Loading book orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <button onClick={() => navigate('/admin')} className="back-button">
          <FiArrowLeft />
          Back to Admin Panel
        </button>

        <div className="page-header-row">
          <div className="page-header">
            <h1 className="page-title">Book Orders</h1>
            <p className="page-subtitle">Manage publisher orders</p>
          </div>
          <button 
            onClick={() => setShowOrderForm(true)} 
            className="btn btn-primary"
          >
            <FiPlus />
            Create Order
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showOrderForm && (
          <div className="order-form-overlay">
            <div className="order-form-modal glass-strong">
              <div className="order-form-header">
                <h2>Create Publisher Order</h2>
                <button 
                  onClick={() => setShowOrderForm(false)} 
                  className="close-btn"
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleCreateOrder} className="order-form">
                <div className="form-group">
                  <label htmlFor="book">Select Book</label>
                  <select
                    id="book"
                    value={orderForm.isbn}
                    onChange={(e) => setOrderForm({ ...orderForm, isbn: e.target.value })}
                    required
                  >
                    <option value="">Choose a book...</option>
                    {books.map((book) => (
                      <option key={book.isbn} value={book.isbn}>
                        {book.title} (Stock: {book.stock_quantity}, Threshold: {book.threshold})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity to Order</label>
                  <input
                    type="number"
                    id="quantity"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowOrderForm(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <FiLoader className="spinner-icon" />
                    ) : (
                      <>
                        <FiCheck />
                        Create Order
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage className="empty-state-icon" />
            <p className="empty-state-text">No book orders found</p>
            <p className="empty-state-subtext">All orders have been processed</p>
          </div>
        ) : (
          <div className="book-orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="book-order-card glass-card fade-in">
                <div className="order-card-header">
                  <div className="order-id-section">
                    <FiPackage className="order-icon" />
                    <div>
                      <div className="order-id-text">Order #{order.order_id}</div>
                      <div className="order-date-text">
                        <FiCalendar />
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`order-status ${order.order_status.toLowerCase()}`}>
                    {order.order_status === 'Confirmed' ? (
                      <FiCheck className="status-icon" />
                    ) : (
                      <FiClock className="status-icon" />
                    )}
                    <span>{order.order_status}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-detail-item">
                    <FiBook className="detail-icon" />
                    <div>
                      <div className="detail-label">Book Title</div>
                      <div className="detail-value">{order.title}</div>
                    </div>
                  </div>
                  <div className="order-detail-item">
                    <FiBook className="detail-icon" />
                    <div>
                      <div className="detail-label">ISBN</div>
                      <div className="detail-value">{order.isbn}</div>
                    </div>
                  </div>
                  <div className="order-detail-item">
                    <FiPackage className="detail-icon" />
                    <div>
                      <div className="detail-label">Quantity</div>
                      <div className="detail-value">{order.quantity}</div>
                    </div>
                  </div>
                </div>

                {order.order_status !== 'Confirmed' && (
                  <div className="order-actions">
                    <button
                      onClick={() => handleConfirmOrder(order.order_id)}
                      className="btn btn-primary"
                      disabled={confirming === order.order_id}
                    >
                      {confirming === order.order_id ? (
                        <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }} />
                      ) : (
                        <>
                          <FiCheck />
                          Confirm Order
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookOrders;

