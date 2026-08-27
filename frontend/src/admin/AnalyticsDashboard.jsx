import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services';
import { StatCard, LoadingSpinner } from '../components/UIComponents';
import {
  ComplaintTrendChart,
  StatusChart,
  PriorityChart,
  CategoryChart,
  DepartmentChart,
  SLAChart,
  SatisfactionChart
} from '../charts';

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [statusDist, setStatusDist] = useState(null);
  const [priorityDist, setPriorityDist] = useState(null);
  const [categoryDist, setCategoryDist] = useState(null);
  const [deptPerf, setDeptPerf] = useState([]);
  const [resolutionMetrics, setResolutionMetrics] = useState(null);
  const [slaMetrics, setSlaMetrics] = useState(null);
  const [staffPerf, setStaffPerf] = useState([]);
  const [satisfaction, setSatisfaction] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      let days = 30;
      if (dateRange === '7d') days = 7;
      if (dateRange === '90d') days = 90;
      if (dateRange === '1y') days = 365;

      const [ov, tr, sd, pd, cd, dp, rm, sm, sp, sf, ai] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends({ days }),
        analyticsService.getStatusDist(),
        analyticsService.getPriorityDist(),
        analyticsService.getCategoryDist(),
        analyticsService.getDeptPerformance(),
        analyticsService.getResolutionMetrics(),
        analyticsService.getSLAMetrics(),
        analyticsService.getStaffPerformance(),
        analyticsService.getSatisfaction(),
        analyticsService.getAIInsights()
      ]);

      setOverview(ov);
      setTrends(tr);
      setStatusDist(sd);
      setPriorityDist(pd);
      setCategoryDist(cd);
      setDeptPerf(dp);
      setResolutionMetrics(rm);
      setSlaMetrics(sm);
      setStaffPerf(sp);
      setSatisfaction(sf);
      setAiInsights(ai);
    } catch (err) {
      console.error('Analytics aggregation error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="container-fluid p-0">
      {/* Header & Date Range Filter Toolbar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Advanced Analytics Hub</h1>
          <p className="page-subtitle">Deep aggregated intelligence powered by MongoDB pipelines and Python metrics</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="small fw-bold text-muted d-none d-sm-inline">TIMEFRAME:</span>
          <div className="btn-group" role="group">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' }
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                className={`btn btn-sm ${dateRange === btn.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setDateRange(btn.id)}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <button className="btn btn-sm btn-outline-primary" onClick={fetchAnalytics} title="Refresh Live Data">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Executing MongoDB aggregation pipelines..." />
      ) : (
        <>
          {/* Top KPI Cards (5 Cards) */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-3">
              <StatCard
                title="Total Tickets"
                value={overview?.total_complaints}
                icon="collection"
                color="primary"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-3">
              <StatCard
                title="Pending / Review"
                value={overview?.pending}
                icon="clock"
                color="warning"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-3">
              <StatCard
                title="Resolution Rate"
                value={`${overview?.resolution_rate}%`}
                icon="check-circle"
                color="success"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-3">
              <StatCard
                title="SLA Compliance"
                value={`${slaMetrics?.compliance_rate || 94}%`}
                icon="shield-check"
                color="info"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-3">
              <StatCard
                title="Avg Satisfaction"
                value={`★ ${satisfaction?.average_rating || 4.5}`}
                icon="star-fill"
                color="warning"
              />
            </div>
          </div>

          {/* AI Insights Banner Section */}
          {aiInsights && (
            <div className="custom-card p-4 mb-4 border border-primary-subtle bg-gradient" style={{ backgroundColor: '#faf5ff' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-primary p-2 rounded-2">
                  <i className="bi bi-robot me-1"></i> AI Insights Engine
                </span>
                <h5 className="fw-bold mb-0 text-dark">Automated Intelligence & Trend Observations</h5>
              </div>

              <div className="row g-3">
                {aiInsights.insights?.map((ins, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded-3 border shadow-sm small fw-semibold text-dark">
                      {ins}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Chart 1: Volume Trend */}
          <div className="custom-card chart-card-wrapper mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Complaint Volume & Resolution Lifecycle Trend</h5>
                <small className="text-muted">Inflow of submitted issues versus successfully resolved and closed cases</small>
              </div>
              <span className="badge bg-light text-primary border">Aggregated Daily</span>
            </div>
            <ComplaintTrendChart data={trends} />
          </div>

          {/* Row 2: Status & Priority Distribution */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="custom-card chart-card-wrapper">
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">Status Allocation (Doughnut)</h5>
                  <small className="text-muted">Complaints segmented by lifecycle stage</small>
                </div>
                <StatusChart data={statusDist} />
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="custom-card chart-card-wrapper">
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">Priority Distribution (Bar)</h5>
                  <small className="text-muted">Volume segmented by SLA severity classification</small>
                </div>
                <PriorityChart data={priorityDist} />
              </div>
            </div>
          </div>

          {/* Row 3: Category Breakdown & Department Performance */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="custom-card chart-card-wrapper">
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">Category Breakdown (Horizontal Bar)</h5>
                  <small className="text-muted">Top complaint topics reported by campus users</small>
                </div>
                <CategoryChart data={categoryDist} />
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="custom-card chart-card-wrapper">
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">Department Performance</h5>
                  <small className="text-muted">Resolved versus pending tickets by department</small>
                </div>
                <DepartmentChart performance={deptPerf} />
              </div>
            </div>
          </div>

          {/* Row 4: SLA Compliance & User Satisfaction */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="custom-card chart-card-wrapper">
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">SLA Compliance Distribution</h5>
                  <small className="text-muted">Service Level Agreement compliance rates</small>
                </div>
                <SLAChart data={slaMetrics} />
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="custom-card chart-card-wrapper">
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">Customer Satisfaction Ratings (1-5 Stars)</h5>
                  <small className="text-muted">Post-resolution student & faculty feedback reviews</small>
                </div>
                <SatisfactionChart data={satisfaction} />
              </div>
            </div>
          </div>

          {/* Staff Performance Table */}
          <div className="custom-card p-4 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-award-fill text-warning me-2"></i> Specialist Staff Efficiency Leaderboard
            </h5>
            <div className="table-responsive">
              <table className="custom-table table">
                <thead>
                  <tr>
                    <th>Specialist Name</th>
                    <th>Department</th>
                    <th>Assigned</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Avg Resolution</th>
                    <th>Rating</th>
                    <th>SLA Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerf.map((sp, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{sp.staff_name}</td>
                      <td><span className="badge bg-light text-dark border">{sp.department}</span></td>
                      <td><span className="fw-semibold">{sp.assigned}</span></td>
                      <td><span className="fw-bold text-success">{sp.resolved}</span></td>
                      <td><span className="fw-bold text-warning">{sp.pending}</span></td>
                      <td className="text-muted">{sp.avg_resolution_hours} hrs</td>
                      <td><span className="text-warning fw-bold">★ {sp.rating}</span></td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success">
                          {sp.sla_compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
