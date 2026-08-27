import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ResponsiveSidebar = ({ isMobile = false, closeMobileNav = () => {} }) => {
  const { role, logout, user } = useAuth();
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isStaff = role === 'staff';

  const handleNavClick = () => {
    if (isMobile) closeMobileNav();
  };

  return (
    <aside className={isMobile ? 'd-flex flex-column h-100' : 'app-sidebar'}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <i className="bi bi-shield-check"></i>
        </div>
        <div>
          <div className="sidebar-brand-title">SmartResolve</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>AI Issue Management</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <ul className="sidebar-menu">
        {isAdmin && (
          <>
            <li className="menu-category-title">Core Admin</li>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-grid-1x2-fill"></i>
                <span>Dashboard Overview</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-inbox-fill"></i>
                <span>Complaints</span>
              </NavLink>
            </li>

            <li className="menu-category-title">People & Org</li>
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-people-fill"></i>
                <span>User Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-person-badge-fill"></i>
                <span>Staff Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/departments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-building"></i>
                <span>Departments</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-tags-fill"></i>
                <span>Categories</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/priorities" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-sliders"></i>
                <span>Priorities & SLA</span>
              </NavLink>
            </li>

            <li className="menu-category-title">Intelligence & Reports</li>
            <li>
              <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-bar-chart-line-fill"></i>
                <span>Analytics Hub</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-file-earmark-bar-graph-fill"></i>
                <span>Reports & Exports</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/feedback" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-star-half"></i>
                <span>Feedback & Reviews</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-clock-history"></i>
                <span>Audit Logs</span>
              </NavLink>
            </li>

            <li className="menu-category-title">System</li>
            <li>
              <NavLink to="/admin/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-bell-fill"></i>
                <span>Notifications</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-gear-fill"></i>
                <span>System Settings</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-person-circle"></i>
                <span>Admin Profile</span>
              </NavLink>
            </li>
          </>
        )}

        {isStaff && (
          <>
            <li className="menu-category-title">Staff Portal</li>
            <li>
              <NavLink to="/staff/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-grid-1x2-fill"></i>
                <span>Staff Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-list-task"></i>
                <span>Assigned Issues</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-person-circle"></i>
                <span>My Profile</span>
              </NavLink>
            </li>
          </>
        )}

        {!isAdmin && !isStaff && (
          <>
            <li className="menu-category-title">User Portal</li>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-grid-1x2-fill"></i>
                <span>User Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/complaints/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-plus-circle-fill text-primary"></i>
                <span>Submit Complaint</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-card-checklist"></i>
                <span>My Complaints</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-bell-fill"></i>
                <span>Notifications</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleNavClick}>
                <i className="bi bi-person-circle"></i>
                <span>My Profile</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="text-truncate">
            <div className="text-white small fw-bold text-truncate" style={{ maxWidth: '120px' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {role?.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-sm btn-outline-danger border-0 p-1"
          title="Logout"
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
        </button>
      </div>
    </aside>
  );
};
