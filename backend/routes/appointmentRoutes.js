const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Therapist = require('../models/Therapist');

const router = express.Router();

/**
 * POST /api/appointments/book
 * body: { slotId }
 * Patient books an available slot.
 */
router.post('/book', protect, async (req, res) => {
  const { slotId } = req.body;
  const slot = await Availability.findById(slotId);
  if (!slot) return res.status(404).json({ message: 'Slot not found' });
  if (slot.isBooked) return res.status(400).json({ message: 'Slot already booked' });

  slot.isBooked = true;
  await slot.save();

  const app = await Appointment.create({
    therapist: slot.therapist,
    patient: req.user._id,
    slot: slot._id,
    start: slot.start,
    end: slot.end,
    status: 'booked',
  });

  const populated = await Appointment.findById(app._id)
    .populate({ path: 'therapist', populate: { path: 'user', select: 'name email' } })
    .populate('patient', 'name email')
    .lean();

  res.status(201).json(populated);
});

/**
 * GET /api/appointments/me
 * Appointments for the logged-in patient.
 */
router.get('/me', protect, async (req, res) => {
  const list = await Appointment.find({ patient: req.user._id })
    .sort({ start: 1 })
    .populate({ path: 'therapist', populate: { path: 'user', select: 'name email' } })
    .lean();
  res.json(list);
});

/**
 * GET /api/appointments/therapist
 * Appointments for the logged-in therapist (as provider).
 */
router.get('/therapist', protect, async (req, res) => {
  const t = await Therapist.findOne({ user: req.user._id });
  if (!t) return res.json([]);
  const list = await Appointment.find({ therapist: t._id })
    .sort({ start: 1 })
    .populate('patient', 'name email')
    .populate({ path: 'therapist', populate: { path: 'user', select: 'name email' } })
    .lean();
  res.json(list);
});

/**
 * POST /api/appointments/cancel
 * body: { appointmentId }
 * Patient or therapist can cancel (simple rules here).
 */
router.post('/cancel', protect, async (req, res) => {
  const { appointmentId } = req.body;
  const a = await Appointment.findById(appointmentId)
    .populate({ path: 'therapist', select: 'user' });
  if (!a) return res.status(404).json({ message: 'Appointment not found' });

  const isPatient = String(a.patient) === String(req.user._id);
  const isTherapist = String(a.therapist.user) === String(req.user._id);
  if (!isPatient && !isTherapist) return res.status(403).json({ message: 'Not allowed' });

  a.status = 'cancelled';
  await a.save();

  // free the slot
  await Availability.findByIdAndUpdate(a.slot, { isBooked: false });

  res.json({ ok: true });
});

module.exports = router;
