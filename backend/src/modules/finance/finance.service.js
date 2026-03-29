const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── EXPENSES ────────────────────────────────────────────────

const getExpenses = async () => {
  return prisma.expense.findMany({
    include: {
      project: {
        select: { id: true, name: true, budget: true, status: true },
      },
    },
    orderBy: { date: 'desc' },
  });
};

const getExpenseById = async (id) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      project: {
        select: { id: true, name: true, budget: true },
      },
    },
  });
  if (!expense) throw new Error('Expense not found');
  return expense;
};

const createExpense = async ({ projectId, title, amount, date, description }) => {
  if (!projectId || !title || !amount || !date) {
    throw new Error('Project, title, amount, and date are required');
  }

  if (amount <= 0) throw new Error('Amount must be greater than 0');

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  return prisma.expense.create({
    data: {
      projectId,
      title,
      amount: parseFloat(amount),
      date: new Date(date),
      description: description || null,
    },
    include: {
      project: { select: { id: true, name: true, budget: true } },
    },
  });
};

const updateExpense = async (id, { title, amount, date, description }) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new Error('Expense not found');

  return prisma.expense.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(date && { date: new Date(date) }),
      ...(description !== undefined && { description }),
    },
    include: {
      project: { select: { id: true, name: true, budget: true } },
    },
  });
};

const deleteExpense = async (id) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new Error('Expense not found');
  return prisma.expense.delete({ where: { id } });
};

// ─── SUMMARY ─────────────────────────────────────────────────

const getFinanceSummary = async () => {
  const projects = await prisma.project.findMany({
    include: {
      expenses: true,
      _count: { select: { expenses: true } },
    },
  });

  const summary = projects.map((project) => {
    const totalSpent = project.expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = project.budget || 0;
    const remaining = budget - totalSpent;
    const burnRate = budget > 0 ? Math.round((totalSpent / budget) * 100) : null;

    return {
      projectId: project.id,
      projectName: project.name,
      status: project.status,
      budget,
      totalSpent,
      remaining,
      burnRate,
      expenseCount: project._count.expenses,
    };
  });

  const totalBudget = summary.reduce((sum, s) => sum + s.budget, 0);
  const totalSpent = summary.reduce((sum, s) => sum + s.totalSpent, 0);

  return { summary, totalBudget, totalSpent, totalRemaining: totalBudget - totalSpent };
};

module.exports = {
  getExpenses, getExpenseById, createExpense,
  updateExpense, deleteExpense, getFinanceSummary,
};