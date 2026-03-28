const express = require('express');
const router = express.Router();
const timecardController = require('./timecard.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth.middleware');

router.use(authenticate);

// Any employee can log and view their own timecards
router.get('/', timecardController.getTimecards);
router.get('/:id', timecardController.getTimecardById);
router.post('/', timecardController.createTimecard);
router.delete('/:id', timecardController.deleteTimecard);

// Only managers can approve or reject
router.patch(
  '/:id/approve',
  authorize(['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']),
  timecardController.approveTimecard
);
router.patch(
  '/:id/reject',
  authorize(['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']),
  timecardController.rejectTimecard
);

module.exports = router;