import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, cartAPI } from '../services/api';
import { 
  FiBook, 
  FiShoppingCart, 
  FiArrowLeft, 
  FiUser, 
  FiCalendar,
  FiTag,
  FiPackage,
  FiDollarSign
} from 'react-icons/fi';
import './BookDetails.css';

const BookDetails = () => {
  const { isbn } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBook();
  }, [isbn]);

  const fetchBook = async () => {
    try {
      const response = await booksAPI.getByISBN(isbn);
      setBook(response.data.book);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book.available || book.stock_quantity < quantity) {
      setError('Insufficient stock available');
      return;
    }

    setAddingToCart(true);
    setError('');
    setSuccess('');

    try {
      await cartAPI.add({ isbn: book.isbn, quantity });
      setSuccess('Book added to cart successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiBook className="spinner-icon" />
            <p>Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <FiArrowLeft />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <button onClick={() => navigate('/')} className="back-button">
          <FiArrowLeft />
          Back to Search
        </button>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {book && (
          <div className="book-details-card glass-strong fade-in">
            <div className="book-details-content">
              <div className="book-details-info">
                <div className="book-header-section">
                  <h1 className="book-details-title">{book.title}</h1>
                  <div className={`book-status-badge ${book.available ? 'available' : 'unavailable'}`}>
                    {book.available ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                
                <div className="book-details-meta">
                  <div className="meta-item">
                    <FiUser />
                    <span><strong>Authors:</strong> {book.authors || 'Unknown'}</span>
                  </div>
                  <div className="meta-item">
                    <FiTag />
                    <span><strong>Category:</strong> {book.category}</span>
                  </div>
                  <div className="meta-item">
                    <FiCalendar />
                    <span><strong>Year:</strong> {book.publication_year}</span>
                  </div>
                  <div className="meta-item">
                    <FiPackage />
                    <span><strong>Publisher:</strong> {book.publisher_name}</span>
                  </div>
                  <div className="meta-item">
                    <FiBook />
                    <span><strong>ISBN:</strong> {book.isbn}</span>
                  </div>
                  <div className="meta-item">
                    <FiPackage />
                    <span><strong>Stock:</strong> {book.stock_quantity} available</span>
                  </div>
                </div>

                <div className="book-details-price">
                  <FiDollarSign />
                  <span>{parseFloat(book.price).toFixed(2)}</span>
                </div>

                {book.available && (
                  <div className="book-details-actions">
                    <div className="quantity-selector">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        max={book.stock_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock_quantity, parseInt(e.target.value) || 1)))}
                        className="quantity-input"
                      />
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-primary btn-large"
                      disabled={addingToCart || quantity > book.stock_quantity}
                    >
                      {addingToCart ? (
                        <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }} />
                      ) : (
                        <>
                          <FiShoppingCart />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!book.available && (
                  <div className="unavailable-notice">
                    This book is currently out of stock. Please check back later.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
