import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';

const EditBook = () => {
  const { isbn } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: [],
    publisherName: '',
    publicationYear: '',
    price: '',
    category: '',
    stockQuantity: '',
    threshold: '',
  });
  const [authorsInput, setAuthorsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBook();
  }, [isbn]);

  const fetchBook = async () => {
    try {
      const response = await booksAPI.getByISBN(isbn);
      const bookData = response.data.book;
      setBook(bookData);
      setFormData({
        title: bookData.title || '',
        authors: bookData.authors ? bookData.authors.split(', ') : [],
        publisherName: bookData.publisher_name || '',
        publicationYear: bookData.publication_year || '',
        price: bookData.price || '',
        category: bookData.category || '',
        stockQuantity: bookData.stock_quantity || '',
        threshold: bookData.threshold || '',
      });
      setAuthorsInput(bookData.authors || '');
    } catch (error) {
      console.error('Error fetching book:', error);
      alert('Book not found');
      navigate('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorsChange = (e) => {
    const value = e.target.value;
    setAuthorsInput(value);
    setFormData({
      ...formData,
      authors: value.split(',').map(a => a.trim()).filter(a => a),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const updateData = {
        title: formData.title,
        authors: formData.authors,
        publisherName: formData.publisherName,
        publicationYear: parseInt(formData.publicationYear),
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity),
      };

      await booksAPI.update(isbn, updateData);
      setMessage('Book updated successfully!');
      setTimeout(() => {
        navigate('/admin/books');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading book details...</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/admin/books')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back to Books
      </button>
      <div className="form-container">
        <h2 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>Edit Book</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ISBN (cannot be changed):</label>
            <input type="text" value={isbn} disabled style={{ backgroundColor: '#f0f0f0' }} />
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
              value={authorsInput}
              onChange={handleAuthorsChange}
              placeholder="Author1, Author2, Author3"
              required
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
            <label>Threshold:</label>
            <input
              type="number"
              name="threshold"
              value={formData.threshold}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          {message && (
            <div className={message.includes('success') ? 'alert alert-success' : 'alert alert-error'}>
              {message}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%' }}>
            {saving ? 'Saving...' : '💾 Update Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBook;

