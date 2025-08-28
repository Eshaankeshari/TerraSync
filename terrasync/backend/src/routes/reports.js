const express = require('express');
const Report = require('../models/Report');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../utils/uploader');

const router = express.Router();

// Create report
router.post('/', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { description, latitude, longitude } = req.body;
    if (!description || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing description or coordinates' });
    }

    const location = { type: 'Point', coordinates: [Number(longitude), Number(latitude)] };
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const report = await Report.create({
      reporter: req.user.id,
      description,
      photoUrl,
      location,
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// My reports
router.get('/mine', authenticate, async (req, res) => {
  try {
    const items = await Report.find({ reporter: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Nearby reports (km radius)
router.get('/nearby', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 2 } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Missing coordinates' });
    const radiusMeters = Number(radiusKm) * 1000;
    const items = await Report.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          $maxDistance: radiusMeters,
        },
      },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nearby reports' });
  }
});

// Confirm concern (increment concernCount)
router.post('/:id/confirm', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Report.findByIdAndUpdate(
      id,
      { $inc: { concernCount: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm concern' });
  }
});

// Get single report
router.get('/:id', authenticate, async (req, res) => {
  try {
    const item = await Report.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

module.exports = router;
