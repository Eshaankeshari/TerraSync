const express = require('express');
const Report = require('../models/Report');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload } = require('../utils/uploader');

const router = express.Router();

// All routes here require admin role
router.use(authenticate, requireRole('admin'));

// List all reports
router.get('/reports', async (req, res) => {
  try {
    const items = await Report.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Update status and optionally upload resolution photo
router.post('/reports/:id/status', upload.single('resolutionPhoto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Submitted', 'In Progress', 'Resolved'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const update = { status };
    if (status === 'Resolved') update.resolvedAt = new Date();
    if (req.file) update.resolutionPhotoUrl = `/uploads/${req.file.filename}`;

    const updated = await Report.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Basic analytics: hotspots and average resolution time
router.get('/analytics/summary', async (req, res) => {
  try {
    const [countsByStatus, avgResolutionMsAgg, hotspots] = await Promise.all([
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
      Report.aggregate([
        { $match: { status: 'Resolved', resolvedAt: { $exists: true } } },
        { $project: { diffMs: { $subtract: ['$resolvedAt', '$createdAt'] } } },
        { $group: { _id: null, avgMs: { $avg: '$diffMs' } } },
      ]),
      Report.aggregate([
        { $project: { location: 1 } },
        { $group: { _id: { $round: ['$location.coordinates', 2] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const avgResolutionMs = avgResolutionMsAgg[0] ? avgResolutionMsAgg[0].avgMs : null;

    res.json({ countsByStatus, avgResolutionMs, hotspots });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
