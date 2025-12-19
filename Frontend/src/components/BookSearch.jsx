import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { FiSearch, FiBook, FiShoppingCart, FiLoader } from 'react-icons/fi';
import './BookSearch.css';

const BookSearch = () => {
  const [searchParams, setSearchParams] = useState({
    title: '',
    isbn: '',
    category: '',
    author: '',
    publisher: ''
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Science', 'Art', 'Religion', 'History', 'Geography'];

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== '')
      );
      
      const response = await booksAPI.search(params);
      setBooks(response.data.books || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchParams({
      title: '',
      isbn: '',
      category: '',
      author: '',
      publisher: ''
    });
    setBooks([]);
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Discover Books</h1>
          <p className="page-subtitle">Search through our extensive collection</p>
        </div>

        <div className="search-card glass-strong fade-in">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-grid">
              <div className="input-group">
                <label className="input-label">
                  <FiBook /> Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  placeholder="Enter book title"
                  value={searchParams.title}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiBook /> ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  className="input"
                  placeholder="Enter ISBN"
                  value={searchParams.isbn}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiBook /> Category
                </label>
                <select
                  name="category"
                  className="input"
                  value={searchParams.category}
                  onChange={handleChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiBook /> Author
                </label>
                <input
                  type="text"
                  name="author"
                  className="input"
                  placeholder="Enter author name"
                  value={searchParams.author}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiBook /> Publisher
                </label>
                <input
                  type="text"
                  name="publisher"
                  className="input"
                  placeholder="Enter publisher name"
                  value={searchParams.publisher}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="search-actions">
              <button type="submit" className="btn btn-primary">
                <FiSearch />
                Search
              </button>
              <button type="button" onClick={handleClear} className="btn btn-secondary">
                Clear
              </button>
            </div>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <FiLoader className="spinner-icon" />
            <p>Searching books...</p>
          </div>
        ) : books.length > 0 ? (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </div>
        ) : books.length === 0 && Object.values(searchParams).some(v => v) ? (
          <div className="empty-state">
            <FiBook className="empty-state-icon" />
            <p className="empty-state-text">No books found</p>
            <p className="empty-state-subtext">Try adjusting your search criteria</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const BookCard = ({ book }) => {
  return (
    <div className="book-card glass-card fade-in">
      <div className="book-info">
        <div className="book-header">
          <div className={`book-badge ${book.available ? 'available' : 'unavailable'}`}>
            {book.available ? 'Available' : 'Out of Stock'}
          </div>
        </div>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-authors">by {book.authors || 'Unknown'}</p>
        <div className="book-meta">
          <span className="book-category">{book.category}</span>
          <span className="book-year">{book.publication_year}</span>
        </div>
        <div className="book-footer">
          <div className="book-price">${parseFloat(book.price).toFixed(2)}</div>
          <Link to={`/books/${book.isbn}`} className="btn btn-accent btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookSearch;
