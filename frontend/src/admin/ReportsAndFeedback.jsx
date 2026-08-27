import React, { useState, useEffect } from 'react';
import { reportService } from '../services';
import { LoadingSpinner, EmptyState } from '../components/UIComponents';

export const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Data Exports</h1>
          <p className="page-subtitle">Generate official executive summaries, SLA audits, and download CSV/PDF formats</p>
        </div>
        <div className="d-flex gap-2">
          <a
            href="/api/reports/complaints/csv"
            className="btn btn-outline-custom"
            download="executive_complaints_report.csv"
          >
            <i className="bi bi-file-earmark-spreadsheet me-2 text-success"></i> Download Full CSV
          </a>
          <a
            href="/api/reports/complaints/pdf"
            className="btn btn-primary-custom"
            download="executive_complaints_report.pdf"
          >
            <i className="bi bi-file-earmark-pdf me-2 text-white"></i> Export Official PDF
          </a>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Generating report matrices..." />
      ) : (
        <>
          {/* Quick Export Cards */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                    <i className="bi bi-calendar3 fs-4"></i>
                    <h5 className="fw-bold mb-0">Daily Summary Report</h5>
                  </div>
                  <p className="text-muted small">Overview of new registrations, assignments, and resolutions recorded today.</p>
                </div>
                <a href="/api/reports/complaints/csv" className="btn btn-sm btn-outline-primary mt-2">
                  <i className="bi bi-download me-1"></i> Export Daily
                </a>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2 text-success">
                    <i className="bi bi-building-check fs-4"></i>
                    <h5 className="fw-bold mb-0">Department Audit Report</h5>
                  </div>
                  <p className="text-muted small">Departmental resolution velocities, pending workloads, and turnaround times.</p>
                </div>
                <a href="/api/reports/complaints/pdf" className="btn btn-sm btn-outline-success mt-2">
                  <i className="bi bi-file-earmark-pdf me-1"></i> Export PDF Audit
                </a>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                    <i className="bi bi-shield-check fs-4"></i>
                    <h5 className="fw-bold mb-0">SLA Compliance Report</h5>
                  </div>
                  <p className="text-muted small">Service Level Agreement adherence, risk warnings, and escalation logs.</p>
                </div>
                <a href="/api/reports/complaints/csv" className="btn btn-sm btn-outline-warning mt-2">
                  <i className="bi bi-download me-1"></i> Export SLA Matrix
                </a>
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="custom-card p-4 mb-4">
            <h5 className="fw-bold mb-3">Department Performance Summary</h5>
            <div className="table-responsive">
              <table className="custom-table table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Tickets</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Resolution Rate</th>
                    <th>Avg Resolution Time</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.department_reports?.map((dept, i) => (
                    <tr key={i}>
                      <td className="fw-bold text-dark">{dept.department}</td>
                      <td>{dept.total}</td>
                      <td className="text-success fw-bold">{dept.resolved}</td>
                      <td className="text-warning fw-bold">{dept.pending}</td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success">
                          {dept.resolution_rate}%
                        </span>
                      </td>
                      <td className="text-muted">{dept.avg_resolution_hours} hrs</td>
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

export const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getFeedback()
      .then(setFeedbacks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback & Satisfaction Reviews</h1>
          <p className="page-subtitle">Review ratings, testimonials, and student feedback submitted after ticket resolution</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading user feedback reviews..." />
      ) : feedbacks.length === 0 ? (
        <EmptyState title="No Feedback Yet" message="Feedback reviews will appear here when users rate resolved complaints." />
      ) : (
        <div className="row g-3 g-md-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="col-12 col-md-6 col-xl-4">
              <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{fb.user_name}</h6>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                        {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="text-warning fw-bold fs-5">
                      {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                    </div>
                  </div>

                  <p className="text-dark small mb-3 fst-italic">"{fb.comment || 'No written comment provided.'}"</p>
                </div>

                <div className="pt-2 border-top">
                  <span className="badge bg-light text-primary border small">
                    Ticket #{fb.complaint_number || 'Resolved Issue'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
