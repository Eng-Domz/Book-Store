import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { 
  FiBarChart2, 
  FiCalendar, 
  FiUsers, 
  FiBook, 
  FiPackage,
  FiArrowLeft,
  FiLoader,
  FiTrendingUp,
  FiDollarSign,
  FiSearch
} from 'react-icons/fi';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Report data states
  const [monthlySales, setMonthlySales] = useState(null);
  const [dailySales, setDailySales] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [topCustomers, setTopCustomers] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [bookOrderCount, setBookOrderCount] = useState(null);
  const [selectedISBN, setSelectedISBN] = useState('');
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Load books for the search dropdown
    loadBooks();
  }, []);

  useEffect(() => {
    // Load data when tab changes
    loadTabData();
  }, [activeTab]);

  const loadBooks = async () => {
    try {
      const response = await ordersAPI.getBooksForOrdering();
      setBooks(response.data.books || []);
    } catch (err) {
      console.error('Failed to load books');
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    setError('');

    try {
      switch (activeTab) {
        case 'monthly':
          const monthlyRes = await ordersAPI.getSalesLastMonth();
          setMonthlySales(monthlyRes.data);
          break;
        case 'daily':
          // Don't auto-load, wait for date selection
          break;
        case 'customers':
          const customersRes = await ordersAPI.getTopCustomers();
          setTopCustomers(customersRes.data.topCustomers || []);
          break;
        case 'books':
          const booksRes = await ordersAPI.getTopBooks();
          setTopBooks(booksRes.data.topBooks || []);
          break;
        case 'bookOrders':
          // Don't auto-load, wait for book selection
          break;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSearch = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ordersAPI.getSalesByDate(selectedDate);
      setDailySales(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookOrderSearch = async () => {
    if (!selectedISBN) {
      setError('Please select a book');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ordersAPI.getBookOrderCount(selectedISBN);
      setBookOrderCount(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get order count');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'monthly', label: 'Monthly Sales', icon: FiCalendar },
    { id: 'daily', label: 'Daily Sales', icon: FiDollarSign },
    { id: 'customers', label: 'Top Customers', icon: FiUsers },
    { id: 'books', label: 'Top Books', icon: FiBook },
    { id: 'bookOrders', label: 'Book Order Count', icon: FiPackage }
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <FiLoader className="spinner-icon" />
          <p>Loading report data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'monthly':
        return (
          <div className="report-content">
            <div className="report-description">
              <h3>Total Sales for Previous Month</h3>
              <p>Summarizes all sales that occurred in the month before the current date.</p>
            </div>
            {monthlySales && (
              <div className="report-result glass-card">
                <div className="result-icon">
                  <FiTrendingUp />
                </div>
                <div className="result-info">
                  <div className="result-label">Total Sales (Last Month)</div>
                  <div className="result-value">${parseFloat(monthlySales.totalSales || 0).toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'daily':
        return (
          <div className="report-content">
            <div className="report-description">
              <h3>Total Sales for a Specific Day</h3>
              <p>Select a date to view the total sales for that day.</p>
            </div>
            <div className="search-form">
              <div className="form-group">
                <label htmlFor="date">Select Date</label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <button onClick={handleDateSearch} className="btn btn-primary">
                <FiSearch />
                Get Sales
              </button>
            </div>
            {dailySales && (
              <div className="report-result glass-card">
                <div className="result-icon">
                  <FiDollarSign />
                </div>
                <div className="result-info">
                  <div className="result-label">Sales on {dailySales.date}</div>
                  <div className="result-value">${parseFloat(dailySales.totalSales || 0).toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'customers':
        return (
          <div className="report-content">
            <div className="report-description">
              <h3>Top 5 Customers (Last 3 Months)</h3>
              <p>Customers ranked by total purchase amount in descending order.</p>
            </div>
            {topCustomers.length === 0 ? (
              <div className="empty-state-small">
                <FiUsers className="empty-icon" />
                <p>No customer data available for the last 3 months</p>
              </div>
            ) : (
              <div className="ranking-list">
                {topCustomers.map((customer, index) => (
                  <div key={customer.user_id} className="ranking-item glass-card">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="ranking-info">
                      <div className="ranking-name">{customer.first_name} {customer.last_name}</div>
                      <div className="ranking-email">{customer.email}</div>
                    </div>
                    <div className="ranking-value">${parseFloat(customer.total_purchases).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'books':
        return (
          <div className="report-content">
            <div className="report-description">
              <h3>Top 10 Selling Books (Last 3 Months)</h3>
              <p>Books ranked by the total number of copies sold.</p>
            </div>
            {topBooks.length === 0 ? (
              <div className="empty-state-small">
                <FiBook className="empty-icon" />
                <p>No book sales data available for the last 3 months</p>
              </div>
            ) : (
              <div className="ranking-list">
                {topBooks.map((book, index) => (
                  <div key={book.isbn} className="ranking-item glass-card">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="ranking-info">
                      <div className="ranking-name">{book.title}</div>
                      <div className="ranking-isbn">ISBN: {book.isbn}</div>
                    </div>
                    <div className="ranking-value">{book.total_sold} copies</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'bookOrders':
        return (
          <div className="report-content">
            <div className="report-description">
              <h3>Book Order Count</h3>
              <p>Shows how many times the admin placed orders (replenishment orders) for a particular book.</p>
            </div>
            <div className="search-form">
              <div className="form-group">
                <label htmlFor="book">Select Book</label>
                <select
                  id="book"
                  value={selectedISBN}
                  onChange={(e) => setSelectedISBN(e.target.value)}
                >
                  <option value="">Choose a book...</option>
                  {books.map((book) => (
                    <option key={book.isbn} value={book.isbn}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={handleBookOrderSearch} className="btn btn-primary">
                <FiSearch />
                Get Count
              </button>
            </div>
            {bookOrderCount && (
              <div className="report-result glass-card">
                <div className="result-icon">
                  <FiPackage />
                </div>
                <div className="result-info">
                  <div className="result-label">{bookOrderCount.bookTitle}</div>
                  <div className="result-value">{bookOrderCount.orderCount} orders</div>
                  <div className="result-sublabel">Total replenishment orders placed</div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <button onClick={() => navigate('/admin')} className="back-button">
          <FiArrowLeft />
          Back to Admin Dashboard
        </button>

        <div className="page-header">
          <h1 className="page-title">
            <FiBarChart2 className="title-icon" />
            System Reports
          </h1>
          <p className="page-subtitle">View detailed analytics and sales reports</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="reports-container glass-strong">
          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="tab-icon" />
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

