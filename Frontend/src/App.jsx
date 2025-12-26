import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import BookSearch from './components/BookSearch';
import BookDetails from './components/BookDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import AdminPanel from './components/AdminPanel';
import AdminBooks from './components/AdminBooks';
import BookOrders from './components/BookOrders';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import Profile from './components/Profile';
import Reports from './components/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

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
            <Route
              path="/admin/book-orders"
              element={
                <ProtectedRoute adminOnly>
                  <BookOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute adminOnly>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
