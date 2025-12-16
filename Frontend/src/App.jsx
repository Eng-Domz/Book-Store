import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import BookSearch from './components/BookSearch';
import BookDetails from './components/BookDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import AdminPanel from './components/AdminPanel';
import AdminBooks from './components/AdminBooks';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav>
      <div>
        <div>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            📚 BookStore
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/">🔍 Search Books</Link>
              <Link to="/cart">🛒 Cart</Link>
              <Link to="/orders">📦 My Orders</Link>
              <Link to="/profile">👤 Profile</Link>
              {isAdmin() && (
                <Link to="/admin">⚙️ Admin</Link>
              )}
              <span style={{ color: '#495057', fontWeight: '500', fontSize: '0.95rem' }}>Welcome, {user.first_name}</span>
              <button
                onClick={logout}
                className="btn btn-danger"
                style={{ padding: '0.5rem 1rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <BookSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/:isbn"
              element={
                <ProtectedRoute>
                  <BookDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute adminOnly>
                  <AdminBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books/add"
              element={
                <ProtectedRoute adminOnly>
                  <AddBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books/edit/:isbn"
              element={
                <ProtectedRoute adminOnly>
                  <EditBook />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
