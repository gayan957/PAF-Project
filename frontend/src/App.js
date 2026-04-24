import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import TechnicianDashboard from './pages/TechnicianDashboard';
import Unauthorized from './pages/Unauthorized';
import TicketListPage from './pages/TicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';

import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

const Layout = ({ children }) => {
  return (
    <div className="portal-layout">
      <Sidebar />
      <div className="portal-main">
        <TopHeader />
        <div className="portal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TECHNICIAN']} />}>
            <Route path="/user-dashboard" element={<Layout><UserDashboard /></Layout>} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
            <Route path="/admin/users" element={<Layout><AdminUsers /></Layout>} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['ROLE_TECHNICIAN']} />}>
            <Route path="/technician-dashboard" element={<Layout><TechnicianDashboard /></Layout>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TECHNICIAN']} />}>
            <Route path="/tickets" element={<Layout><TicketListPage /></Layout>} />
            <Route path="/tickets/:id" element={<Layout><TicketDetailPage /></Layout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


