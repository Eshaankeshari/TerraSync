import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CitizenDashboard from './pages/CitizenDashboard'
import AdminDashboard from './pages/AdminDashboard'

function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="nav">
      <div>
        <Link to="/">TerraSync</Link>
        {user?.role === 'citizen' && (
          <>
            {' '}| <Link to="/dashboard">My Dashboard</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            {' '}| <Link to="/admin">Admin</Link>
          </>
        )}
      </div>
      <div>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            {' '}
            <Link to="/register">Register</Link>
          </>
        )}
        {user && (
          <>
            <span style={{ marginRight: 8 }}>Hi, {user.name}</span>
            <button onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </>
        )}
      </div>
    </div>
  )
}

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/" element={<div className="card"><h2>Welcome to TerraSync</h2><p>Report urban waste issues and help your city stay clean.</p></div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute roles={['citizen']}><CitizenDashboard /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
