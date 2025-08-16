const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  start:   { type: Date, required: true, index: true },
  end:     { type: Date, required: true },
  status:  { type: String, enum: ['approved','cancelled','completed'], default: 'approved', index: true },
  notes:   { type: String }
}, { timestamps: true });

AppointmentSchema.index({ start: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
