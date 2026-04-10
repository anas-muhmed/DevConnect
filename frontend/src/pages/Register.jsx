import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Code2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      toast.success(res.data.message || 'Account created successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;

      // Backend returns field-specific errors array
      if (data?.errors && Array.isArray(data.errors)) {
        const mapped = {};
        data.errors.forEach(e => { mapped[e.field] = e.message; });
        setFieldErrors(mapped);
        toast.error('Please fix the errors below');
      } else {
        toast.error(data?.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="logo-icon logo-icon-large">
            <Code2 size={40} />
          </div>
          <h1 className="auth-brand-title">DevConnect</h1>
          <p className="auth-brand-subtitle">
            Start your developer journey. Join developers building careers and sharing knowledge.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join the DevConnect community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-with-icon">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`search-input ${fieldErrors.username ? 'input-error' : ''}`}
                  placeholder="Letters and numbers only (e.g. johndoe)"
                  required
                />
              </div>
              {fieldErrors.username && (
                <p className="field-error">{fieldErrors.username}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`search-input ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="john@example.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="field-error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`search-input ${fieldErrors.password ? 'input-error' : ''}`}
                  placeholder="Min 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="field-error">{fieldErrors.password}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`search-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="password-toggle"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="field-error">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary auth-btn flex-center gap-sm mt-6">
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create My Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Already have an account? <Link to="/login">Login Here</Link>
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '16px' }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
