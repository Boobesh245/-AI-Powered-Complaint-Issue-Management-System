import React, { useState, useEffect } from 'react';
import { categoryService, departmentService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/UIComponents';
import { PriorityBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    priority: 'medium',
    description: '',
    status: 'active'
  });

  const { showSuccess, showError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([
        categoryService.getCategories(),
        departmentService.getDepartments()
      ]);
      setCategories(c);
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
      await categoryService.createCategory(formData);
      showSuccess('Category created successfully');
      setShowAddModal(false);
      setFormData({ name: '', department_id: '', priority: 'medium', description: '', status: 'active' });
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Organize problem classifications, configure default priorities, and route to departments</p>
        </div>
        <button className="btn btn-primary-custom" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-tag-fill me-2"></i> Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading complaint categories..." />
      ) : categories.length === 0 ? (
        <EmptyState title="No Categories Found" message="No complaint categories have been configured." />
      ) : (
        <div className="custom-card p-0 overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="custom-table table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Assigned Department</th>
                  <th>Default Priority</th>
                  <th>Total Complaints</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-tag text-primary"></i>
                        {cat.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {cat.department_name || 'General'}
                      </span>
                    </td>
                    <td><PriorityBadge priority={cat.priority} /></td>
                    <td>
                      <span className="fw-semibold text-dark">{cat.complaints_count || 0}</span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success">
                        {cat.status}
                      </span>
                    </td>
                    <td className="small text-muted">{cat.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Create Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Campus Wi-Fi & Network"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Department</label>
                      <select
                        className="form-select"
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      >
                        <option value="">Choose Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Default Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Scope and problem types covered by this category..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Save Category</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PriorityManagement = () => {
  const priorities = [
    {
      name: 'Critical',
      badge: 'danger',
      responseSLA: '1 Hour',
      resolutionSLA: '24 Hours',
      escalation: 'Notify Senior Administrators and Department Heads immediately',
      description: 'Threats to safety, security hazards, major facility blackouts, severe IT server outages, or exam interruptions.'
    },
    {
      name: 'High',
      badge: 'warning',
      responseSLA: '4 Hours',
      resolutionSLA: '48 Hours',
      escalation: 'Notify Operations Supervisor if pending over 24 hours',
      description: 'Classroom equipment failure, student portal bugs, hot water breakdown, fee payment issues, and plumbing leaks.'
    },
    {
      name: 'Medium',
      badge: 'info',
      responseSLA: '8 Hours',
      resolutionSLA: '72 Hours',
      escalation: 'Standard escalation review at 48 hours',
      description: 'General classroom amenities, fan screeching, bus schedule delays, library return disputes, and mess food suggestions.'
    },
    {
      name: 'Low',
      badge: 'success',
      responseSLA: '24 Hours',
      resolutionSLA: '120 Hours (5 Days)',
      escalation: 'Weekly operational review',
      description: 'Minor cosmetic repairs, general inquiries, aesthetic suggestions, and non-urgent feedback.'
    }
  ];

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Priority & SLA Policy Matrix</h1>
          <p className="page-subtitle">Service Level Agreement policies, response times, and automated escalation thresholds</p>
        </div>
      </div>

      <div className="row g-3 g-md-4">
        {priorities.map((p, idx) => (
          <div key={idx} className="col-12 col-md-6">
            <div className="custom-card p-4 h-100 border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0 text-dark">{p.name} Priority</h4>
                <span className={`badge bg-${p.badge} text-uppercase px-3 py-2`}>
                  {p.name}
                </span>
              </div>

              <p className="text-muted small mb-4">{p.description}</p>

              <div className="row g-3 bg-light p-3 rounded-3 border mb-3">
                <div className="col-6">
                  <span className="text-muted small d-block">RESPONSE SLA</span>
                  <span className="fw-bold text-dark fs-5">{p.responseSLA}</span>
                </div>
                <div className="col-6 border-start ps-3">
                  <span className="text-muted small d-block">RESOLUTION SLA</span>
                  <span className="fw-bold text-primary fs-5">{p.resolutionSLA}</span>
                </div>
              </div>

              <div className="small text-secondary">
                <i className="bi bi-shield-exclamation text-warning me-1"></i>
                <strong>Escalation Rule:</strong> {p.escalation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
