import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Charities } from './pages/Charities';
import { Donations } from './pages/Donations';
import { TaxRecords } from './pages/TaxRecords';
import { Profile } from './pages/Profile';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { CompanyEmployees } from './pages/CompanyEmployees';
import { CompanyReports } from './pages/CompanyReports';
import { CompanySettings } from './pages/CompanySettings';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Employee routes */}
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="charities" element={<Charities />} />
            <Route path="donations" element={<Donations />} />
            <Route path="tax-records" element={<TaxRecords />} />
            <Route path="profile" element={<Profile />} />
            
            {/* HR Admin routes */}
            <Route path="company" element={<CompanyDashboard />} />
            <Route path="company/employees" element={<CompanyEmployees />} />
            <Route path="company/reports" element={<CompanyReports />} />
            <Route path="company/settings" element={<CompanySettings />} />
            
            {/* Super Admin routes */}
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
