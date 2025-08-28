import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
        <h2>Login</h2>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="btn-primary" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}