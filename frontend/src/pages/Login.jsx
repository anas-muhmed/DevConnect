import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, Code2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      const { token, user, message } = res.data;

      if (!token || !user) {
        toast.error('Invalid login response');
        return;
      }

      toast.success(message || '🎉 Welcome back!');

      const userString = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userString);
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', userString);
      }

      dispatch(loginSuccess({ token, user }));
      navigate('/');
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error('Too many attempts. Please try after 15 minutes');
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
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
            Join the premier community where developers share knowledge, showcase skills, and build meaningful connections.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back!</h2>
            <p>Login to continue your developer journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="you@example.com"
                  required
                />
              </div>
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
                  className="search-input"
                  placeholder="••••••••"
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
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary auth-btn flex-center gap-sm">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Login to DevConnect</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-switch">
              New to DevConnect? <Link to="/register">Create Your Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
