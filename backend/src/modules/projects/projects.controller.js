const projectsService = require('./projects.service');

const getProjects = async (req, res) => {
  try {
    const projects = await projectsService.getProjects();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    res.json({ project });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget, status } = req.body;
    if (!name || !startDate) {
      return res.status(400).json({ error: 'Name and start date are required' });
    }
    const project = await projectsService.createProject({
      name, description, startDate, endDate, budget, status,
    });
    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    res.json({ message: 'Project updated', project });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    await projectsService.deleteProject(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const members = await projectsService.getProjectMembers(req.params.id);
    res.json({ members });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }
    const assignment = await projectsService.addMember(req.params.id, employeeId);
    res.status(201).json({ message: 'Member added', assignment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    await projectsService.removeMember(req.params.id, req.params.employeeId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getProjects, getProjectById, createProject,
  updateProject, deleteProject,
  getProjectMembers, addMember, removeMember,
};