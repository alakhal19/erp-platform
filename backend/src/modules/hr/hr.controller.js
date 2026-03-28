const hrService = require('./hr.service');

// ─── DEPARTMENTS ─────────────────────────────────────────────

const getDepartments = async (req, res) => {
  try {
    const departments = await hrService.getDepartments();
    res.json({ departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const department = await hrService.createDepartment({ name });
    res.status(201).json({ message: 'Department created', department });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await hrService.updateDepartment(req.params.id, req.body);
    res.json({ message: 'Department updated', department });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await hrService.deleteDepartment(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ─── EMPLOYEES ───────────────────────────────────────────────

const getEmployees = async (req, res) => {
  try {
    const employees = await hrService.getEmployees();
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const employee = await hrService.getEmployeeById(req.params.id);
    res.json({ employee });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      email, password, firstName, lastName,
      role, departmentId, position, hireDate, salary,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !departmentId || !position || !hireDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const employee = await hrService.createEmployee({
      email, password, firstName, lastName,
      role, departmentId, position, hireDate, salary,
    });

    res.status(201).json({ message: 'Employee created', employee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await hrService.updateEmployee(req.params.id, req.body);
    res.json({ message: 'Employee updated', employee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    await hrService.deleteEmployee(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
};