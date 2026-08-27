import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintService, departmentService, categoryService, staffService } from '../services';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { LoadingSpinner, EmptyState, ConfirmationModal } from '../components/UIComponents';
import { useToast } from '../context/ToastContext';

export const ComplaintManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');
  const [departmentId, setDepartmentId] = useState(searchParams.get('department_id') || 'all');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || 'all');
  const [slaStatus, setSlaStatus] = useState(searchParams.get('sla_status') || 'all');

  // Bulk Selection & Modals
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        department_id: departmentId !== 'all' ? departmentId : undefined,
        category_id: categoryId !== 'all' ? categoryId : undefined,
        sla_status: slaStatus !== 'all' ? slaStatus : undefined,
      };

      const res = await complaintService.getComplaints(params);
      setComplaints(res.items || []);
      setTotalPages(res.pages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, departmentId, categoryId, slaStatus, showError]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [d, c, s] = await Promise.all([
          departmentService.getDepartments(),
          categoryService.getCategories(),
          staffService.getStaff()
        ]);
        setDepartments(d);
        setCategories(c);
        setStaffList(s);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(complaints.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (!selectedStaffToAssign) return;
    try {
      await complaintService.bulkAssign(selectedIds, selectedStaffToAssign);
      showSuccess(`Assigned ${selectedIds.length} complaints successfully`);
      setShowBulkAssignModal(false);
      setSelectedIds([]);
      fetchComplaints();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await complaintService.deleteComplaint(deleteTargetId);
      showSuccess('Complaint deleted successfully');
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      fetchComplaints();
    } catch (err) {
      showError(err.message);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setPriority('all');
    setDepartmentId('all');
    setCategoryId('all');
    setSlaStatus('all');
    setPage(1);
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaint Management</h1>
          <p className="page-subtitle">Inspect, assign, prioritize, and manage the full lifecycle of campus complaints</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <a
            href="/api/reports/complaints/csv"
            className="btn btn-outline-custom"
            download="complaints.csv"
          >
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
          </a>
          <a
            href="/api/reports/complaints/pdf"
            className="btn btn-outline-custom"
            download="complaints.pdf"
          >
            <i className="bi bi-file-earmark-pdf me-1"></i> Export PDF
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search ID, title, user..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select bg-light"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_user">Waiting for User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select bg-light"
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select bg-light"
              value={departmentId}
              onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-sm-4 col-md-2">
            <select
              className="form-select bg-light"
              value={slaStatus}
              onChange={(e) => { setSlaStatus(e.target.value); setPage(1); }}
            >
              <option value="all">All SLA Statuses</option>
              <option value="within_sla">Within SLA</option>
              <option value="at_risk">At Risk</option>
              <option value="breached">Breached</option>
            </select>
          </div>

          <div className="col-12 col-sm-4 col-md-1 text-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={resetFilters}
              title="Reset all filters"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedIds.length > 0 && (
          <div className="bg-primary-subtle border border-primary-subtle rounded-3 p-2 mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="small fw-bold text-primary">
              <i className="bi bi-check-square-fill me-1"></i> {selectedIds.length} complaints selected
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowBulkAssignModal(true)}
              >
                <i className="bi bi-person-plus me-1"></i> Bulk Assign Staff
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="custom-card p-0 overflow-hidden mb-4">
        {loading ? (
          <LoadingSpinner message="Fetching complaints database..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon="search"
            title="No Complaints Match Your Criteria"
            message="Try clearing your search terms or filters to view more records."
            action={
              <button className="btn btn-sm btn-outline-primary" onClick={resetFilters}>
                Clear All Filters
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="custom-table table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.length === complaints.length && complaints.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>SLA</th>
                  <th>Staff</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => handleSelectOne(c.id)}
                      />
                    </td>
                    <td>
                      <Link to={`/admin/complaints/${c.id}`} className="fw-bold text-primary text-decoration-none">
                        {c.complaint_number}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }} title={c.title}>
                        {c.title}
                      </div>
                      {c.duplicate_score >= 0.65 && (
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning small" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-copy me-1"></i> Possible Duplicate ({Math.round(c.duplicate_score * 100)}%)
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="small fw-semibold">{c.user_name}</div>
                      <div className="text-muted small" style={{ fontSize: '0.72rem' }}>{c.user_email}</div>
                    </td>
                    <td><span className="badge bg-light text-dark border small">{c.category_name || 'General'}</span></td>
                    <td><span className="small text-muted">{c.department_name || '-'}</span></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <span
                        className={`badge ${
                          c.sla_status === 'within_sla'
                            ? 'bg-success-subtle text-success border border-success'
                            : c.sla_status === 'at_risk'
                            ? 'bg-warning-subtle text-warning-emphasis border border-warning'
                            : 'bg-danger-subtle text-danger border border-danger'
                        } small`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {c.sla_status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {c.assigned_staff_name ? (
                        <span className="small fw-medium text-dark">
                          <i className="bi bi-person-check me-1 text-primary"></i>
                          {c.assigned_staff_name}
                        </span>
                      ) : (
                        <span className="badge bg-light text-muted border">Unassigned</span>
                      )}
                    </td>
                    <td className="small text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="text-end">
                      <div className="dropdown">
                        <button className="btn btn-sm btn-light border-0" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 small">
                          <li>
                            <Link to={`/admin/complaints/${c.id}`} className="dropdown-item">
                              <i className="bi bi-eye me-2 text-primary"></i> View Details
                            </Link>
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => {
                                setDeleteTargetId(c.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <i className="bi bi-trash me-2"></i> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span className="small text-muted">
            Showing {complaints.length} of {totalRecords} total records (Page {page} of {totalPages})
          </span>
          <ul className="pagination pagination-custom mb-0">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
            </li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pNum = i + 1;
              return (
                <li key={pNum} className={`page-item ${page === pNum ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(pNum)}>
                    {pNum}
                  </button>
                </li>
              );
            })}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Bulk Assign Staff</h5>
                <button type="button" className="btn-close" onClick={() => setShowBulkAssignModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted small mb-3">
                  Assign <strong>{selectedIds.length}</strong> selected complaints to a department specialist:
                </p>
                <label className="form-label small fw-bold">Select Staff Member</label>
                <select
                  className="form-select"
                  value={selectedStaffToAssign}
                  onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                >
                  <option value="">Choose Staff...</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department_name || 'General'}) - Workload: {s.current_workload}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer border-top">
                <button className="btn btn-outline-secondary" onClick={() => setShowBulkAssignModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary-custom"
                  disabled={!selectedStaffToAssign}
                  onClick={handleBulkAssign}
                >
                  Assign Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        title="Delete Complaint"
        message="Are you sure you want to permanently delete this complaint and all associated activity history and comments?"
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
        confirmText="Yes, Delete"
        confirmVariant="danger"
      />
    </div>
  );
};
