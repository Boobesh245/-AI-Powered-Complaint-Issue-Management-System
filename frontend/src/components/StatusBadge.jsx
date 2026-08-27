import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s?.toLowerCase()) {
      case 'submitted':
        return 'bg-info text-dark';
      case 'under_review':
        return 'bg-secondary text-white';
      case 'assigned':
        return 'bg-primary text-white';
      case 'in_progress':
        return 'bg-warning text-dark';
      case 'waiting_for_user':
        return 'bg-secondary text-white';
      case 'resolved':
        return 'bg-success text-white';
      case 'closed':
        return 'bg-dark text-white';
      case 'reopened':
        return 'bg-warning text-dark';
      case 'rejected':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-dark';
    }
  };

  const formatStatus = (s) => {
    if (!s) return 'Unknown';
    return s.replace(/_/g, ' ');
  };

  return (
    <span className={`badge badge-pill ${getBadgeClass(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getBadgeClass = (p) => {
    switch (p?.toLowerCase()) {
      case 'critical':
        return 'bg-danger text-white';
      case 'high':
        return 'bg-warning text-dark';
      case 'medium':
        return 'bg-info text-dark';
      case 'low':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <span className={`badge badge-pill ${getBadgeClass(priority)}`}>
      <i className={`bi bi-${priority === 'critical' ? 'exclamation-octagon-fill' : priority === 'high' ? 'exclamation-triangle-fill' : 'flag-fill'} me-1`}></i>
      {priority || 'Medium'}
    </span>
  );
};
