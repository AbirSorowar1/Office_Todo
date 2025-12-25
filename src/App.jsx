import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MyTasks from './pages/dashboard/MyTasks';
import TeamBoard from './pages/dashboard/TeamBoard';
import MeetingScheduler from './pages/dashboard/MeetingScheduler';
import LeaveManagement from './pages/dashboard/LeaveManagement';
import Announcements from './pages/dashboard/Announcements';
import EmployeeDirectory from './pages/dashboard/EmployeeDirectory';
import TimeTracker from './pages/dashboard/TimeTracker';
import DocumentsHub from './pages/dashboard/DocumentsHub';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// Public Route
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="team-board" element={<TeamBoard />} />
            <Route path="meetings" element={<MeetingScheduler />} />
            <Route path="leaves" element={<LeaveManagement />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="directory" element={<EmployeeDirectory />} />
            <Route path="time-tracker" element={<TimeTracker />} />
            <Route path="documents" element={<DocumentsHub />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="h-screen flex items-center justify-center">
              <h1 className="text-5xl font-bold">404</h1>
            </div>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
