import React from 'react';

export const StatCard = ({ title, value, icon, color = 'primary', change, changeType = 'neutral' }) => {
  const colorMap = {
    primary: { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff' },
    success: { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' },
    warning: { bg: '#fffbeb', text: '#f59e0b', border: '#fef3c7' },
    danger: { bg: '#fef2f2', text: '#ef4444', border: '#fee2e2' },
    info: { bg: '#f0f9ff', text: '#0ea5e9', border: '#e0f2fe' },
    dark: { bg: '#f1f5f9', text: '#334155', border: '#e2e8f0' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="custom-card kpi-card">
      <div className="d-flex justify-content-between align-items-start">
        <span className="kpi-label">{title}</span>
        <div
          className="kpi-icon-wrapper"
          style={{ backgroundColor: scheme.bg, color: scheme.text, border: `1px solid ${scheme.border}` }}
        >
          <i className={`bi bi-${icon}`}></i>
        </div>
      </div>
      <div>
        <div className="kpi-value">{value !== undefined && value !== null ? value : '-'}</div>
        {change && (
          <div className="d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '0.8rem' }}>
            <span className={changeType === 'increase' ? 'text-success' : changeType === 'decrease' ? 'text-danger' : 'text-muted'}>
              <i className={`bi bi-arrow-${changeType === 'increase' ? 'up-short' : changeType === 'decrease' ? 'down-short' : 'right-short'}`}></i>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon = 'inbox', title = 'No Data Available', message = 'No records matching your criteria were found.', action }) => (
  <div className="custom-card p-5 text-center my-3">
    <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>
      <i className={`bi bi-${icon}`}></i>
    </div>
    <h5 className="fw-bold mb-1">{title}</h5>
    <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: '400px' }}>
      {message}
    </p>
    {action && <div>{action}</div>}
  </div>
);

export const LoadingSpinner = ({ message = 'Loading data...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center p-5">
    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted small fw-semibold">{message}</p>
  </div>
);

export const ConfirmationModal = ({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} disabled={loading}></button>
          </div>
          <div className="modal-body py-4">
            <p className="mb-0 text-muted">{message}</p>
          </div>
          <div className="modal-footer border-top">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ActivityTimeline = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-muted small">No activity history recorded yet.</p>;
  }

  return (
    <div className="activity-timeline mt-2">
      {timeline.map((item, idx) => {
        const isResolved = item.action?.toLowerCase().includes('resolved');
        const isCritical = item.action?.toLowerCase().includes('critical') || item.action?.toLowerCase().includes('breached');

        return (
          <div key={idx} className="timeline-item">
            <div className={`timeline-dot ${isResolved ? 'resolved' : isCritical ? 'critical' : ''}`}></div>
            <div className="timeline-content">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark small">{item.action}</span>
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                </span>
              </div>
              <div className="text-muted small mb-1">{item.details}</div>
              {item.actor && (
                <div className="badge bg-light text-secondary border small" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-person-circle me-1"></i>
                  {item.actor}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
