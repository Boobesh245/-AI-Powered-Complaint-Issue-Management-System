import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services';
import { StatCard, LoadingSpinner, EmptyState } from '../components/UIComponents';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

export const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintService.getComplaints({ limit: 50 })
      .then((res) => setComplaints(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const inProgress = complaints.filter((c) => ['assigned', 'in_progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;
  const overdue = complaints.filter((c) => c.sla_status === 'breached' && !['resolved', 'closed'].includes(c.status)).length;

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Specialist Staff Workbench</h1>
          <p className="page-subtitle">Track your allocated tickets, troubleshoot field issues, and update resolution milestones</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading assigned issues..." />
      ) : (
        <>
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-6 col-md-3">
              <StatCard title="Assigned Tickets" value={total} icon="briefcase" color="primary" />
            </div>
            <div className="col-6 col-md-3">
              <StatCard title="In Progress" value={inProgress} icon="tools" color="info" />
            </div>
            <div className="col-6 col-md-3">
              <StatCard title="Resolved" value={resolved} icon="check-circle" color="success" />
            </div>
            <div className="col-6 col-md-3">
              <StatCard title="SLA Overdue" value={overdue} icon="exclamation-octagon" color="danger" />
            </div>
          </div>

          <div className="custom-card p-4">
            <h5 className="fw-bold mb-3">Active Assigned Tickets</h5>
            {complaints.length === 0 ? (
              <EmptyState icon="check2-all" title="All Clear!" message="No assigned tickets in your work queue." />
            ) : (
              <div className="table-responsive">
                <table className="custom-table table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>SLA Target</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-bold text-primary">{c.complaint_number}</td>
                        <td>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '240px' }}>
                            {c.title}
                          </div>
                        </td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <span className={`badge ${c.sla_status === 'within_sla' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                            {c.sla_status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link to={`/admin/complaints/${c.id}`} className="btn btn-sm btn-primary-custom py-0 px-2 small">
                            Troubleshoot <i className="bi bi-arrow-right ms-1"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
