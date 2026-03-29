const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth.middleware');

router.use(authenticate);

// Anyone can view expenses
router.get('/expenses', financeController.getExpenses);
router.get('/expenses/:id', financeController.getExpenseById);
router.get('/summary', financeController.getFinanceSummary);

// Only finance officers and admins can create/edit/delete
router.post(
  '/expenses',
  authorize(['SUPER_ADMIN', 'FINANCE_OFFICER', 'PROJECT_MANAGER']),
  financeController.createExpense
);
router.put(
  '/expenses/:id',
  authorize(['SUPER_ADMIN', 'FINANCE_OFFICER']),
  financeController.updateExpense
);
router.delete(
  '/expenses/:id',
  authorize(['SUPER_ADMIN', 'FINANCE_OFFICER']),
  financeController.deleteExpense
);

module.exports = router;