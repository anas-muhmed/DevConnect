import { Search, Bell, MessageCircle, User, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice'; // adjust path

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const handleProfile = () => navigate('/profile');
  const handleCreatePost = () => navigate('/create');
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-gray-100 px-6 py-3 flex items-center justify-between border-b border-gray-700 h-full">
      {/* Left: Logo and Navigation */}
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-xl font-semibold tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DevConnect
          </span>
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">Feed</Link>
          <Link to="/communities" className="text-gray-300 hover:text-white transition-colors">Communities</Link>
          <Link to="/explore" className="text-gray-300 hover:text-white transition-colors">Explore</Link>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search posts, developers, topics..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleCreatePost}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Create</span>
        </button>
        
        <div className="flex items-center space-x-4 text-gray-300">
          <button className="p-1.5 rounded-full hover:bg-gray-700 transition-colors relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </button>
          
          <button className="p-1.5 rounded-full hover:bg-gray-700 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">5</span>
          </button>
          
          {user ? (
            <>
              <button 
                onClick={handleProfile}
                className="flex items-center space-x-2 hover:bg-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                <img
                  src={user.profilePicture}
                  alt="profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-3 py-1.5 rounded hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-500 px-3 py-1.5 rounded hover:bg-blue-600 text-sm">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
