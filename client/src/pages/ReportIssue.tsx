import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReportIssue() {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat:number; lng:number; address?:string} | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  async function uploadImage(): Promise<string> {
    if (!imageFile) throw new Error('No image');
    const form = new FormData();
    form.append('image', imageFile);
    const res = await axios.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url as string;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('');
    try {
      const photoUrl = await uploadImage();
      const res = await axios.post('/reports', {
        description,
        photoUrl,
        location: location ? { coordinates: [location.lng, location.lat], address: location.address } : undefined
      });
      setStatus('Submitted!');
      setDescription('');
      setImageFile(null);
    } catch (e: any) {
      setStatus(e?.response?.data?.message || 'Failed to submit');
    }
  }

  return (
    <div className="card">
      <h2>Report Issue</h2>
      <form onSubmit={onSubmit}>
        <label>Photo</label>
        <input className="input" type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files?.[0] || null)} />

        <label>Description</label>
        <textarea className="input" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />

        <label>Location</label>
        <div className="grid">
          <input className="input" placeholder="Latitude" value={location?.lat ?? ''} onChange={(e)=>setLocation({ lat: Number(e.target.value), lng: location?.lng || 0, address: location?.address })} />
          <input className="input" placeholder="Longitude" value={location?.lng ?? ''} onChange={(e)=>setLocation({ lng: Number(e.target.value), lat: location?.lat || 0, address: location?.address })} />
          <input className="input" placeholder="Address (optional)" value={location?.address ?? ''} onChange={(e)=>setLocation({ lat: location?.lat || 0, lng: location?.lng || 0, address: e.target.value })} />
        </div>

        <button className="btn-primary" type="submit">Submit</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}