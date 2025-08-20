const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    patient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slot:      { type: mongoose.Schema.Types.ObjectId, ref: 'Availability', required: true },
    start:     { type: Date, required: true },
    end:       { type: Date, required: true },
    status:    { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
