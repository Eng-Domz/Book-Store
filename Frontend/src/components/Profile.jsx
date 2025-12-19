import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit2 } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, getProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    } catch (err) {
      setError('Failed to load profile');
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
    setSuccess('');
    setSaving(true);

    try {
      await authAPI.updateProfile(formData);
      await fetchProfile();
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <FiUser className="spinner-icon" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-card glass-strong fade-in">
          <div className="profile-header">
            <div className="profile-avatar">
              <FiUser />
            </div>
            <h2 className="profile-name">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="profile-email">{user?.email}</p>
            {user?.user_type === 'ADMIN' && (
              <span className="admin-badge">Administrator</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">
                  <FiUser /> First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FiUser /> Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiMail /> Email
              </label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiPhone /> Phone
              </label>
              <input
                type="tel"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <FiMapPin /> Address
              </label>
              <input
                type="text"
                name="address"
                className="input"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
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
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn btn-primary"
                >
                  <FiEdit2 />
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
