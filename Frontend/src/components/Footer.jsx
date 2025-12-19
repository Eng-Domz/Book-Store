import { Link } from 'react-router-dom';
import { 
  FiBook, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiGithub
} from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <FiBook className="footer-logo-icon" />
            <span>BookStore</span>
          </div>
          <p className="footer-description">
            Your one-stop destination for discovering and purchasing amazing books. 
            Explore our vast collection and embark on endless reading adventures.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <FiLinkedin />
            </a>
            <a href="#" className="social-link" aria-label="GitHub">
              <FiGithub />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Browse Books</Link>
            </li>
            <li>
              <Link to="/cart">Shopping Cart</Link>
            </li>
            <li>
              <Link to="/orders">My Orders</Link>
            </li>
            <li>
              <Link to="/profile">My Profile</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Categories</h3>
          <ul className="footer-links">
            <li>
              <Link to="/?category=Science">Science</Link>
            </li>
            <li>
              <Link to="/?category=Art">Art</Link>
            </li>
            <li>
              <Link to="/?category=Religion">Religion</Link>
            </li>
            <li>
              <Link to="/?category=History">History</Link>
            </li>
            <li>
              <Link to="/?category=Geography">Geography</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <FiMail />
              <span>support@bookstore.com</span>
            </li>
            <li>
              <FiPhone />
              <span>+20 123 456 7890</span>
            </li>
            <li>
              <FiMapPin />
              <span>123 Book Street, Reading City, RC 12345</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} BookStore. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/terms">Terms of Service</Link>
            <span>|</span>
            <Link to="/privacy">Privacy Policy</Link>
            <span>|</span>
            <Link to="/about">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

