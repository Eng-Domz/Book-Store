import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm) ||
    (book.authors && book.authors.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading books...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#212529', fontSize: '2rem', fontWeight: '600' }}>Manage Books</h2>
        <button
          onClick={() => navigate('/admin/books/add')}
          className="btn btn-success"
        >
          ➕ Add New Book
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="🔍 Search books by title, ISBN, or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem' }}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <p>No books found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.isbn}>
                  <td>{book.isbn}</td>
                  <td>{book.title}</td>
                  <td>{book.authors || 'N/A'}</td>
                  <td>{book.category}</td>
                  <td>${book.price}</td>
                  <td style={{ color: book.stock_quantity < book.threshold ? '#dc3545' : '#28a745', fontWeight: '600' }}>
                    {book.stock_quantity}
                  </td>
                  <td>{book.threshold}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/admin/books/edit/${book.isbn}`)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;

