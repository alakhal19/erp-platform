const express = require('express');
const router = express.Router();
const projectsController = require('./projects.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth.middleware');

router.use(authenticate);

// Project routes
router.get('/', projectsController.getProjects);
router.get('/:id', projectsController.getProjectById);
router.post('/', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), projectsController.createProject);
router.put('/:id', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), projectsController.updateProject);
router.delete('/:id', authorize(['SUPER_ADMIN']), projectsController.deleteProject);

// Assignment routes (add/remove employees from a project)
router.get('/:id/members', projectsController.getProjectMembers);
router.post('/:id/members', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), projectsController.addMember);
router.delete('/:id/members/:employeeId', authorize(['SUPER_ADMIN', 'PROJECT_MANAGER']), projectsController.removeMember);

module.exports = router;