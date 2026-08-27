import React, { useState, useEffect } from 'react';
import { staffService, departmentService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/UIComponents';
import { useToast } from '../context/ToastContext';

export const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employee_id: '',
    department_id: '',
    designation: '',
    specialization: ''
  });

  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        staffService.getStaff(),
        departmentService.getDepartments()
      ]);
      setStaff(s);
      setDepartments(d);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await staffService.createStaff(formData);
      showSuccess('Staff profile added successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', employee_id: '', department_id: '', designation: '', specialization: '' });
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await staffService.updateStaff(item.id, { availability: !item.availability });
      showSuccess(`Staff availability set to ${!item.availability ? 'Available' : 'Unavailable'}`);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Allocate specialists, monitor workload capacity, and track resolution velocity</p>
        </div>
        <button className="btn btn-primary-custom" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus-fill me-2"></i> Register New Staff
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching staff registry..." />
      ) : staff.length === 0 ? (
        <EmptyState title="No Staff Found" message="No staff profiles are registered in the system." />
      ) : (
        <div className="row g-3 g-md-4">
          {staff.map((s) => (
            <div key={s.id} className="col-12 col-md-6 col-xl-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                        {s.name ? s.name[0].toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{s.name}</h6>
                        <span className="text-muted small">{s.designation || 'Specialist'}</span>
                      </div>
                    </div>
                    <span className={`badge ${s.availability ? 'bg-success-subtle text-success border border-success' : 'bg-secondary'}`}>
                      {s.availability ? 'Available' : 'Busy'}
                    </span>
                  </div>

                  <div className="p-2 bg-light rounded-3 mb-3 border small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Department:</span>
                      <span className="fw-semibold text-dark">{s.department_name || 'General'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Specialization:</span>
                      <span className="fw-semibold text-dark">{s.specialization || 'General Support'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Employee ID:</span>
                      <span className="font-monospace text-primary fw-bold">{s.employee_id}</span>
                    </div>
                  </div>

                  {/* Workload Meter */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="fw-semibold text-secondary">Active Workload</span>
                      <span className="fw-bold text-dark">{s.current_workload} Active Tickets</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${
                          s.current_workload > 5 ? 'bg-danger' : s.current_workload > 2 ? 'bg-warning' : 'bg-success'
                        }`}
                        role="progressbar"
                        style={{ width: `${Math.min(100, (s.current_workload / 8) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <span className="small text-muted">
                    <i className="bi bi-check-circle-fill text-success me-1"></i> {s.resolved_complaints} Resolved
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleToggleAvailability(s)}
                  >
                    Toggle Availability
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Register Staff Member</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Staff Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Employee ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="EMP-012"
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Department</label>
                      <select
                        className="form-select"
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                        required
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Senior Technician"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Specialization</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Network & Server Hardware"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Temporary Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Register Staff</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
