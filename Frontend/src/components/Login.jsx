import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiBook, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-strong fade-in">
        <div className="auth-header">
          <FiBook className="auth-icon" />
          <h1>Welcome Back</h1>
          <p>Sign in to your BookStore account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">
              <FiMail /> Email Address
            </label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiLock /> Password
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }} />
            ) : (
              <>
                <FiLogIn />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
