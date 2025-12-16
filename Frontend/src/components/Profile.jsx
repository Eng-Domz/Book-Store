import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      setFormData({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // Validate password if provided
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match');
        setSaving(false);
        return;
      }
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters');
        setSaving(false);
        return;
      }
    }

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await authAPI.updateProfile(updateData);
      setMessage('Profile updated successfully!');
      
      // Clear password fields
      setFormData({ ...formData, password: '', confirmPassword: '' });
      
      // Refresh profile
      setTimeout(() => {
        fetchProfile();
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="container">
      <div className="form-container">
        <h2 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e0e0e0' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Change Password (Optional)</h3>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>
            {formData.password && (
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
            )}
          </div>

          {message && (
            <div className={message.includes('success') ? 'alert alert-success' : 'alert alert-error'}>
              {message}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {saving ? 'Saving...' : '💾 Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

