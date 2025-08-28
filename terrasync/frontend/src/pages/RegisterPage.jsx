import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (e) {
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 12 }}>
          <button disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
        </div>
      </form>
    </div>
  )
}
