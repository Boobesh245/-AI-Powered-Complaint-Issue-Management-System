import React, { useState, useEffect, useCallback } from 'react';
import { userService, departmentService } from '../services';
import { LoadingSpinner, EmptyState, ConfirmationModal } from '../components/UIComponents';
import { useToast } from '../context/ToastContext';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    department_id: '',
    status: 'active'
  });

  const [deleteId, setDeleteId] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        page,
        limit: 15,
        search: search || undefined,
        role: role !== 'all' ? role : undefined,
        status: status !== 'all' ? status : undefined
      });
      setUsers(res.items || []);
      setTotalPages(res.pages || 1);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status, showError]);

  useEffect(() => {
    fetchUsers();
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      showSuccess('User account created successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'user', department_id: '', status: 'active' });
      fetchUsers();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userService.changeStatus(user.id, newStatus);
      showSuccess(`User status changed to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteId) return;
    try {
      await userService.deleteUser(deleteId);
      showSuccess('User removed successfully');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage student, faculty, and administrator accounts across campus</p>
        </div>
        <button className="btn btn-primary-custom" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus-fill me-2"></i> Add New User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select className="form-select bg-light" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
              <option value="all">All Roles</option>
              <option value="user">User / Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select className="form-select bg-light" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="col-12 col-md-1 text-end">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setRole('all'); setStatus('all'); setPage(1); }}>
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="custom-card p-0 overflow-hidden mb-4">
        {loading ? (
          <LoadingSpinner message="Loading user directory..." />
        ) : users.length === 0 ? (
          <EmptyState title="No Users Found" message="No user accounts matched your search criteria." />
        ) : (
          <div className="table-responsive">
            <table className="custom-table table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Complaints</th>
                  <th>Joined Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small text-muted">{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.role === 'super_admin' ? 'bg-danger' : u.role === 'admin' ? 'bg-primary' : u.role === 'staff' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {u.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{u.complaints_count || 0} tickets</span>
                    </td>
                    <td className="small text-muted">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'} me-1 py-0 px-2`}
                        onClick={() => handleToggleStatus(u)}
                        title="Toggle Status"
                      >
                        <i className={`bi bi-${u.status === 'active' ? 'pause-fill' : 'play-fill'}`}></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => setDeleteId(u.id)}
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Create New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body py-3">
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="user">User / Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Department</label>
                    <select
                      className="form-select"
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    >
                      <option value="">Select Department (Optional)...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Password</label>
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
                  <button type="submit" className="btn btn-primary-custom">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user account? This action cannot be undone."
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete User"
      />
    </div>
  );
};
