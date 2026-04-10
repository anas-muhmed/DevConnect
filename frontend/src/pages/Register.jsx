import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Code2, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      toast.success(res.data.message || '🎉 Account created successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left side - Branding & Benefits */}
      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="logo-icon logo-icon-large">
            <Code2 size={40} />
          </div>
          <h1 className="auth-brand-title">DevConnect</h1>
          <p className="auth-brand-subtitle">
            Start your developer journey. Join thousands of developers building careers and sharing knowledge.
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join 10,000+ developers today</p>
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
                  className="search-input"
                  placeholder="johndoe"
                  required
                />
              </div>
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
                  className="search-input"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="search-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="search-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary auth-btn flex-center gap-sm mt-6">
              {isLoading ? (
                <span>Loading...</span>
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
