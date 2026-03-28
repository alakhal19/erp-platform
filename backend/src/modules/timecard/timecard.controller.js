const timecardService = require('./timecard.service');

const getTimecards = async (req, res) => {
  try {
    const timecards = await timecardService.getTimecards(req.userId, req.userRole);
    res.json({ timecards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTimecardById = async (req, res) => {
  try {
    const timecard = await timecardService.getTimecardById(
      req.params.id, req.userId, req.userRole
    );
    res.json({ timecard });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const createTimecard = async (req, res) => {
  try {
    const { projectId, date, hoursWorked, description } = req.body;
    const timecard = await timecardService.createTimecard({
      userId: req.userId,
      projectId, date, hoursWorked, description,
    });
    res.status(201).json({ message: 'Timecard logged', timecard });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const approveTimecard = async (req, res) => {
  try {
    const timecard = await timecardService.approveTimecard(req.params.id);
    res.json({ message: 'Timecard approved', timecard });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rejectTimecard = async (req, res) => {
  try {
    const timecard = await timecardService.rejectTimecard(req.params.id);
    res.json({ message: 'Timecard rejected', timecard });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteTimecard = async (req, res) => {
  try {
    await timecardService.deleteTimecard(req.params.id, req.userId, req.userRole);
    res.json({ message: 'Timecard deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getTimecards, getTimecardById, createTimecard,
  approveTimecard, rejectTimecard, deleteTimecard,
};