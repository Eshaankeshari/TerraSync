import { useEffect, useState } from 'react';
import axios from 'axios';

interface Report {
  _id: string;
  description: string;
  photoUrl: string;
  afterPhotoUrl?: string;
  status: 'Submitted'|'In Progress'|'Resolved';
  concernCount: number;
  createdAt: string;
}

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    (async () => {
      const res = await axios.get('/reports/mine');
      setReports(res.data);
    })();
  }, []);

  return (
    <div>
      <h2>My Reports</h2>
      <div className="grid">
        {reports.map(r => (
          <div className="card" key={r._id}>
            <img className="responsive" src={r.photoUrl} alt="before" />
            <p>{r.description}</p>
            <p>
              <span className={`badge ${r.status === 'Submitted' ? 'submitted' : r.status==='In Progress' ? 'inprogress' : 'resolved'}`}>{r.status}</span>
              {' '}· Concerns: {r.concernCount}
            </p>
            {r.afterPhotoUrl && (
              <>
                <div>After:</div>
                <img className="responsive" src={r.afterPhotoUrl} alt="after" />
              </>
            )}
            <small>{new Date(r.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}