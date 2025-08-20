const Therapist = require('../models/Therapist');

exports.upsertMe = async (req, res) => {
  try {
    const userId = req.user._id; // set by auth middleware
    const { bio, specialties = [], ratePerHour = 0, languages = [], photoUrl = '' } = req.body;

    const updates = { bio, specialties, ratePerHour, languages, photoUrl };
    const doc = await Therapist.findOneAndUpdate(
      { user: userId },
      { $set: updates, $setOnInsert: { user: userId } },
      { new: true, upsert: true }
    ).lean();

    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to save therapist profile' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q, specialty, language } = req.query;
    const filter = {};
    if (specialty) filter.specialties = specialty;
    if (language) filter.languages = language;
    if (q) filter.$or = [
      { bio: { $regex: q, $options: 'i' } },
      { specialties: { $regex: q, $options: 'i' } },
      { languages: { $regex: q, $options: 'i' } }
    ];

    const docs = await Therapist.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to list therapists' });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Therapist.findById(req.params.id).populate('user', 'name email').lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get therapist' });
  }
};
