import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, Compass, Bookmark, Bell } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} />, label: 'Feed', path: '/' },
    { icon: <MessageSquare size={20} />, label: 'Discussions', path: '/discussions' },
    { icon: <Users size={20} />, label: 'Communities', path: '/communities' },
    { icon: <Compass size={20} />, label: 'Explore', path: '/explore' },
  ];

  const personalItems = [
    { icon: <Bookmark size={20} />, label: 'Saved', path: '/saved' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
  ];

  const renderLinks = (items) => (
    items.map(item => (
      <Link
        key={item.label}
        to={item.path}
        className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
      >
        <span className="sidebar-icon">{item.icon}</span>
        <span className="sidebar-label">{item.label}</span>
      </Link>
    ))
  );

  return (
    <div className="sidebar-container">
      <div className="sidebar-section">
        <h3 className="sidebar-heading">MENU</h3>
        <nav className="sidebar-nav">
          {renderLinks(navItems)}
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-heading">YOUR SPACE</h3>
        <nav className="sidebar-nav">
          {renderLinks(personalItems)}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;