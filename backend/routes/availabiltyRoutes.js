const express = require('express');
const Availability = require('../models/Availability');
const Therapist = require('../models/Therapist');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/availability?therapist=:id
 * List availability for a therapist.
 */
router.get('/', async (req, res) => {
  const therapistId = req.query.therapist;
  if (!therapistId) return res.status(400).json({ message: 'therapist query is required' });
  const items = await Availability.find({ therapist: therapistId }).sort({ start: 1 }).lean();
  res.json(items);
});

/**
 * POST /api/availability
 * body: { therapist, start, end }
 * Owner-only (therapist user).
 */
router.post('/', protect, async (req, res) => {
  const { therapist, start, end } = req.body;
  if (!therapist || !start || !end) return res.status(400).json({ message: 'therapist, start, end are required' });

  const t = await Therapist.findById(therapist);
  if (!t) return res.status(404).json({ message: 'Therapist not found' });
  if (String(t.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  const slot = await Availability.create({ therapist, start, end });
  res.status(201).json(slot);
});

/**
 * DELETE /api/availability/:id
 * Owner-only (therapist user).
 */
router.delete('/:id', protect, async (req, res) => {
  const slot = await Availability.findById(req.params.id).populate({
    path: 'therapist',
    select: 'user',
  });
  if (!slot) return res.status(404).json({ message: 'Slot not found' });
  if (String(slot.therapist.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  if (slot.isBooked) return res.status(400).json({ message: 'Slot already booked' });

  await slot.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
