import { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const BookSearch = () => {
  const [searchParams, setSearchParams] = useState({
    isbn: '',
    title: '',
    category: '',
    author: '',
    publisher: '',
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await booksAPI.search(searchParams);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBook = (isbn) => {
    navigate(`/books/${isbn}`);
  };

  return (
    <div className="container">
      <h2 style={{ color: '#212529', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: '600' }}>Search Books</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          name="isbn"
          placeholder="ISBN"
          value={searchParams.isbn}
          onChange={handleChange}
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={searchParams.title}
          onChange={handleChange}
        />
        <select
          name="category"
          value={searchParams.category}
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          <option value="Science">Science</option>
          <option value="Art">Art</option>
          <option value="Religion">Religion</option>
          <option value="History">History</option>
          <option value="Geography">Geography</option>
        </select>
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={searchParams.author}
          onChange={handleChange}
        />
        <input
          type="text"
          name="publisher"
          placeholder="Publisher"
          value={searchParams.publisher}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </form>

      {books.length > 0 && (
        <div>
          <h3 style={{ color: '#495057', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Results ({books.length})</h3>
          <div className="grid grid-2">
            {books.map((book) => (
              <div key={book.isbn} className="book-card">
                <h4>{book.title}</h4>
                <p><strong>ISBN:</strong> {book.isbn}</p>
                <p><strong>Authors:</strong> {book.authors || 'N/A'}</p>
                <p><strong>Category:</strong> {book.category}</p>
                <p><strong>Price:</strong> <span style={{ color: '#0066cc', fontWeight: 'bold', fontSize: '1.1rem' }}>${book.price}</span></p>
                <p><strong>Stock:</strong> {book.stock_quantity} {book.available ? '✅ Available' : '❌ Out of Stock'}</p>
                <button
                  onClick={() => handleViewBook(book.isbn)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSearch;

