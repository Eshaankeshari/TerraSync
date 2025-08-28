import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">TerraSync</Link>
      </div>
      <div className="nav-right">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user?.role === 'citizen' && (
          <>
            <Link to="/report">Report Issue</Link>
            <Link to="/reports/mine">My Reports</Link>
            <Link to="/nearby">Issues Nearby</Link>
          </>
        )}
        {user?.role === 'municipal' && (
          <>
            <Link to="/municipal">Municipal Dashboard</Link>
            <Link to="/nearby">Nearby</Link>
          </>
        )}
        {user && (
          <button className="btn" onClick={logout}>Logout</button>
        )}
      </div>
    </nav>
  );
}