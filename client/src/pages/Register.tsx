import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen'|'municipal'>('citizen');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, role);
      nav('/');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Register failed');
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '2rem auto' }}>
        <h2>Create Account</h2>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <input className="input" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div style={{ margin: '0.4rem 0' }}>
            <label>
              <input type="radio" name="role" checked={role==='citizen'} onChange={()=>setRole('citizen')} /> Citizen
            </label>
            <label style={{ marginLeft: '1rem' }}>
              <input type="radio" name="role" checked={role==='municipal'} onChange={()=>setRole('municipal')} /> Municipal
            </label>
          </div>
          <button className="btn-primary" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}