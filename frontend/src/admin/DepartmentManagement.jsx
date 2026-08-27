import React, { useState, useEffect } from 'react';
import { departmentService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/UIComponents';
import { useToast } from '../context/ToastContext';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', status: 'active' });
  const { showSuccess, showError } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment(formData);
      showSuccess('Department created successfully');
      setShowAddModal(false);
      setFormData({ name: '', code: '', description: '', status: 'active' });
      fetchDepartments();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Department Management</h1>
          <p className="page-subtitle">Configure academic & facilities divisions, assign heads, and review resolution rates</p>
        </div>
        <button className="btn btn-primary-custom" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-2"></i> Add Department
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching campus departments..." />
      ) : departments.length === 0 ? (
        <EmptyState title="No Departments Found" message="No departments exist. Create the first one above." />
      ) : (
        <div className="row g-3 g-md-4">
          {departments.map((d) => (
            <div key={d.id} className="col-12 col-md-6 col-xl-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary fw-bold font-monospace">
                      {d.code}
                    </span>
                    <span className="badge bg-success-subtle text-success border border-success">
                      {d.status}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{d.name}</h5>
                  <p className="text-muted small mb-3">{d.description || 'No description provided.'}</p>

                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="row text-center g-2">
                      <div className="col-4 border-end">
                        <div className="fw-bold text-dark fs-5">{d.staff_count || 0}</div>
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>STAFF</div>
                      </div>
                      <div className="col-4 border-end">
                        <div className="fw-bold text-dark fs-5">{d.complaints_count || 0}</div>
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>TICKETS</div>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-success fs-5">{d.resolution_rate || 0}%</div>
                        <div className="text-muted small" style={{ fontSize: '0.7rem' }}>RESOLVED</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                  <span>Head: <strong className="text-dark">{d.head_name || 'Unassigned'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Create Department</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Department Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Computer Science & IT"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Department Code</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="CS-IT"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Brief overview of department scope..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Create Department</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
