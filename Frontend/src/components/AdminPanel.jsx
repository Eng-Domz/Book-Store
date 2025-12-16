import { useState } from 'react';
import { ordersAPI } from '../services/api';

import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [bookOrders, setBookOrders] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchBookOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAllBookOrders();
      setBookOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching book orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (type) => {
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'lastMonth':
          response = await ordersAPI.getSalesLastMonth();
          setReports({ ...reports, lastMonth: response.data });
          break;
        case 'topCustomers':
          response = await ordersAPI.getTopCustomers();
          setReports({ ...reports, topCustomers: response.data.topCustomers });
          break;
        case 'topBooks':
          response = await ordersAPI.getTopBooks();
          setReports({ ...reports, topBooks: response.data.topBooks });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await ordersAPI.confirmOrder(orderId);
      alert('Order confirmed successfully!');
      fetchBookOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to confirm order');
    }
  };

  if (activeTab === 'orders') {
    if (bookOrders.length === 0 && !loading) {
      fetchBookOrders();
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#212529', fontSize: '2rem', fontWeight: '600' }}>Admin Panel</h2>
        <button
          onClick={() => navigate('/admin/books')}
          className="btn btn-primary"
        >
          📚 Manage Books
        </button>
      </div>
      <div className="tabs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
        >
          Publisher Orders
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
        >
          Reports
        </button>
      </div>

      {activeTab === 'orders' && (
        <div>
          <h3 style={{ color: '#495057', marginBottom: '1.5rem', fontWeight: '600' }}>Publisher Orders</h3>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div>
              {bookOrders.length === 0 ? (
                <div className="empty-state">
                  <p>No publisher orders found.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Book</th>
                        <th>Publisher</th>
                        <th>Quantity</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookOrders.map((order) => (
                        <tr key={order.order_id}>
                          <td>{order.order_id}</td>
                          <td>{order.title}</td>
                          <td>{order.publisher_name}</td>
                          <td>{order.quantity}</td>
                          <td>{new Date(order.order_date).toLocaleDateString()}</td>
                          <td>{order.order_status}</td>
                          <td>
                            {order.order_status === 'Pending' && (
                              <button
                                onClick={() => handleConfirmOrder(order.order_id)}
                                className="btn btn-success"
                              >
                                Confirm
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h3 style={{ color: '#495057', marginBottom: '1.5rem', fontWeight: '600' }}>Reports</h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button onClick={() => fetchReports('lastMonth')} className="btn btn-primary">
              📊 Sales Last Month
            </button>
            <button onClick={() => fetchReports('topCustomers')} className="btn btn-primary">
              👥 Top 5 Customers
            </button>
            <button onClick={() => fetchReports('topBooks')} className="btn btn-primary">
              📚 Top 10 Books
            </button>
          </div>

          {reports.lastMonth && (
            <div className="card">
              <h4 style={{ marginBottom: '1rem', color: '#212529' }}>Sales Last Month</h4>
              <p style={{ fontSize: '1.5rem', color: '#0066cc', fontWeight: 'bold' }}>Total Sales: ${reports.lastMonth.totalSales || 0}</p>
            </div>
          )}

          {reports.topCustomers && (
            <div className="table-container">
              <h4 style={{ marginBottom: '1rem', color: '#333' }}>Top 5 Customers (Last 3 Months)</h4>
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Total Purchases</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.topCustomers.map((customer, idx) => (
                    <tr key={idx}>
                      <td>{customer.first_name} {customer.last_name} ({customer.email})</td>
                      <td style={{ fontWeight: 'bold', color: '#0066cc' }}>${customer.total_purchases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reports.topBooks && (
            <div className="table-container">
              <h4 style={{ marginBottom: '1rem', color: '#333' }}>Top 10 Selling Books (Last 3 Months)</h4>
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Total Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.topBooks.map((book, idx) => (
                    <tr key={idx}>
                      <td>{book.title} (ISBN: {book.isbn})</td>
                      <td style={{ fontWeight: 'bold', color: '#0066cc' }}>{book.total_sold} copies</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

