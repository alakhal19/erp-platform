const express = require('express');
const router = express.Router();
const leaveController = require('./leave.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth.middleware');

router.use(authenticate);

// Any employee can manage their own leave requests
router.get('/', leaveController.getLeaveRequests);
router.post('/', leaveController.createLeaveRequest);
router.delete('/:id', leaveController.deleteLeaveRequest);

// Only managers can approve or reject
router.patch(
  '/:id/approve',
  authorize(['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']),
  leaveController.approveLeave
);
router.patch(
  '/:id/reject',
  authorize(['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']),
  leaveController.rejectLeave
);

module.exports = router;