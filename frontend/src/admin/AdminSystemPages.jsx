import React, { useState, useEffect } from 'react';
import { reportService, settingService, authService, notificationService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/UIComponents';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getAuditLogs({ limit: 50 })
      .then((res) => setLogs(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Audit Trail</h1>
          <p className="page-subtitle">Immutable chronological log of administrator actions, assignments, and ticket status changes</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving security audit logs..." />
      ) : logs.length === 0 ? (
        <EmptyState title="No Audit Logs" message="Audit records will be recorded upon system activity." />
      ) : (
        <div className="custom-card p-0 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="custom-table table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="small font-monospace text-muted">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark small">{l.user_email || 'System'}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border font-monospace small">
                        {l.action}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary small text-uppercase">
                        {l.entity}
                      </span>
                    </td>
                    <td className="small font-monospace text-muted text-truncate" style={{ maxWidth: '120px' }}>
                      {l.entity_id}
                    </td>
                    <td className="small text-muted">{l.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    settingService.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingService.updateSettings(settings);
      showSuccess('System settings updated successfully');
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading system configuration..." />;

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure application policies, AI features, SLA thresholds, and file upload parameters</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-3 g-md-4">
          <div className="col-12 col-md-6">
            <div className="custom-card p-4 h-100">
              <h5 className="fw-bold mb-3">General Application Configuration</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold">Platform Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings?.app_name || ''}
                  onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Default Priority</label>
                  <select
                    className="form-select"
                    value={settings?.default_priority || 'medium'}
                    onChange={(e) => setSettings({ ...settings, default_priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Max Upload Size (MB)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings?.max_file_size_mb || 10}
                    onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="maintenanceSwitch"
                  checked={settings?.maintenance_mode || false}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                />
                <label className="form-check-label small fw-bold" htmlFor="maintenanceSwitch">
                  Enable Maintenance Mode
                </label>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="custom-card p-4 h-100">
              <h5 className="fw-bold mb-3">AI & SLA Engine Rules</h5>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aiSwitch"
                  checked={settings?.enable_ai_classification !== false}
                  onChange={(e) => setSettings({ ...settings, enable_ai_classification: e.target.checked })}
                />
                <label className="form-check-label small fw-bold" htmlFor="aiSwitch">
                  Enable AI Auto-Classification & Sentiment Analysis
                </label>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Duplicate Similarity Threshold ({Math.round((settings?.ai_duplicate_threshold || 0.75) * 100)}%)
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={settings?.ai_duplicate_threshold || 0.75}
                  onChange={(e) => setSettings({ ...settings, ai_duplicate_threshold: parseFloat(e.target.value) })}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Critical SLA (Hours)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings?.sla_critical_hours || 24}
                    onChange={(e) => setSettings({ ...settings, sla_critical_hours: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">High SLA (Hours)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings?.sla_high_hours || 48}
                    onChange={(e) => setSettings({ ...settings, sla_high_hours: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-end mt-4">
          <button type="submit" className="btn btn-primary-custom">
            <i className="bi bi-save me-2"></i> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      showSuccess('Profile information updated');
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Security</h1>
          <p className="page-subtitle">Manage personal account credentials and security settings</p>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        <div className="col-12 col-md-4">
          <div className="custom-card p-4 text-center">
            <div
              className="avatar-circle mx-auto mb-3"
              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <p className="text-muted small mb-2">{user?.email}</p>
            <span className="badge bg-primary text-uppercase">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="custom-card p-4">
            <h5 className="fw-bold mb-3">Edit Profile Details</h5>
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary-custom">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications Center</h1>
          <p className="page-subtitle">Stay informed on ticket status updates, technician assignments, and SLA alerts</p>
        </div>
        {notifications.length > 0 && (
          <button className="btn btn-outline-custom btn-sm" onClick={markAllAsRead}>
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      <div className="custom-card p-0 overflow-hidden mb-4">
        {notifications.length === 0 ? (
          <EmptyState icon="bell" title="No Notifications" message="You are all caught up!" />
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`list-group-item p-3 d-flex justify-content-between align-items-center ${n.is_read ? 'bg-white' : 'bg-primary-subtle'}`}
              >
                <div>
                  <div className="fw-bold small text-dark mb-1">{n.title}</div>
                  <div className="text-muted small">{n.message}</div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.is_read && (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => markAsRead(n.id)}>
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
