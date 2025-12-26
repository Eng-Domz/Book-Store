import { Link } from 'react-router-dom';
import { 
  FiBook, 
  FiPackage, 
  FiFileText
} from 'react-icons/fi';
import './AdminPanel.css';

const AdminPanel = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage your bookstore</p>
        </div>

        <div className="admin-grid">
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

          <Link to="/admin/reports" className="admin-card glass-card fade-in">
            <div className="admin-card-header">
              <FiFileText className="admin-card-icon" />
              <h3>System Reports</h3>
            </div>
            <p className="admin-card-description">View detailed analytics and sales reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
