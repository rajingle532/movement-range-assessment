import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LiveSession from './pages/LiveSession';
import Patients from './pages/Patients';
import Reports from './pages/Reports';
import Login from './pages/Login';

// Secure route guard
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('therapistUser');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = useState(null);

  // Sync user state on login/logout
  const syncUser = () => {
    const storedUser = localStorage.getItem('therapistUser');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('authChange', syncUser);
    return () => window.removeEventListener('authChange', syncUser);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600/30 selection:text-white">
        {user && <Navbar />}
        <Routes>
          {/* Public login portal */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />

          {/* Secure therapist workspace */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/live" 
            element={
              <ProtectedRoute>
                <LiveSession />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
