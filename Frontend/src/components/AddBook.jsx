import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    authors: '',
    publisherName: '',
    publicationYear: '',
    price: '',
    category: '',
    stockQuantity: '',
    threshold: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authorsArray = formData.authors.split(',').map(a => a.trim()).filter(a => a);
      
      await booksAPI.add({
        isbn: formData.isbn,
        title: formData.title,
        authors: authorsArray,
        publisherName: formData.publisherName,
        publicationYear: parseInt(formData.publicationYear),
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity),
        threshold: parseInt(formData.threshold),
      });

      alert('Book added successfully!');
      navigate('/admin/books');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/admin/books')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back to Books
      </button>
      <div className="form-container">
        <h2 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>Add New Book</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ISBN:</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              placeholder="13-digit ISBN"
              maxLength="13"
            />
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Authors (comma-separated):</label>
            <input
              type="text"
              name="authors"
              value={formData.authors}
              onChange={handleChange}
              required
              placeholder="Author1, Author2, Author3"
            />
          </div>
          <div className="form-group">
            <label>Publisher Name:</label>
            <input
              type="text"
              name="publisherName"
              value={formData.publisherName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Publication Year:</label>
            <input
              type="number"
              name="publicationYear"
              value={formData.publicationYear}
              onChange={handleChange}
              required
              min="1000"
              max={new Date().getFullYear()}
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Science">Science</option>
              <option value="Art">Art</option>
              <option value="Religion">Religion</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
            </select>
          </div>
          <div className="form-group">
            <label>Stock Quantity:</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Threshold (minimum stock):</label>
            <input
              type="number"
              name="threshold"
              value={formData.threshold}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-success" style={{ width: '100%' }}>
            {loading ? 'Adding...' : '➕ Add Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;

