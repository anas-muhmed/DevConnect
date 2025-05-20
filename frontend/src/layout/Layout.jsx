import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function Layout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-20 h-16">
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
        <main className={`flex-1 p-6 bg-gray-50 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          sidebarExpanded ? 'ml-64' : 'ml-[4.5rem]'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;