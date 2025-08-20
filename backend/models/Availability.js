const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    start: { type: Date, required: true },
    end:   { type: Date, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
