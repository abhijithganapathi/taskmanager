const mongoose = require('mongoose');
const Availability = require('../models/Availability');
const Appointment = require('../models/appointment');
const Therapist = require('../models/Therapist');

exports.book = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: 'slotId required' });

    // Atomically set isBooked = true if currently false
    const slot = await Availability.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { $set: { isBooked: true } },
      { new: true }
    );
    if (!slot) return res.status(409).json({ message: 'Slot unavailable' });

    const appt = await Appointment.create({
      therapist: slot.therapist,
      patient: req.user._id,
      start: slot.start,
      end: slot.end
    });
    res.status(201).json(appt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Booking failed' });
  }
};

exports.myAppointments = async (req, res) => {
  try {
    const docs = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'therapist', populate: { path: 'user', select: 'name email' } })
      .sort({ start: -1 }).lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load' });
  }
};

exports.myTherapistAppointments = async (req, res) => {
  try {
    const me = await Therapist.findOne({ user: req.user._id });
    if (!me) return res.json([]);
    const docs = await Appointment.find({ therapist: me._id })
      .populate('patient', 'name email')
      .sort({ start: -1 }).lean();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to load' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Not found' });

    // Only patient or therapist-owner can cancel
    const me = await Therapist.findOne({ user: req.user._id });
    const isPatient = appt.patient.toString() === req.user._id.toString();
    const isTherapistOwner = me && appt.therapist.toString() === me._id.toString();
    if (!isPatient && !isTherapistOwner) return res.status(403).json({ message: 'Forbidden' });

    if (appt.status !== 'booked') return res.status(409).json({ message: 'Already not active' });

    appt.status = 'cancelled';
    await appt.save();

    // Free the slot
    await Availability.findOneAndUpdate(
      { therapist: appt.therapist, start: appt.start, end: appt.end },
      { $set: { isBooked: false } }
    );

    res.json({ message: 'Cancelled' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to cancel' });
  }
};
