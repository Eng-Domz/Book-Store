import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiUserPlus,
  FiBook,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX
} from 'react-icons/fi';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Validate name (only letters, at least 3 characters)
  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (!/^[A-Za-z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  // Validate phone (must start with 012, 015, 010, or 011 and be exactly 11 digits)
  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11) return 'Phone number must be exactly 11 digits';
    const validPrefixes = ['012', '015', '010', '011'];
    const prefix = cleaned.substring(0, 3);
    if (!validPrefixes.includes(prefix)) {
      return 'Phone number must start with 012, 015, 010, or 011';
    }
    return '';
  };

  // Validate password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { label: '', color: '' },
      1: { label: 'Very Weak', color: '#ff6b6b' },
      2: { label: 'Weak', color: '#ffa500' },
      3: { label: 'Fair', color: '#ffd700' },
      4: { label: 'Good', color: '#90ee90' },
      5: { label: 'Strong', color: '#4caf50' }
    };

    return strengthMap[strength] || strengthMap[0];
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'firstName':
        error = validateName(value);
        break;
      case 'lastName':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    setErrors({ ...errors, [field]: error });
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Format phone number input
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, ''); // Remove non-digits
      if (processedValue.length > 11) {
        processedValue = processedValue.substring(0, 11);
      }
    }
    
    // Format name input (only letters and spaces)
    if (name === 'firstName' || name === 'lastName') {
      processedValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Validate confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, processedValue);
      setErrors({ ...errors, confirmPassword: confirmError });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const fieldsToValidate = ['firstName', 'lastName', 'phone', 'password', 'confirmPassword'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      setTouched({
        firstName: true,
        lastName: true,
        phone: true,
        password: true,
        confirmPassword: true
      });
      return;
    }

    setLoading(true);

    const result = await signup({
      ...formData,
      confirmPassword: undefined // Don't send confirmPassword to backend
    });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-card glass-strong fade-in">
        <div className="auth-header">
          <FiBook className="auth-icon" />
          <h1>Create Account</h1>
          <p>Join BookStore and start exploring</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">
                <FiUser /> First Name *
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="firstName"
                  className={`input ${touched.firstName && errors.firstName ? 'input-error' : ''} ${touched.firstName && !errors.firstName && formData.firstName ? 'input-success' : ''}`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                  required
                />
                {touched.firstName && !errors.firstName && formData.firstName && (
                  <FiCheck className="input-icon-success" />
                )}
                {touched.firstName && errors.firstName && (
                  <FiX className="input-icon-error" />
                )}
              </div>
              {touched.firstName && errors.firstName && (
                <span className="error-text">{errors.firstName}</span>
              )}
              {touched.firstName && !errors.firstName && formData.firstName && (
                <span className="success-text">Looks good!</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiUser /> Last Name *
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="lastName"
                  className={`input ${touched.lastName && errors.lastName ? 'input-error' : ''} ${touched.lastName && !errors.lastName && formData.lastName ? 'input-success' : ''}`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                  required
                />
                {touched.lastName && !errors.lastName && formData.lastName && (
                  <FiCheck className="input-icon-success" />
                )}
                {touched.lastName && errors.lastName && (
                  <FiX className="input-icon-error" />
                )}
              </div>
              {touched.lastName && errors.lastName && (
                <span className="error-text">{errors.lastName}</span>
              )}
              {touched.lastName && !errors.lastName && formData.lastName && (
                <span className="success-text">Looks good!</span>
              )}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiMail /> Email Address *
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                className="input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiLock /> Password *
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`input ${touched.password && errors.password ? 'input-error' : ''} ${touched.password && !errors.password && formData.password ? 'input-success' : ''}`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
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
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                {passwordStrength.label && (
                  <span className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>
            )}
            {touched.password && errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
            {!formData.password && (
              <span className="hint-text">Must be at least 8 characters</span>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiLock /> Confirm Password *
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`input ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''} ${touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword ? 'input-success' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                <FiCheck className="input-icon-success" />
              )}
              {touched.confirmPassword && errors.confirmPassword && (
                <FiX className="input-icon-error" />
              )}
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
            {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
              <span className="success-text">Passwords match!</span>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiPhone /> Phone Number *
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                name="phone"
                className={`input ${touched.phone && errors.phone ? 'input-error' : ''} ${touched.phone && !errors.phone && formData.phone ? 'input-success' : ''}`}
                placeholder="01234567890"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                maxLength="11"
                required
              />
              {touched.phone && !errors.phone && formData.phone && (
                <FiCheck className="input-icon-success" />
              )}
              {touched.phone && errors.phone && (
                <FiX className="input-icon-error" />
              )}
            </div>
            {touched.phone && errors.phone && (
              <span className="error-text">{errors.phone}</span>
            )}
            {!formData.phone && (
              <span className="hint-text">Must start with 012, 015, 010, or 011 (11 digits)</span>
            )}
            {touched.phone && !errors.phone && formData.phone && (
              <span className="success-text">Valid phone number!</span>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiMapPin /> Address *
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                name="address"
                className="input"
                placeholder="123 Main St, City, Country"
                value={formData.address}
                onChange={handleChange}
                required
              />
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
                <FiUserPlus />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
