import React from 'react';
import { Outlet } from 'react-router-dom';
import { ResponsiveSidebar } from '../components/ResponsiveSidebar';
import { ResponsiveNavbar } from '../components/ResponsiveNavbar';

export const AdminLayout = () => {
  return (
    <div className="app-container">
      <ResponsiveSidebar />
      <div className="app-main">
        <ResponsiveNavbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const UserLayout = () => {
  return (
    <div className="app-container">
      <ResponsiveSidebar />
      <div className="app-main">
        <ResponsiveNavbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const StaffLayout = () => {
  return (
    <div className="app-container">
      <ResponsiveSidebar />
      <div className="app-main">
        <ResponsiveNavbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AuthLayout = () => {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
      }}
    >
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <Outlet />
      </div>
    </div>
  );
};
