import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiBook, 
  FiSearch, 
  FiShoppingCart, 
  FiPackage, 
  FiUser, 
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';
import './Navigation.css';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <FiBook className="logo-icon" />
          <span>BookStore</span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiSearch />
                <span>Search</span>
              </Link>
              <Link 
                to="/cart" 
                className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiShoppingCart />
                <span>Cart</span>
              </Link>
              <Link 
                to="/orders" 
                className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiPackage />
                <span>Orders</span>
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiUser />
                <span>Profile</span>
              </Link>
              {isAdmin() && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiSettings />
                  <span>Admin</span>
                </Link>
              )}
              <div className="user-info">
                <span className="user-name">Welcome, {user.first_name}</span>
                <button onClick={logout} className="btn btn-danger">
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

