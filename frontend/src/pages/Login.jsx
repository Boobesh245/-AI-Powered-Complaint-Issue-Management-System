import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      showSuccess(`Welcome back, ${user.name}!`, 'Login Successful');
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else if (role === 'staff') {
      setEmail('david.staff@example.com');
      setPassword('Staff@123');
    } else if (role === 'user') {
      setEmail('james.smith1@example.com');
      setPassword('User@123');
    }
  };

  return (
    <div className="custom-card shadow-2xl p-4 p-md-5 border-0 rounded-4 bg-white">
      {/* Brand Header */}
      <div className="text-center mb-4">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center text-white shadow"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            fontSize: '1.75rem'
          }}
        >
          <i className="bi bi-shield-check"></i>
        </div>
        <h3 className="fw-bold mb-1">SmartResolve</h3>
        <p className="text-muted small">AI-Powered Complaint & Issue Management System</p>
      </div>

      {/* Quick Demo Switcher */}
      <div className="bg-light p-2 rounded-3 mb-4 border">
        <div className="text-muted small fw-bold text-center mb-2" style={{ fontSize: '0.72rem' }}>
          ⚡ 1-CLICK DEMO LOGIN ACCOUNTS:
        </div>
        <div className="d-flex gap-1 justify-content-center">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary fw-semibold"
            style={{ fontSize: '0.75rem' }}
            onClick={() => setDemoCredentials('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning fw-semibold text-dark"
            style={{ fontSize: '0.75rem' }}
            onClick={() => setDemoCredentials('staff')}
          >
            Staff
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-success fw-semibold"
            style={{ fontSize: '0.75rem' }}
            onClick={() => setDemoCredentials('user')}
          >
            Student/User
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary">Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-envelope text-muted"></i>
            </span>
            <input
              type="email"
              className="form-control border-start-0 ps-0 bg-light"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label small fw-bold text-secondary mb-0">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#4f46e5' }}>
              Forgot password?
            </Link>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-lock text-muted"></i>
            </span>
            <input
              type="password"
              className="form-control border-start-0 ps-0 bg-light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary-custom w-100 py-2 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Authenticating...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center mt-4 pt-2 border-top">
        <p className="text-muted small mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="fw-bold text-primary">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
