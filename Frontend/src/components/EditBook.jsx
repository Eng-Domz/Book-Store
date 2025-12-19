import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { FiBook, FiSave, FiArrowLeft } from 'react-icons/fi';
import './BookForm.css';

const EditBook = () => {
  const { isbn } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    publisherName: '',
    publicationYear: '',
    price: '',
    category: '',
    stockQuantity: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Science', 'Art', 'Religion', 'History', 'Geography'];

  useEffect(() => {
    fetchBook();
  }, [isbn]);

  const fetchBook = async () => {
    try {
      const response = await booksAPI.getByISBN(isbn);
      const book = response.data.book;
      setFormData({
        title: book.title || '',
        authors: book.authors || '',
        publisherName: book.publisher_name || '',
        publicationYear: book.publication_year || '',
        price: book.price || '',
        category: book.category || '',
        stockQuantity: book.stock_quantity || ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        authors: formData.authors.split(',').map(a => a.trim()).filter(a => a),
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined
      };

      await booksAPI.update(isbn, submitData);
      navigate('/admin/books');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiBook className="spinner-icon" />
            <p>Loading book...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <button onClick={() => navigate('/admin/books')} className="back-button">
          <FiArrowLeft />
          Back to Books
        </button>

        <div className="book-form-card glass-strong fade-in">
          <div className="form-header">
            <FiBook className="form-icon" />
            <h1 className="form-title">Edit Book</h1>
            <p className="form-subtitle">ISBN: {isbn}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Authors (comma-separated)</label>
                <input
                  type="text"
                  name="authors"
                  className="input"
                  placeholder="Author 1, Author 2"
                  value={formData.authors}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Publisher Name</label>
                <input
                  type="text"
                  name="publisherName"
                  className="input"
                  value={formData.publisherName}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Publication Year</label>
                <input
                  type="number"
                  name="publicationYear"
                  className="input"
                  value={formData.publicationYear}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  className="input"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                className="input"
                value={formData.stockQuantity}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/admin/books')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }} />
                ) : (
                  <>
                    <FiSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBook;
