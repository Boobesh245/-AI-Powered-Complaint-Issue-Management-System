import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, complaintService } from '../services';
import { StatCard, LoadingSpinner, ActivityTimeline } from '../components/UIComponents';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { ComplaintTrendChart, StatusChart, PriorityChart, DepartmentChart } from '../charts';

export const DashboardOverview = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [statusDist, setStatusDist] = useState(null);
  const [priorityDist, setPriorityDist] = useState(null);
  const [deptPerf, setDeptPerf] = useState([]);
  const [criticalComplaints, setCriticalComplaints] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, tr, sd, pd, dp, cc, ai] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getTrends({ days: 14 }),
          analyticsService.getStatusDist(),
          analyticsService.getPriorityDist(),
          analyticsService.getDeptPerformance(),
          complaintService.getComplaints({ priority: 'critical', limit: 5 }),
          analyticsService.getAIInsights()
        ]);
        setOverview(ov);
        setTrends(tr);
        setStatusDist(sd);
        setPriorityDist(pd);
        setDeptPerf(dp);
        setCriticalComplaints(cc.items || []);
        setAiInsights(ai);
      } catch (err) {
        console.error("Dashboard overview fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating live dashboard intelligence..." />;

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time system health, complaint volume, and AI performance metrics</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/analytics" className="btn btn-outline-custom">
            <i className="bi bi-graph-up me-2"></i> Deep Analytics
          </Link>
          <Link to="/admin/complaints" className="btn btn-primary-custom">
            <i className="bi bi-inbox-fill me-2"></i> Manage Complaints
          </Link>
        </div>
      </div>

      {/* AI Insights Alert Banner */}
      {aiInsights?.insights?.length > 0 && (
        <div className="alert bg-white border border-primary-subtle shadow-sm rounded-3 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white p-2 rounded-2">
              <i className="bi bi-robot me-1"></i> AI Intelligence
            </span>
            <span className="small text-dark fw-semibold">
              {aiInsights.insights[0]}
            </span>
          </div>
          <Link to="/admin/analytics" className="small text-primary fw-bold text-decoration-none">
            View All AI Insights <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid (8 Cards) */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Complaints"
            value={overview?.total_complaints}
            icon="inbox"
            color="primary"
            change="100% tracked in MongoDB"
            changeType="neutral"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Actions"
            value={overview?.pending}
            icon="hourglass-split"
            color="warning"
            change="Under review / Waiting"
            changeType="increase"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="In Progress"
            value={overview?.in_progress}
            icon="arrow-repeat"
            color="info"
            change="Assigned to department staff"
            changeType="neutral"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Resolved & Closed"
            value={overview?.resolved + (overview?.closed || 0)}
            icon="check2-circle"
            color="success"
            change={`${overview?.resolution_rate}% Resolution Rate`}
            changeType="increase"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Critical Issues"
            value={overview?.critical}
            icon="exclamation-octagon"
            color="danger"
            change="High priority SLA"
            changeType="decrease"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="SLA Compliance"
            value={`${overview?.sla_compliance_rate}%`}
            icon="speedometer2"
            color="success"
            change="Within resolution target"
            changeType="increase"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Avg Resolution"
            value={`${overview?.average_resolution_hours} hrs`}
            icon="clock-history"
            color="primary"
            change="Calculated across resolved tickets"
            changeType="neutral"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Customer Satisfaction"
            value={`★ ${overview?.average_satisfaction}`}
            icon="star-fill"
            color="warning"
            change="From post-resolution feedback"
            changeType="increase"
          />
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="row g-3 g-md-4 mb-4">
        {/* Trend Chart (col-xl-8) */}
        <div className="col-12 col-xl-8">
          <div className="custom-card chart-card-wrapper">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Complaint Inflow vs Resolution Trend</h5>
                <small className="text-muted">Daily volume over the past 14 days</small>
              </div>
              <span className="badge bg-light text-primary border">14-Day View</span>
            </div>
            <ComplaintTrendChart data={trends} />
          </div>
        </div>

        {/* Status Breakdown (col-xl-4) */}
        <div className="col-12 col-xl-4">
          <div className="custom-card chart-card-wrapper">
            <div className="mb-3">
              <h5 className="fw-bold mb-0">Status Distribution</h5>
              <small className="text-muted">Real-time lifecycle allocation</small>
            </div>
            <StatusChart data={statusDist} />
          </div>
        </div>
      </div>

      {/* Secondary Charts: Priority & Department */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-xl-6">
          <div className="custom-card chart-card-wrapper">
            <div className="mb-3">
              <h5 className="fw-bold mb-0">Complaints by Priority Level</h5>
              <small className="text-muted">Severity distribution across open and closed tickets</small>
            </div>
            <PriorityChart data={priorityDist} />
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="custom-card chart-card-wrapper">
            <div className="mb-3">
              <h5 className="fw-bold mb-0">Department Performance Breakdown</h5>
              <small className="text-muted">Resolved vs Pending complaints by department</small>
            </div>
            <DepartmentChart performance={deptPerf} />
          </div>
        </div>
      </div>

      {/* Critical Complaints Table */}
      <div className="custom-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0 text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> Critical & Urgent Attention Required
            </h5>
            <small className="text-muted">High severity complaints requiring fast response</small>
          </div>
          <Link to="/admin/complaints?priority=critical" className="btn btn-sm btn-outline-danger">
            View All Critical ({overview?.critical})
          </Link>
        </div>

        <div className="table-responsive">
          <table className="custom-table table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {criticalComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No active critical complaints! Great job.
                  </td>
                </tr>
              ) : (
                criticalComplaints.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold text-primary">{c.complaint_number}</td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                    </td>
                    <td>{c.user_name}</td>
                    <td>{c.department_name || 'General'}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <Link to={`/admin/complaints/${c.id}`} className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: '0.75rem' }}>
                        Inspect <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
