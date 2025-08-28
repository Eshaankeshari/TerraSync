import { Router } from 'express';
import Report from '../models/Report.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired(['citizen']), async (req, res) => {
  const { description, photoUrl, location } = req.body;
  const user = (req as any).user as { id: string };
  if (!description || !photoUrl || !location?.coordinates) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const report = await Report.create({
    citizen: user.id,
    description,
    photoUrl,
    location: { type: 'Point', coordinates: location.coordinates, address: location.address },
    status: 'Submitted'
  });
  res.status(201).json(report);
});

router.get('/mine', authRequired(['citizen']), async (req, res) => {
  const user = (req as any).user as { id: string };
  const reports = await Report.find({ citizen: user.id }).sort({ createdAt: -1 });
  res.json(reports);
});

router.get('/nearby', authRequired(['citizen','municipal']), async (req, res) => {
  const { lng, lat, radiusMeters = 2000 } = req.query as any;
  if (!lng || !lat) return res.status(400).json({ message: 'lng and lat required' });
  const reports = await Report.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radiusMeters)
      }
    }
  }).limit(100);
  res.json(reports);
});

router.post('/:id/confirm', authRequired(['citizen']), async (req, res) => {
  const user = (req as any).user as { id: string };
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Not found' });
  if (report.confirmedBy.some((u: any) => String(u) === user.id)) {
    return res.json(report);
  }
  report.confirmedBy.push(user.id as any);
  report.concernCount = report.confirmedBy.length;
  await report.save();
  res.json(report);
});

router.get('/', authRequired(['municipal']), async (_req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

router.get('/:id', authRequired(['municipal']), async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Not found' });
  res.json(report);
});

router.patch('/:id/status', authRequired(['municipal']), async (req, res) => {
  const { status, afterPhotoUrl } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { status, ...(afterPhotoUrl ? { afterPhotoUrl } : {}) }, { new: true });
  if (!report) return res.status(404).json({ message: 'Not found' });
  res.json(report);
});

export default router;