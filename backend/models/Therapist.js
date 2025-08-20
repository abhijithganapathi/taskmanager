const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: String,
    specialties: [String],
    languages: [String],
    ratePerHour: { type: Number, default: 0 },
    photoUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Therapist', therapistSchema);
