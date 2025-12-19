import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { 
  FiBarChart2, 
  FiUsers, 
  FiBook, 
  FiPackage, 
  FiTrendingUp,
  FiCalendar,
  FiDollarSign
} from 'react-icons/fi';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    salesLastMonth: 0,
    topCustomers: [],
    topBooks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [salesRes, customersRes, booksRes] = await Promise.all([
        ordersAPI.getSalesLastMonth(),
        ordersAPI.getTopCustomers(),
        ordersAPI.getTopBooks()
      ]);

      setStats({
        salesLastMonth: salesRes.data.totalSales || 0,
        topCustomers: customersRes.data.topCustomers || [],
        topBooks: booksRes.data.topBooks || []
      });
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiBarChart2 className="spinner-icon" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage your bookstore</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-grid">
          <div className="admin-card glass-card fade-in">
            <div className="admin-card-header">
              <FiDollarSign className="admin-card-icon" />
              <h3>Sales Last Month</h3>
            </div>
            <div className="admin-card-value">
              ${parseFloat(stats.salesLastMonth).toFixed(2)}
            </div>
          </div>

          <Link to="/admin/books" className="admin-card glass-card fade-in">
            <div className="admin-card-header">
              <FiBook className="admin-card-icon" />
              <h3>Manage Books</h3>
            </div>
            <p className="admin-card-description">Add, edit, and manage book inventory</p>
          </Link>

          <Link to="/admin/book-orders" className="admin-card glass-card fade-in">
            <div className="admin-card-header">
              <FiPackage className="admin-card-icon" />
              <h3>Book Orders</h3>
            </div>
            <p className="admin-card-description">View and confirm publisher orders</p>
          </Link>
        </div>

        <div className="admin-sections">
          <div className="admin-section glass-strong fade-in">
            <h2 className="section-title">
              <FiTrendingUp />
              Top Customers (Last 3 Months)
            </h2>
            {stats.topCustomers.length === 0 ? (
              <p className="empty-text">No customer data available</p>
            ) : (
              <div className="top-list">
                {stats.topCustomers.map((customer, index) => (
                  <div key={customer.user_id} className="top-item">
                    <div className="top-rank">#{index + 1}</div>
                    <div className="top-info">
                      <div className="top-name">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="top-email">{customer.email}</div>
                    </div>
                    <div className="top-value">
                      ${parseFloat(customer.total_purchases).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section glass-strong fade-in">
            <h2 className="section-title">
              <FiBook />
              Top Selling Books (Last 3 Months)
            </h2>
            {stats.topBooks.length === 0 ? (
              <p className="empty-text">No book sales data available</p>
            ) : (
              <div className="top-list">
                {stats.topBooks.map((book, index) => (
                  <div key={book.isbn} className="top-item">
                    <div className="top-rank">#{index + 1}</div>
                    <div className="top-info">
                      <div className="top-name">{book.title}</div>
                      <div className="top-isbn">ISBN: {book.isbn}</div>
                    </div>
                    <div className="top-value">{book.total_sold} sold</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
