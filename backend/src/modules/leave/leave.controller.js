const leaveService = require('./leave.service');

const getLeaveRequests = async (req, res) => {
  try {
    const requests = await leaveService.getLeaveRequests(req.userId, req.userRole);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    const request = await leaveService.createLeaveRequest({
      userId: req.userId,
      startDate, endDate, type, reason,
    });
    res.status(201).json({ message: 'Leave request submitted', request });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const approveLeave = async (req, res) => {
  try {
    const request = await leaveService.approveLeave(req.params.id);
    res.json({ message: 'Leave request approved', request });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const request = await leaveService.rejectLeave(req.params.id);
    res.json({ message: 'Leave request rejected', request });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteLeaveRequest = async (req, res) => {
  try {
    await leaveService.deleteLeaveRequest(req.params.id, req.userId, req.userRole);
    res.json({ message: 'Leave request deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getLeaveRequests, createLeaveRequest,
  approveLeave, rejectLeave, deleteLeaveRequest,
};