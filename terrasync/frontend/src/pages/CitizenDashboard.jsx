import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

function IssueCard({ issue, onConfirm }) {
  return (
    <div className="card">
      <div className="row">
        <div className="col" style={{ maxWidth: 200 }}>
          {issue.photoUrl ? <img src={`${issue.photoUrl}`} alt="issue" style={{ width: '100%', borderRadius: 8 }} /> : <div style={{ background:'#f3f4f6', height:120, borderRadius:8 }} />}
        </div>
        <div className="col">
          <div><span className={`status ${issue.status}`}>{issue.status}</span></div>
          <p style={{ marginTop: 8 }}>{issue.description}</p>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Concerns: {issue.concernCount}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onConfirm(issue._id)}>Confirm Concern</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CitizenDashboard() {
  const { API_URL, authHeaders } = useAuth()
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [coords, setCoords] = useState(null)
  const [myReports, setMyReports] = useState([])
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }, [])

  async function fetchMine() {
    const res = await fetch(`${API_URL}/api/reports/mine`, { headers: { ...authHeaders() } })
    if (res.ok) setMyReports(await res.json())
  }

  async function fetchNearby() {
    if (!coords) return
    const params = new URLSearchParams({ latitude: coords.lat, longitude: coords.lng, radiusKm: 2 })
    const res = await fetch(`${API_URL}/api/reports/nearby?${params.toString()}`, { headers: { ...authHeaders() } })
    if (res.ok) setNearby(await res.json())
  }

  useEffect(() => { fetchMine() }, [])
  useEffect(() => { fetchNearby() }, [coords])

  async function submitIssue(e) {
    e.preventDefault()
    if (!coords) return
    setLoading(true)
    const fd = new FormData()
    fd.append('description', description)
    fd.append('latitude', String(coords.lat))
    fd.append('longitude', String(coords.lng))
    if (photo) fd.append('photo', photo)
    const res = await fetch(`${API_URL}/api/reports`, {
      method: 'POST', headers: { ...authHeaders() }, body: fd
    })
    setLoading(false)
    if (res.ok) {
      setDescription(''); setPhoto(null)
      await fetchMine(); await fetchNearby()
    }
  }

  async function confirmConcern(id) {
    const res = await fetch(`${API_URL}/api/reports/${id}/confirm`, { method: 'POST', headers: { ...authHeaders() } })
    if (res.ok) { await fetchNearby() }
  }

  const hasCoords = useMemo(() => coords && !Number.isNaN(coords.lat) && !Number.isNaN(coords.lng), [coords])

  return (
    <div>
      <div className="card">
        <h2>Report Issue</h2>
        <form onSubmit={submitIssue}>
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0])} />
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            {hasCoords ? `Location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Locating… allow geolocation'}
          </div>
          <div style={{ marginTop: 12 }}>
            <button disabled={!hasCoords || loading}>{loading ? 'Submitting…' : 'Submit Report'}</button>
          </div>
        </form>
      </div>

      <div className="row">
        <div className="col">
          <h3>My Reports</h3>
          {myReports.map(r => (
            <div className="card" key={r._id}>
              <div className="row">
                <div className="col" style={{ maxWidth: 200 }}>
                  {r.photoUrl ? <img src={r.photoUrl} alt="issue" style={{ width: '100%', borderRadius: 8 }} /> : <div style={{ background:'#f3f4f6', height:120, borderRadius:8 }} />}
                </div>
                <div className="col">
                  <div><span className={`status ${r.status}`}>{r.status}</span></div>
                  <p style={{ marginTop: 8 }}>{r.description}</p>
                  {r.resolutionPhotoUrl && <img src={r.resolutionPhotoUrl} alt="resolved" style={{ width: 160, borderRadius: 8 }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="col">
          <h3>Issues Nearby</h3>
          {nearby.map(r => (
            <IssueCard key={r._id} issue={r} onConfirm={confirmConcern} />
          ))}
        </div>
      </div>
    </div>
  )
}
