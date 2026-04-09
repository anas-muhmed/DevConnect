import { Search, Bell, Plus, Code2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { getAvatarUrl, getInitials, getAvatarColor } from '../utils/avatarUrl';
import { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.profile.profile);
  const [avatarError, setAvatarError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const avatarPath = profile?.avatar || profile?.user?.profilePicture || user?.profilePicture;
  const avatarUrl = getAvatarUrl(avatarPath);
  const displayName = user?.username || 'User';
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Code2 size={24} />
          </div>
          <span className="logo-text">DevConnect</span>
        </Link>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="navbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search developers, topics, blocks..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right: Actions */}
        <div className="navbar-actions">
          <button className="btn-primary flex-center gap-sm" onClick={() => navigate('/create')}>
            <Plus size={18} /> Create Post
          </button>

          <div className="icon-action-container">
            <NotificationDropdown />
          </div>

          <div className="profile-dropdown-container">
            <button className="profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {avatarUrl && !avatarError ? (
                <img src={avatarUrl} alt="Avatar" className="avatar-img" onError={() => setAvatarError(true)} />
              ) : (
                <div className="avatar-placeholder" style={{ backgroundColor: avatarColor }}>{initials}</div>
              )}
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <strong>{displayName}</strong>
                </div>
                <button onClick={() => { setDropdownOpen(false); navigate('/profile'); }}>Profile</button>
                <button onClick={handleLogout} className="text-error">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
