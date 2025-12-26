import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiLoader, FiArrowLeft, FiSearch } from 'react-icons/fi';
import './AdminBooks.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    // Filter books based on search term
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.isbn.toLowerCase().includes(term) ||
        book.category.toLowerCase().includes(term) ||
        (book.authors && book.authors.toLowerCase().includes(term))
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      const booksData = response.data.books || [];
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiLoader className="spinner-icon" />
            <p>Loading books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <button onClick={() => navigate('/admin')} className="back-button">
          <FiArrowLeft />
          Back to Admin Dashboard
        </button>

        <div className="admin-books-header">
          <div>
            <h1 className="page-title">Manage Books</h1>
            <p className="page-subtitle">Add, edit, and manage your book inventory</p>
          </div>
          <Link to="/admin/books/add" className="btn btn-primary">
            <FiPlus />
            Add New Book
          </Link>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, ISBN, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {searchTerm && (
            <p className="search-results-count">
              Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredBooks.length === 0 && searchTerm ? (
          <div className="empty-state">
            <FiSearch className="empty-state-icon" />
            <p className="empty-state-text">No books match your search</p>
            <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
              Clear Search
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <FiBook className="empty-state-icon" />
            <p className="empty-state-text">No books in inventory</p>
            <Link to="/admin/books/add" className="btn btn-primary">
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="admin-books-table glass-strong fade-in">
            <div className="table-header">
              <div className="table-col-title">Title</div>
              <div className="table-col">ISBN</div>
              <div className="table-col">Category</div>
              <div className="table-col">Price</div>
              <div className="table-col">Stock</div>
              <div className="table-col-actions">Actions</div>
            </div>
            <div className="table-body">
              {filteredBooks.map((book) => (
                <div key={book.isbn} className="table-row">
                  <div className="table-col-title">
                    <div className="book-title-cell">
                      <FiBook className="book-icon-small" />
                      <div>
                        <div className="book-title-text">{book.title}</div>
                        <div className="book-authors-text">
                          {book.authors || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="table-col">{book.isbn}</div>
                  <div className="table-col">
                    <span className="category-badge">{book.category}</span>
                  </div>
                  <div className="table-col">${parseFloat(book.price).toFixed(2)}</div>
                  <div className="table-col">
                    <span className={`stock-badge ${book.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {book.stock_quantity}
                    </span>
                  </div>
                  <div className="table-col-actions">
                    <Link
                      to={`/admin/books/edit/${book.isbn}`}
                      className="action-btn edit-btn"
                    >
                      <FiEdit2 />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooks;
