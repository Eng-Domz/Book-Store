import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { FiPackage, FiCalendar, FiDollarSign, FiBook } from 'react-icons/fi';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
    
    if (location.state?.message) {
      setTimeout(() => {
        // Clear message after showing
        window.history.replaceState({}, document.title);
      }, 5000);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getPastOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiPackage className="spinner-icon" />
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">View your order history</p>
        </div>

        {location.state?.message && (
          <div className="success-message">{location.state.message}</div>
        )}

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage className="empty-state-icon" />
            <p className="empty-state-text">No orders yet</p>
            <p className="empty-state-subtext">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="order-card glass-card fade-in">
                <div className="order-header">
                  <div className="order-id">
                    <FiPackage />
                    <span>Order #{order.order_id}</span>
                  </div>
                  <div className="order-date">
                    <FiCalendar />
                    <span>{new Date(order.order_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="order-items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="order-item-info">
                        <FiBook className="order-item-icon" />
                        <div>
                          <div className="order-item-title">{item.title}</div>
                          <div className="order-item-meta">
                            {item.authors && <span>by {item.authors}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="order-item-price">
                        ${parseFloat(item.item_total).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <FiDollarSign />
                    <span>Total: ${parseFloat(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
