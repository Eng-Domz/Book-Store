import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookDetails = () => {
  const { isbn } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await booksAPI.getByISBN(isbn);
        setBook(response.data.book);
      } catch (error) {
        console.error('Error fetching book:', error);
        alert('Book not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [isbn, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      await cartAPI.add({ isbn, quantity });
      setMessage('Added to cart successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back to Search
      </button>
      <div className="card">
        <h1 style={{ marginBottom: '1.5rem', color: '#333' }}>{book.title}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <p style={{ marginBottom: '0.75rem' }}><strong>ISBN:</strong> {book.isbn}</p>
            <p style={{ marginBottom: '0.75rem' }}><strong>Authors:</strong> {book.authors || 'N/A'}</p>
            <p style={{ marginBottom: '0.75rem' }}><strong>Publisher:</strong> {book.publisher_name}</p>
            <p style={{ marginBottom: '0.75rem' }}><strong>Category:</strong> {book.category}</p>
            <p style={{ marginBottom: '0.75rem' }}><strong>Publication Year:</strong> {book.publication_year}</p>
            <p style={{ marginBottom: '0.75rem' }}><strong>Price:</strong> <span style={{ color: '#0066cc', fontWeight: 'bold', fontSize: '1.2rem' }}>${book.price}</span></p>
            <p style={{ marginBottom: '0.75rem' }}><strong>Stock:</strong> {book.stock_quantity} {book.available ? '✅ Available' : '❌ Out of Stock'}</p>
          </div>
          <div>
            {user && book.available && (
              <div className="card" style={{ background: '#f8f9fa', border: '2px solid #0066cc' }}>
                <h3 style={{ marginBottom: '1rem', color: '#212529' }}>Add to Cart</h3>
                <div className="form-group">
                  <label>Quantity: </label>
                  <input
                    type="number"
                    min="1"
                    max={book.stock_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!book.available}
                  className="btn btn-success"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  🛒 Add to Cart
                </button>
                {message && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{message}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;

