import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getPastOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ color: '#212529', marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>My Orders</h2>
      {orders.map((order) => (
        <div key={order.order_id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
            <div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Order #{order.order_id}</h3>
              <p style={{ color: '#666' }}>Date: {new Date(order.order_date).toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ color: '#0066cc', fontSize: '1.5rem', fontWeight: '600' }}>${order.total_price}</h3>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Items:</h4>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8f9fa', marginBottom: '0.75rem', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}><strong>{item.title}</strong> (ISBN: {item.isbn})</p>
                <p style={{ color: '#6c757d' }}>Quantity: {item.quantity} × ${item.price_at_purchase} = <strong style={{ color: '#0066cc' }}>${item.item_total}</strong></p>
                {item.authors && <p style={{ color: '#666', fontSize: '0.9rem' }}>Authors: {item.authors}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;

