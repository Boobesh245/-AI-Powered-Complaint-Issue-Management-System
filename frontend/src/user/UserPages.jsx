import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService, categoryService, departmentService } from '../services';
import { StatCard, LoadingSpinner, EmptyState } from '../components/UIComponents';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { StatusChart } from '../charts';
import { useToast } from '../context/ToastContext';

export const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintService.getComplaints({ limit: 50 })
      .then((res) => setComplaints(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const pending = complaints.filter((c) => ['submitted', 'under_review', 'waiting_for_user'].includes(c.status)).length;
  const inProgress = complaints.filter((c) => ['assigned', 'in_progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => ['resolved', 'closed'].includes(c.status)).length;

  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved / Closed'],
    data: [pending, inProgress, resolved]
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student & User Portal</h1>
          <p className="page-subtitle">Submit tickets, monitor repair status, and review technician resolution notes</p>
        </div>
        <Link to="/complaints/create" className="btn btn-primary-custom">
          <i className="bi bi-plus-circle me-2"></i> Register New Complaint
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your complaints..." />
      ) : (
        <>
          {/* User KPI Cards */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-6 col-md-3">
              <StatCard title="My Complaints" value={total} icon="inbox" color="primary" />
            </div>
            <div className="col-6 col-md-3">
              <StatCard title="Pending Review" value={pending} icon="clock" color="warning" />
            </div>
            <div className="col-6 col-md-3">
              <StatCard title="Under Repair" value={inProgress} icon="tools" color="info" />
            </div>
            <div className="col-6 col-md-3">
              <StatCard title="Resolved" value={resolved} icon="check-circle-fill" color="success" />
            </div>
          </div>

          <div className="row g-3 g-md-4 mb-4">
            {/* Recent Complaints Table */}
            <div className="col-12 col-xl-8">
              <div className="custom-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Recent Complaints</h5>
                  <Link to="/complaints" className="small text-primary fw-bold text-decoration-none">
                    View All ({total}) <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>

                {complaints.length === 0 ? (
                  <EmptyState
                    icon="chat-square-text"
                    title="No Complaints Submitted"
                    message="You haven't reported any issues yet. Click below to submit your first complaint."
                    action={
                      <Link to="/complaints/create" className="btn btn-sm btn-primary-custom">
                        Submit Complaint
                      </Link>
                    }
                  />
                ) : (
                  <div className="table-responsive">
                    <table className="custom-table table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.slice(0, 5).map((c) => (
                          <tr key={c.id}>
                            <td className="fw-bold text-primary">{c.complaint_number}</td>
                            <td>
                              <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                                {c.title}
                              </div>
                            </td>
                            <td><span className="badge bg-light text-dark border small">{c.category_name || 'General'}</span></td>
                            <td><StatusBadge status={c.status} /></td>
                            <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                            <td className="text-end">
                              <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline-primary py-0 px-2 small">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Status Breakdown Chart */}
            <div className="col-12 col-xl-4">
              <div className="custom-card chart-card-wrapper">
                <h5 className="fw-bold mb-3">My Complaint Status</h5>
                <StatusChart data={statusChartData} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const CreateComplaint = () => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState(null);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let attachments = [];
      if (file) {
        const uploaded = await complaintService.uploadFile(file);
        attachments.push(uploaded);
      }

      const res = await complaintService.createComplaint({
        title,
        description,
        category_id: categoryId || undefined,
        department_id: departmentId || undefined,
        location,
        attachments
      });

      showSuccess(`Complaint #${res.data.complaint_number} registered! AI classified as ${res.data.ai_category}`);
      window.location.href = `/complaints/${res.data.id}`;
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Complaint / Issue</h1>
          <p className="page-subtitle">Report problems with automated AI categorization, priority assignment, and tracking</p>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        <div className="col-12 col-lg-8">
          <div className="custom-card p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Complaint Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Campus Wi-Fi disconnecting in Block B room 302"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={5}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Detailed Description *</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Provide precise details, error messages, or symptoms to help technicians resolve it quickly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                ></textarea>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Category (AI will auto-suggest if blank)</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Auto-Detect via AI Engine...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold">Department (Optional)</label>
                  <select
                    className="form-select"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">Auto-Route to Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Location / Building / Room Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Academic Block B, Room 302, Desk 14"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Attach Photo / Screenshot / PDF Evidence (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Link to="/dashboard" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary-custom" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      AI Analyzing & Submitting...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Assistant Help Panel */}
        <div className="col-12 col-lg-4">
          <div className="custom-card p-4 bg-gradient border-primary-subtle" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-success p-2 rounded-2">
                <i className="bi bi-robot"></i>
              </span>
              <h5 className="fw-bold mb-0 text-dark">AI Smart Routing</h5>
            </div>
            <p className="text-muted small mb-3">
              Our intelligent NLP classification automatically predicts the problem category, estimates resolution SLA, and routes your ticket to available specialists.
            </p>
            <ul className="small text-secondary ps-3 mb-0">
              <li className="mb-2"><strong>Keywords:</strong> Mention specific room numbers or hardware names.</li>
              <li className="mb-2"><strong>Photos:</strong> Uploading photos accelerates resolution by 40%.</li>
              <li><strong>Duplicate Detection:</strong> System prevents duplicate tickets for identical campus outages.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Rating Modal
  const [ratingTarget, setRatingTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const { showSuccess, showError } = useToast();

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getComplaints({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setComplaints(res.items || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [statusFilter]);

  const handleFeedbackSubmit = async () => {
    if (!ratingTarget) return;
    try {
      await complaintService.submitFeedback(ratingTarget.id, rating, feedbackComment);
      showSuccess('Thank you for rating our resolution service!');
      setRatingTarget(null);
      fetchMyComplaints();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Registered Complaints</h1>
          <p className="page-subtitle">Track status updates, communicate with technicians, and submit feedback ratings</p>
        </div>
        <Link to="/complaints/create" className="btn btn-primary-custom">
          <i className="bi bi-plus-circle me-2"></i> Submit New Issue
        </Link>
      </div>

      {/* Filter */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search your complaints by ID or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMyComplaints()}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select className="form-select bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="custom-card p-0 overflow-hidden mb-4">
        {loading ? (
          <LoadingSpinner message="Fetching your tickets..." />
        ) : complaints.length === 0 ? (
          <EmptyState title="No Complaints Found" message="You have no tickets matching this filter." />
        ) : (
          <div className="table-responsive">
            <table className="custom-table table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/complaints/${c.id}`} className="fw-bold text-primary text-decoration-none">
                        {c.complaint_number}
                      </Link>
                    </td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                    </td>
                    <td>{c.department_name || 'General'}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="text-end">
                      <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline-primary py-0 px-2 me-1">
                        View
                      </Link>
                      {['resolved', 'closed'].includes(c.status) && !c.feedback && (
                        <button
                          className="btn btn-sm btn-warning py-0 px-2 text-dark"
                          onClick={() => setRatingTarget(c)}
                        >
                          <i className="bi bi-star-fill me-1"></i> Rate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Rate Resolution Quality</h5>
                <button type="button" className="btn-close" onClick={() => setRatingTarget(null)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <p className="text-muted small mb-3">
                  How satisfied are you with the resolution of ticket <strong>#{ratingTarget.complaint_number}</strong>?
                </p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn p-1 border-0"
                      onClick={() => setRating(star)}
                    >
                      <i className={`bi bi-star${star <= rating ? '-fill text-warning' : ' text-muted'} fs-2`}></i>
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Additional feedback for our service team (optional)..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setRatingTarget(null)}>Cancel</button>
                <button className="btn btn-primary-custom" onClick={handleFeedbackSubmit}>Submit Rating</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
