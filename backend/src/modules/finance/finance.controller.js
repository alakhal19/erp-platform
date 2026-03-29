const financeService = require('./finance.service');

const getExpenses = async (req, res) => {
  try {
    const expenses = await financeService.getExpenses();
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await financeService.getExpenseById(req.params.id);
    res.json({ expense });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { projectId, title, amount, date, description } = req.body;
    if (!projectId || !title || !amount || !date) {
      return res.status(400).json({ error: 'Project, title, amount, and date are required' });
    }
    const expense = await financeService.createExpense({
      projectId, title, amount, date, description,
    });
    res.status(201).json({ message: 'Expense created', expense });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await financeService.updateExpense(req.params.id, req.body);
    res.json({ message: 'Expense updated', expense });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await financeService.deleteExpense(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFinanceSummary = async (req, res) => {
  try {
    const summary = await financeService.getFinanceSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getExpenses, getExpenseById, createExpense,
  updateExpense, deleteExpense, getFinanceSummary,
};