const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');

exports.create = async (req, res) => {
  try {
    const { start, end } = req.body;
    if (!start || !end) return res.status(400).json({ message: 'start and end required' });

    const me = await Therapist.findOne({ user: req.user._id });
    if (!me) return res.status(400).json({ message: 'Create your therapist profile first' });

    const slot = await Availability.create({ therapist: me._id, start, end });
    res.status(201).json(slot);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Duplicate slot' });
    console.error(e);
    res.status(500).json({ message: 'Failed to create slot' });
  }
};

exports.list = async (req, res) => {
  try {
    const { therapist, from, to } = req.query;
    const filter = {};
    if (therapist) filter.therapist = therapist;
    if (from || to) {
      filter.start = {};
      if (from) filter.start.$gte = new Date(from);
      if (to) filter.start.$lte = new Date(to);
    }
    const slots = await Availability.find(filter).sort({ start: 1 }).lean();
    res.json(slots);
  } catch (e) {
    res.status(500).json({ message: 'Failed to list availability' });
  }
};

exports.remove = async (req, res) => {
  try {
    const me = await Therapist.findOne({ user: req.user._id });
    if (!me) return res.status(400).json({ message: 'Create therapist profile first' });

    const slot = await Availability.findOne({ _id: req.params.id, therapist: me._id });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(409).json({ message: 'Cannot delete a booked slot' });

    await slot.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete' });
  }
};
