import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type Status = 'Submitted'|'In Progress'|'Resolved';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [status, setStatus] = useState<Status>('Submitted');
  const [afterFile, setAfterFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const res = await axios.get(`/reports/${id}`);
      setReport(res.data);
      setStatus(res.data.status);
    })();
  }, [id]);

  async function uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('image', file);
    const res = await axios.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url as string;
  }

  async function save() {
    let afterPhotoUrl: string | undefined = undefined;
    if (afterFile) afterPhotoUrl = await uploadImage(afterFile);
    const res = await axios.patch(`/reports/${id}/status`, { status, afterPhotoUrl });
    setReport(res.data);
  }

  if (!report) return <p>Loading…</p>;

  return (
    <div>
      <h2>Report Detail</h2>
      <div className="grid">
        <div className="card">
          <img className="responsive" src={report.photoUrl} alt="before" />
          <p>{report.description}</p>
          <p>Location: {report.location?.address || `@ ${report.location.coordinates[1]}, ${report.location.coordinates[0]}`}</p>
          <p>Concerns: {report.concernCount}</p>
          <p>Status: {report.status}</p>
          <small>Created: {new Date(report.createdAt).toLocaleString()}</small>
        </div>
        <div className="card">
          <h3>Update Status</h3>
          <select className="input" value={status} onChange={(e)=>setStatus(e.target.value as Status)}>
            <option>Submitted</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <label>Upload After Photo (optional)</label>
          <input className="input" type="file" accept="image/*" onChange={(e)=>setAfterFile(e.target.files?.[0] || null)} />
          <button className="btn-primary" onClick={save}>Save</button>
          {report.afterPhotoUrl && (
            <div style={{ marginTop: '1rem' }}>
              <div>After Photo:</div>
              <img className="responsive" src={report.afterPhotoUrl} alt="after" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}