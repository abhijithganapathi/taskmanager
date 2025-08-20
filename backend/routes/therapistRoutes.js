const express = require('express');
const Therapist = require('../models/Therapist');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/therapists
 * List all therapists (basic profile + user basic).
 */
router.get('/', async (req, res) => {
  const list = await Therapist.find({})
    .populate('user', 'name email')
    .lean();
  res.json(list);
});

/**
 * GET /api/therapists/:id
 * Get one therapist with details.
 */
router.get('/:id', async (req, res) => {
  const t = await Therapist.findById(req.params.id)
    .populate('user', 'name email')
    .lean();
  if (!t) return res.status(404).json({ message: 'Therapist not found' });
  res.json(t);
});

/**
 * POST /api/therapists
 * Create your own therapist profile (one per user).
 */
router.post('/', protect, async (req, res) => {
  const exists = await Therapist.findOne({ user: req.user._id });
  if (exists) return res.status(400).json({ message: 'Profile already exists' });

  const { bio, specialties = '', languages = '', ratePerHour = 0, photoUrl = '' } = req.body;

  const doc = await Therapist.create({
    user: req.user._id,
    bio,
    specialties: specialties ? String(specialties).split(',').map(s => s.trim()).filter(Boolean) : [],
    languages: languages ? String(languages).split(',').map(s => s.trim()).filter(Boolean) : [],
    ratePerHour,
    photoUrl,
  });

  const populated = await doc.populate('user', 'name email');
  res.status(201).json(populated);
});

/**
 * PUT /api/therapists/:id
 * Update a therapist profile (only owner).
 */
router.put('/:id', protect, async (req, res) => {
  const t = await Therapist.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Therapist not found' });
  if (String(t.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your profile' });
  }

  const { bio, specialties, languages, ratePerHour, photoUrl } = req.body;
  if (bio !== undefined) t.bio = bio;
  if (photoUrl !== undefined) t.photoUrl = photoUrl;
  if (ratePerHour !== undefined) t.ratePerHour = ratePerHour;
  if (specialties !== undefined)
    t.specialties = String(specialties).split(',').map(s => s.trim()).filter(Boolean);
  if (languages !== undefined)
    t.languages = String(languages).split(',').map(s => s.trim()).filter(Boolean);

  const saved = await t.save();
  const populated = await saved.populate('user', 'name email');
  res.json(populated);
});

module.exports = router;
