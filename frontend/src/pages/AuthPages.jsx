import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      showSuccess(`Account registered successfully, welcome ${user.name}!`);
      if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-card shadow-2xl p-4 p-md-5 border-0 rounded-4 bg-white">
      <div className="text-center mb-4">
        <h3 className="fw-bold mb-1">Create Account</h3>
        <p className="text-muted small">Join SmartResolve Issue Management</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary">Full Name</label>
          <input
            type="text"
            className="form-control bg-light"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary">Email Address</label>
          <input
            type="email"
            className="form-control bg-light"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="row g-2 mb-3">
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-bold text-secondary">Phone Number</label>
            <input
              type="tel"
              className="form-control bg-light"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-bold text-secondary">Account Role</label>
            <select
              className="form-select bg-light"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">Student / User</option>
              <option value="staff">Department Staff</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-bold text-secondary">Password</label>
          <input
            type="password"
            className="form-control bg-light"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary-custom w-100 py-2"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center mt-4 pt-2 border-top">
        <p className="text-muted small mb-0">
          Already have an account?{' '}
          <Link to="/login" className="fw-bold text-primary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="custom-card shadow-2xl p-4 p-md-5 border-0 rounded-4 bg-white text-center">
      <div
        className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
        style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '1.5rem' }}
      >
        <i className="bi bi-key"></i>
      </div>
      <h4 className="fw-bold mb-2">Reset Password</h4>
      <p className="text-muted small mb-4">
        Enter your registered email to receive a password recovery link.
      </p>

      {submitted ? (
        <div className="alert alert-success small">
          Password reset instructions have been dispatched to <strong>{email}</strong>.
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <div className="mb-3 text-start">
            <label className="form-label small fw-bold text-secondary">Email</label>
            <input
              type="email"
              className="form-control bg-light"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary-custom w-100 py-2 mb-3">
            Send Reset Link
          </button>
        </form>
      )}

      <div>
        <Link to="/login" className="small text-decoration-none fw-semibold">
          <i className="bi bi-arrow-left me-1"></i> Back to Login
        </Link>
      </div>
    </div>
  );
};

export const NotFound = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 bg-light text-center">
    <div>
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h3 className="fw-bold mb-2">Page Not Found</h3>
      <p className="text-muted small mb-4">
        The requested page does not exist or you do not have permission to view it.
      </p>
      <Link to="/" className="btn btn-primary-custom">
        <i className="bi bi-house-door me-2"></i> Go to Dashboard
      </Link>
    </div>
  </div>
);
