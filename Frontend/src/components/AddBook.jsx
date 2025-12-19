import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { FiBook, FiSave, FiArrowLeft } from 'react-icons/fi';
import './BookForm.css';

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
    threshold: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Science', 'Art', 'Religion', 'History', 'Geography'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        authors: formData.authors.split(',').map(a => a.trim()).filter(a => a),
        publicationYear: parseInt(formData.publicationYear),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        threshold: parseInt(formData.threshold)
      };

      await booksAPI.add(submitData);
      navigate('/admin/books');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="form-title">Add New Book</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  className="input"
                  value={formData.isbn}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Authors (comma-separated) *</label>
              <input
                type="text"
                name="authors"
                className="input"
                placeholder="Author 1, Author 2"
                value={formData.authors}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Publisher Name *</label>
                <input
                  type="text"
                  name="publisherName"
                  className="input"
                  value={formData.publisherName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Publication Year *</label>
                <input
                  type="number"
                  name="publicationYear"
                  className="input"
                  value={formData.publicationYear}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  className="input"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  className="input"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Threshold *</label>
                <input
                  type="number"
                  name="threshold"
                  className="input"
                  value={formData.threshold}
                  onChange={handleChange}
                  required
                />
              </div>
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
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }} />
                ) : (
                  <>
                    <FiSave />
                    Add Book
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

export default AddBook;
