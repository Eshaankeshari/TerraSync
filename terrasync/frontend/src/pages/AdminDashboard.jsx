import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function AdminDashboard() {
  const { API_URL, authHeaders } = useAuth()
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  async function fetchAll() {
    const res = await fetch(`${API_URL}/api/admin/reports`, { headers: { ...authHeaders() } })
    if (res.ok) setItems(await res.json())
    const s = await fetch(`${API_URL}/api/admin/analytics/summary`, { headers: { ...authHeaders() } })
    if (s.ok) setSummary(await s.json())
  }

  useEffect(() => { fetchAll() }, [])

  async function updateStatus(id, status, file) {
    setUpdatingId(id)
    const fd = new FormData()
    fd.append('status', status)
    if (file) fd.append('resolutionPhoto', file)
    const res = await fetch(`${API_URL}/api/admin/reports/${id}/status`, { method: 'POST', headers: { ...authHeaders() }, body: fd })
    setUpdatingId(null)
    if (res.ok) fetchAll()
  }

  return (
    <div>
      <div className="card">
        <h2>Admin Dashboard</h2>
        {summary && (
          <div className="row">
            <div className="col">
              <strong>Status Counts</strong>
              <ul>
                {summary.countsByStatus.map(s => (
                  <li key={s.status}>{s.status}: {s.count}</li>
                ))}
              </ul>
            </div>
            <div className="col">
              <strong>Avg Resolution Time</strong>
              <div>{summary.avgResolutionMs ? Math.round(summary.avgResolutionMs/3600000) + ' hrs' : 'N/A'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Description</th>
              <th>Status</th>
              <th>Concern</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r._id}>
                <td>{r.photoUrl && <img src={r.photoUrl} alt="" style={{ width: 60, borderRadius: 6 }} />}</td>
                <td>{r.description}</td>
                <td><span className={`status ${r.status}`}>{r.status}</span></td>
                <td>{r.concernCount}</td>
                <td>
                  <select defaultValue={r.status} onChange={e => updateStatus(r._id, e.target.value)} disabled={updatingId===r._id}>
                    <option>Submitted</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <div style={{ marginTop: 6 }}>
                    <label>Resolution Photo</label>
                    <input type="file" accept="image/*" onChange={e => updateStatus(r._id, 'Resolved', e.target.files?.[0])} disabled={updatingId===r._id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
