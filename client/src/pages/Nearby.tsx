import { useEffect, useState } from 'react';
import axios from 'axios';

interface Report {
  _id: string;
  description: string;
  photoUrl: string;
  status: 'Submitted'|'In Progress'|'Resolved';
  concernCount: number;
  location: { coordinates: [number, number]; address?: string };
}

export default function Nearby() {
  const [pos, setPos] = useState<{lat:number; lng:number} | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!pos) return;
      const res = await axios.get('/reports/nearby', { params: { lat: pos.lat, lng: pos.lng, radiusMeters: 3000 } });
      setReports(res.data);
    })();
  }, [pos]);

  async function confirm(id: string) {
    const res = await axios.post(`/reports/${id}/confirm`);
    setReports((prev) => prev.map(r => r._id === id ? res.data : r));
  }

  return (
    <div>
      <h2>Issues Nearby</h2>
      {!pos && <p>Getting your location…</p>}
      <div className="grid">
        {reports.map(r => (
          <div className="card" key={r._id}>
            <img className="responsive" src={r.photoUrl} alt="before" />
            <p>{r.description}</p>
            <p>{r.location.address || `@ ${r.location.coordinates[1]}, ${r.location.coordinates[0]}`}</p>
            <p>Concerns: {r.concernCount}</p>
            <button className="btn-secondary" onClick={() => confirm(r._id)}>Confirm Concern</button>
          </div>
        ))}
      </div>
    </div>
  );
}