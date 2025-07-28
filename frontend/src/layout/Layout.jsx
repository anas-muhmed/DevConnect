import React, { useState,useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useDispatch } from 'react-redux';
import { fetchMyProfile } from '../redux/profileSlice';
import useDarkMode from '../hooks/useDarkMode';

function Layout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const dispatch = useDispatch();
    const[darkMode]=useDarkMode();

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);


  return (
      <div className={`flex flex-col min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Navbar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-20 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <Navbar />
      </div>
      
      {/* Main content area - starts below navbar */}
      <div className="flex pt-16 h-full">
        {/* Sidebar - pass the state and setter */}
        <Sidebar 
          expanded={sidebarExpanded} 
          setExpanded={setSidebarExpanded} 
        />
        
        {/* Content area - dynamic margin based on sidebar state */}
         <main className={`flex-1 p-6 bg-gray-50 dark:bg-gray-800 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          sidebarExpanded ? 'ml-64' : 'ml-[4.5rem]'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;