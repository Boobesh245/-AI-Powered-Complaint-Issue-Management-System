import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService, staffService } from '../services';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { LoadingSpinner, ActivityTimeline } from '../components/UIComponents';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { showSuccess, showError } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignComment, setAssignComment] = useState('');

  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  const fetchComplaint = useCallback(async () => {
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      setSelectedPriority(data.priority);
      setSelectedStaffId(data.assigned_staff_id || '');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchComplaint();
    const fetchStaff = async () => {
      try {
        const s = await staffService.getStaff();
        setStaffList(s);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStaff();
  }, [fetchComplaint]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await complaintService.addComment(id, newComment);
      showSuccess('Comment posted');
      setNewComment('');
      fetchComplaint();
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssign = async () => {
    try {
      await complaintService.assignStaff(id, selectedStaffId, assignComment);
      showSuccess('Staff member assigned successfully');
      setShowAssignModal(false);
      fetchComplaint();
    } catch (err) {
      showError(err.message);
    }
  };

  const handlePriorityUpdate = async () => {
    try {
      await complaintService.updatePriority(id, selectedPriority);
      showSuccess(`Priority updated to ${selectedPriority.toUpperCase()}`);
      setShowPriorityModal(false);
      fetchComplaint();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await complaintService.updateStatus(id, selectedStatus, statusComment);
      showSuccess(`Status changed to ${selectedStatus.replace('_', ' ').toUpperCase()}`);
      setShowStatusModal(false);
      fetchComplaint();
    } catch (err) {
      showError(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading complaint details..." />;
  if (!complaint) return <div className="alert alert-danger">Complaint not found</div>;

  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <div className="container-fluid p-0">
      {/* Header & Back navigation */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary rounded-circle"
            style={{ width: '36px', height: '36px' }}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold mb-0">{complaint.complaint_number}</h2>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <div className="text-muted small">
              Created on {new Date(complaint.created_at).toLocaleString()} by <strong>{complaint.user_name}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 flex-wrap">
          {isAdmin && (
            <>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setShowAssignModal(true)}>
                <i className="bi bi-person-plus me-1"></i> Assign Staff
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowPriorityModal(true)}>
                <i className="bi bi-sliders me-1"></i> Change Priority
              </button>
            </>
          )}

          <button
            className="btn btn-primary-custom btn-sm"
            onClick={() => {
              setSelectedStatus(complaint.status);
              setShowStatusModal(true);
            }}
          >
            <i className="bi bi-pencil-square me-1"></i> Update Status
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Metadata/Timeline */}
      <div className="row g-3 g-md-4">
        {/* Left Column: Complaint description, AI Classification, Comments */}
        <div className="col-12 col-lg-8">
          {/* Issue Overview Card */}
          <div className="custom-card p-4 mb-4">
            <h4 className="fw-bold text-dark mb-2">{complaint.title}</h4>
            <div className="p-3 bg-light rounded-3 border mb-3">
              <h6 className="small fw-bold text-secondary mb-1">DESCRIPTION</h6>
              <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </p>
            </div>

            {complaint.location && (
              <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                <i className="bi bi-geo-alt-fill text-danger"></i>
                <span><strong>Location:</strong> {complaint.location}</span>
              </div>
            )}

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mt-3">
                <h6 className="small fw-bold text-secondary mb-2">ATTACHMENTS</h6>
                <div className="d-flex flex-wrap gap-2">
                  {complaint.attachments.map((att, i) => (
                    <div key={i} className="p-2 border rounded-3 bg-light d-flex align-items-center gap-2 small">
                      <i className="bi bi-paperclip fs-5 text-primary"></i>
                      <div>
                        <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{att.filename}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{(att.file_size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Intelligence Card */}
          <div className="custom-card p-4 mb-4 border border-primary-subtle bg-white">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-primary p-2 rounded-2">
                <i className="bi bi-robot me-1"></i> AI NLP Engine
              </span>
              <h5 className="fw-bold mb-0">Automated Classification & Insights</h5>
            </div>

            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>SUGGESTED CATEGORY</div>
                  <div className="fw-bold text-dark">{complaint.ai_category || complaint.category_name}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>PREDICTED PRIORITY</div>
                  <div className="fw-bold text-dark text-capitalize">{complaint.ai_priority || complaint.priority}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>DETECTED SENTIMENT</div>
                  <div className="fw-bold text-capitalize text-dark">{complaint.ai_sentiment || 'Neutral'}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 bg-light rounded-2 border">
                  <div className="text-muted small" style={{ fontSize: '0.72rem' }}>AI CONFIDENCE</div>
                  <div className="fw-bold text-success">{Math.round((complaint.ai_confidence || 0.92) * 100)}%</div>
                </div>
              </div>
            </div>

            {complaint.duplicate_score >= 0.65 && (
              <div className="alert alert-warning small mt-3 mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>
                  <strong>Duplicate Warning:</strong> This complaint shares {Math.round(complaint.duplicate_score * 100)}% semantic similarity with previously registered tickets.
                </div>
              </div>
            )}
          </div>

          {/* Discussion & Comments Stream */}
          <div className="custom-card p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-chat-left-dots-fill me-2 text-primary"></i> Discussion Stream ({complaint.comments?.length || 0})
            </h5>

            {/* Comments List */}
            <div className="d-flex flex-column gap-3 mb-4">
              {!complaint.comments || complaint.comments.length === 0 ? (
                <p className="text-muted small">No comments posted yet. Start the conversation below.</p>
              ) : (
                complaint.comments.map((cm) => (
                  <div
                    key={cm.id}
                    className={`p-3 rounded-3 border ${cm.user_id === user?.id ? 'bg-primary-subtle border-primary-subtle ms-auto' : 'bg-light'} `}
                    style={{ maxWidth: '85%' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1 gap-3">
                      <span className="fw-bold small text-dark">
                        {cm.user_name}{' '}
                        <span className="badge bg-secondary text-white" style={{ fontSize: '0.65rem' }}>
                          {cm.user_role}
                        </span>
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(cm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-dark small" style={{ whiteSpace: 'pre-wrap' }}>
                      {cm.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Write a message, update or request information..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-primary-custom btn-sm"
                  disabled={submittingComment}
                >
                  {submittingComment ? 'Sending...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata & Activity Timeline */}
        <div className="col-12 col-lg-4">
          {/* Metadata Card */}
          <div className="custom-card p-4 mb-4">
            <h6 className="fw-bold text-secondary small mb-3">TICKET INFORMATION</h6>

            <div className="mb-3">
              <span className="text-muted small d-block">Department</span>
              <span className="fw-semibold text-dark">{complaint.department_name || 'General'}</span>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">Category</span>
              <span className="fw-semibold text-dark">{complaint.category_name || 'General'}</span>
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">Assigned Specialist</span>
              {complaint.assigned_staff_name ? (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                    {complaint.assigned_staff_name[0]}
                  </div>
                  <span className="fw-bold text-dark small">{complaint.assigned_staff_name}</span>
                </div>
              ) : (
                <span className="badge bg-warning text-dark mt-1">Pending Staff Assignment</span>
              )}
            </div>

            <div className="mb-3">
              <span className="text-muted small d-block">SLA Target Due Date</span>
              <span className="fw-semibold text-dark">
                {complaint.due_date ? new Date(complaint.due_date).toLocaleString() : 'Within 48 hours'}
              </span>
            </div>

            {complaint.resolved_at && (
              <div className="mb-3">
                <span className="text-muted small d-block">Resolved At</span>
                <span className="fw-semibold text-success">
                  {new Date(complaint.resolved_at).toLocaleString()}
                </span>
              </div>
            )}

            {complaint.feedback && (
              <div className="p-3 bg-light rounded-3 border mt-3">
                <span className="text-muted small d-block fw-bold mb-1">USER FEEDBACK</span>
                <div className="text-warning fw-bold mb-1">
                  {'★'.repeat(complaint.feedback.rating)}{'☆'.repeat(5 - complaint.feedback.rating)} ({complaint.feedback.rating}/5)
                </div>
                <div className="small text-muted fst-italic">"{complaint.feedback.comment}"</div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="custom-card p-4">
            <h6 className="fw-bold text-secondary small mb-3">ACTIVITY TIMELINE</h6>
            <ActivityTimeline timeline={complaint.activity_timeline} />
          </div>
        </div>
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Assign Department Staff</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Choose Staff Specialist</label>
                  <select
                    className="form-select"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                  >
                    <option value="">Select Staff...</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department_name}) - Current Workload: {s.current_workload}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Assignment Note (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Instructions for technician..."
                    value={assignComment}
                    onChange={(e) => setAssignComment(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button className="btn btn-primary-custom" disabled={!selectedStaffId} onClick={handleAssign}>
                  Save Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Complaint Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="mb-3">
                  <label className="form-label small fw-bold">New Status</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_user">Waiting for User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="reopened">Reopened</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Status Update Note</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Reason or action taken..."
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button className="btn btn-primary-custom" onClick={handleStatusUpdate}>
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Priority Modal */}
      {showPriorityModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Adjust Priority Level</h5>
                <button type="button" className="btn-close" onClick={() => setShowPriorityModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <label className="form-label small fw-bold">Priority</label>
                <select
                  className="form-select"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="low">Low (120h Resolution SLA)</option>
                  <option value="medium">Medium (72h Resolution SLA)</option>
                  <option value="high">High (48h Resolution SLA)</option>
                  <option value="critical">Critical (24h Resolution SLA)</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowPriorityModal(false)}>Cancel</button>
                <button className="btn btn-primary-custom" onClick={handlePriorityUpdate}>Save Priority</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
