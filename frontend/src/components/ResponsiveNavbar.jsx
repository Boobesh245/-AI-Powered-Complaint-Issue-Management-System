import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ResponsiveSidebar } from './ResponsiveSidebar';

export const ResponsiveNavbar = ({ onSearchChange, searchValue = '' }) => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (role === 'admin' || role === 'super_admin') {
      navigate('/admin/profile');
    } else if (role === 'staff') {
      navigate('/staff/profile');
    } else {
      navigate('/profile');
    }
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="app-navbar">
        {/* Left: Mobile hamburger & search */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary d-md-none border-0 fs-5"
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          <div className="navbar-search d-none d-md-block">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search complaints by ID, title, user..."
              value={searchValue}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="navbar-actions position-relative">
          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              className="notif-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              aria-expanded={showNotifMenu}
              title="Notifications"
            >
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {showNotifMenu && (
              <div
                className="dropdown-menu dropdown-menu-end show p-0 shadow-lg border-0 rounded-3 mt-2"
                style={{
                  position: 'absolute',
                  right: 0,
                  width: '320px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  zIndex: 1050
                }}
              >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-bold small">Notifications ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none small"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="p-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-2 mb-1 cursor-pointer ${n.is_read ? 'bg-white' : 'bg-light'}`}
                        style={{ cursor: 'pointer', borderLeft: n.is_read ? 'none' : '3px solid #4f46e5' }}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.reference_id) {
                            if (role === 'admin' || role === 'super_admin') {
                              navigate(`/admin/complaints/${n.reference_id}`);
                            } else {
                              navigate(`/complaints/${n.reference_id}`);
                            }
                          }
                          setShowNotifMenu(false);
                        }}
                      >
                        <div className="fw-semibold text-dark small">{n.title}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="position-relative">
            <div
              className="user-profile-badge"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="avatar-circle">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="d-none d-lg-block text-start">
                <div className="fw-bold small text-dark">{user?.name || 'User'}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {role?.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              <i className="bi bi-chevron-down text-muted small d-none d-sm-inline"></i>
            </div>

            {showUserMenu && (
              <ul
                className="dropdown-menu dropdown-menu-end show shadow-lg border-0 rounded-3 mt-2"
                style={{ position: 'absolute', right: 0, minWidth: '200px', zIndex: 1050 }}
              >
                <li className="px-3 py-2 border-bottom">
                  <div className="fw-bold small text-dark">{user?.name}</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
                </li>
                <li>
                  <button className="dropdown-item py-2" onClick={handleProfileClick}>
                    <i className="bi bi-person me-2"></i> My Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li>
                  <button className="dropdown-item py-2 text-danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Offcanvas Sidebar Drawer */}
      {showMobileSidebar && (
        <div
          className="offcanvas offcanvas-start show d-md-none"
          tabIndex="-1"
          style={{ visibility: 'visible', backgroundColor: '#0b0f19', width: '280px', zIndex: 1060 }}
        >
          <div className="offcanvas-header border-bottom border-dark">
            <h5 className="offcanvas-title text-white fw-bold">SmartResolve</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowMobileSidebar(false)}
            ></button>
          </div>
          <div className="offcanvas-body p-0">
            <ResponsiveSidebar isMobile={true} closeMobileNav={() => setShowMobileSidebar(false)} />
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {showMobileSidebar && (
        <div
          className="modal-backdrop fade show d-md-none"
          onClick={() => setShowMobileSidebar(false)}
        ></div>
      )}
    </>
  );
};
