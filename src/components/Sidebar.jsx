import { Link } from 'react-router-dom';
import {
  Home, MessageSquare, Users, Compass,
  Bookmark, Bell, ChevronLeft, ChevronRight,
  Moon, Sun
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ expanded, setExpanded }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`
      ${expanded ? 'w-64' : 'w-16'}
      min-h-screen bg-white dark:bg-gray-900
      border-r border-gray-200 dark:border-gray-700
      transition-all duration-200 ease-in-out
      flex flex-col sticky top-0 left-0
      shrink-0
    `}>
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="
          absolute -right-3 top-4 z-50
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-full p-1 shadow-md
          hover:bg-gray-100 dark:hover:bg-gray-700
        "
      >
        {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto py-6 px-2 space-y-2">
        {[
          { icon: <Home className="h-5 w-5" />, label: 'Feed', path: '/' },
          { icon: <MessageSquare className="h-5 w-5" />, label: 'Discussions', path: '/discussions' },
          { icon: <Users className="h-5 w-5" />, label: 'Communities', path: '/communities' },
          { icon: <Compass className="h-5 w-5" />, label: 'Explore', path: '/explore' },
        ].map(item => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center p-2 rounded-lg text-sm
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${expanded ? 'px-4' : 'justify-center'}
              transition-colors group
            `}
          >
            <span>{item.icon}</span>
            {expanded && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-4" />

        {/* YOUR SPACE */}
        {expanded && (
          <h3 className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-4">YOUR SPACE</h3>
        )}

        {[
          { icon: <Bookmark className="h-5 w-5" />, label: 'Saved', path: '/saved' },
          { icon: <Bell className="h-5 w-5" />, label: 'Notifications', path: '/notifications' },
        ].map(item => (
          <Link
            key={item.label}
            to={item.path}
            onClick={() => !expanded && setExpanded(true)}
            className={`flex items-center p-2 rounded-lg text-sm
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${expanded ? 'px-4' : 'justify-center'}
              transition-colors
            `}
          >
            <span>{item.icon}</span>
            {expanded && <span className="ml-3">{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Dark mode switch */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center p-2 rounded-lg
            bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            ${expanded ? 'px-4' : 'justify-center'}
            transition-colors
          `}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {expanded && (
            <span className="ml-3 text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;