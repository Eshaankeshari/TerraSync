import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import Nearby from './pages/Nearby';
import MunicipalDashboard from './pages/municipal/Dashboard';
import ReportDetail from './pages/municipal/ReportDetail';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './auth/AuthContext';

function PrivateRoute({ children, roles }: { children: JSX.Element; roles?: Array<'citizen'|'municipal'> }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/reports/mine" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={<PrivateRoute roles={['citizen']}><ReportIssue /></PrivateRoute>} />
          <Route path="/reports/mine" element={<PrivateRoute roles={['citizen']}><MyReports /></PrivateRoute>} />
          <Route path="/nearby" element={<PrivateRoute roles={['citizen','municipal']}><Nearby /></PrivateRoute>} />

          <Route path="/municipal" element={<PrivateRoute roles={['municipal']}><MunicipalDashboard /></PrivateRoute>} />
          <Route path="/municipal/reports/:id" element={<PrivateRoute roles={['municipal']}><ReportDetail /></PrivateRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}