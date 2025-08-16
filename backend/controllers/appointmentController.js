const Appointment = require('../backend/models/Appointment');

exports.create = async (req, res, next) => {
  try {
    const { start, end, notes } = req.body;
    const appt = await Appointment.create({
      patient: req.user._id,
      start: new Date(start),
      end: new Date(end),
      notes,
      status: 'approved' 
    });
    res.status(201).json(appt);
  } catch (e) { next(e); }
};

exports.mine = async (req, res, next) => {
  try {
    const items = await Appointment.find({ patient: req.user._id })
      .sort({ start: -1 });
    res.json(items);
  } catch (e) { next(e); }
};
