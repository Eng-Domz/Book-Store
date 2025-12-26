import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { FiSearch, FiBook, FiFilter, FiX, FiLoader } from 'react-icons/fi';
import './BookSearch.css';

const BookSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['Science', 'Art', 'Religion', 'History', 'Geography'];

  // Load all books on initial page load
  useEffect(() => {
    loadAllBooks();
  }, []);

  // Filter books whenever search query or category changes
  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedCategory, allBooks]);

  const loadAllBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await booksAPI.search({});
      const books = response.data.books || [];
      setAllBooks(books);
      setFilteredBooks(books);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let results = allBooks;

    // Filter by search query (matches title, author, ISBN, publisher)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(book =>
        book.title?.toLowerCase().includes(query) ||
        book.authors?.toLowerCase().includes(query) ||
        book.isbn?.toLowerCase().includes(query) ||
        book.publisher_name?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      results = results.filter(book => book.category === selectedCategory);
    }

    setFilteredBooks(results);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Discover Books</h1>
          <p className="page-subtitle">Search through our extensive collection</p>
        </div>

        <div className="search-section fade-in">
          <div className="search-bar-container glass-strong">
            <FiSearch className="search-bar-icon" />
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search by title, author, ISBN, or publisher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="filter-row">
            <div className="category-filters">
              <button
                className={`filter-btn ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {(searchQuery || selectedCategory) && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <FiX />
                Clear Filters
              </button>
            )}
          </div>

          <div className="results-info">
            <span>{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <FiLoader className="spinner-icon" />
            <p>Loading books...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiBook className="empty-state-icon" />
            <p className="empty-state-text">No books found</p>
            <p className="empty-state-subtext">Try adjusting your search criteria</p>
          </div>
        )}
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
