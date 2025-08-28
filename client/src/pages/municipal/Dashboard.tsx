import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

type Status = 'Submitted'|'In Progress'|'Resolved';
interface Report {
  _id: string;
  description: string;
  photoUrl: string;
  status: Status;
  createdAt: string;
  concernCount: number;
  location: { address?: string };
}

export default function MunicipalDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<Status | 'All'>('All');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const res = await axios.get('/reports');
      setReports(res.data);
    })();
  }, []);

  const filtered = useMemo(() => reports.filter(r => (status==='All' || r.status===status) && (!q || r.description.toLowerCase().includes(q.toLowerCase()))), [reports, status, q]);

  return (
    <div>
      <h2>Municipal Dashboard</h2>
      <div className="card">
        <div className="grid">
          <input className="input" placeholder="Search description…" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="input" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
            <option>All</option>
            <option>Submitted</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
              <th>Concerns</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r._id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.description}</td>
                <td>{r.status}</td>
                <td>{r.concernCount}</td>
                <td>{r.location?.address || '-'}</td>
                <td><Link to={`/municipal/reports/${r._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}