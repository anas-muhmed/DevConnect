import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import { useDispatch } from 'react-redux';
import { fetchMyProfile } from '../redux/profileSlice';

function Layout() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  return (
    <div className="layout-wrapper">
      <Navbar />
      <div className="layout-main">
        <aside className="layout-sidebar">
          <Sidebar />
        </aside>
        <main className="layout-content">
          <Outlet />
        </main>
        <aside className="layout-right-panel">
          <RightPanel />
        </aside>
      </div>
    </div>
  );
}

export default Layout;