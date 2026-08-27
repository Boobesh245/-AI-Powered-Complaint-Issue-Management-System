import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Layouts
import { AdminLayout, UserLayout, StaffLayout, AuthLayout } from '../layouts';

// Auth Pages
import { Login } from '../pages/Login';
import { Register, ForgotPassword, NotFound } from '../pages/AuthPages';

// Admin Pages (15 Pages)
import { DashboardOverview } from '../admin/DashboardOverview';
import { ComplaintManagement } from '../admin/ComplaintManagement';
import { ComplaintDetails } from '../admin/ComplaintDetails';
import { UserManagement } from '../admin/UserManagement';
import { StaffManagement } from '../admin/StaffManagement';
import { DepartmentManagement } from '../admin/DepartmentManagement';
import { CategoryManagement, PriorityManagement } from '../admin/CategoryAndPriority';
import { AnalyticsDashboard } from '../admin/AnalyticsDashboard';
import { Reports, FeedbackManagement } from '../admin/ReportsAndFeedback';
import { AuditLogs, SystemSettings, AdminProfile, NotificationsPage } from '../admin/AdminSystemPages';

// User Pages
import { UserDashboard, CreateComplaint, MyComplaints } from '../user/UserPages';

// Staff Pages
import { StaffDashboard } from '../staff/StaffPages';

export const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Root Redirection */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : role === 'admin' || role === 'super_admin' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : role === 'staff' ? (
            <Navigate to="/staff/dashboard" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin Routes (15 Pages) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardOverview />} />
          <Route path="/admin/complaints" element={<ComplaintManagement />} />
          <Route path="/admin/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/priorities" element={<PriorityManagement />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/feedback" element={<FeedbackManagement />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Staff Routes */}
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/complaints" element={<StaffDashboard />} />
          <Route path="/staff/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/staff/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Regular User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'staff', 'admin', 'super_admin']} />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/complaints" element={<MyComplaints />} />
          <Route path="/complaints/create" element={<CreateComplaint />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
