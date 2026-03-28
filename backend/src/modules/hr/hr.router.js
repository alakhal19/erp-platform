const express = require('express');
const router = express.Router();
const hrController = require('./hr.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth.middleware');

// All HR routes require authentication
router.use(authenticate);

// Department routes
router.get('/departments', hrController.getDepartments);
router.post('/departments', authorize(['SUPER_ADMIN', 'HR_MANAGER']), hrController.createDepartment);
router.put('/departments/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), hrController.updateDepartment);
router.delete('/departments/:id', authorize(['SUPER_ADMIN']), hrController.deleteDepartment);

// Employee routes
router.get('/employees', hrController.getEmployees);
router.get('/employees/:id', hrController.getEmployeeById);
router.post('/employees', authorize(['SUPER_ADMIN', 'HR_MANAGER']), hrController.createEmployee);
router.put('/employees/:id', authorize(['SUPER_ADMIN', 'HR_MANAGER']), hrController.updateEmployee);
router.delete('/employees/:id', authorize(['SUPER_ADMIN']), hrController.deleteEmployee);

module.exports = router;