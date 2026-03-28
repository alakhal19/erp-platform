const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get timecards — employees see only their own, managers see all
const getTimecards = async (userId, userRole) => {
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'HR_MANAGER'].includes(userRole);

  const where = isManager ? {} : { userId };

  return prisma.timecard.findMany({
    where,
    include: {
      user: {
        select: {
          id: true, firstName: true,
          lastName: true, email: true,
        },
      },
      project: {
        select: { id: true, name: true, status: true },
      },
    },
    orderBy: { date: 'desc' },
  });
};

const getTimecardById = async (id, userId, userRole) => {
  const timecard = await prisma.timecard.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true, firstName: true,
          lastName: true, email: true,
        },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });

  if (!timecard) throw new Error('Timecard not found');

  // Employees can only see their own timecards
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'HR_MANAGER'].includes(userRole);
  if (!isManager && timecard.userId !== userId) {
    throw new Error('Access denied');
  }

  return timecard;
};

const createTimecard = async ({ userId, projectId, date, hoursWorked, description }) => {
  if (!projectId || !date || !hoursWorked) {
    throw new Error('Project, date, and hours worked are required');
  }

  if (hoursWorked <= 0 || hoursWorked > 24) {
    throw new Error('Hours worked must be between 0 and 24');
  }

  // Check project exists and is active
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');
  if (project.status !== 'ACTIVE') throw new Error('Can only log hours on active projects');

  // Check user is assigned to this project
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (employee) {
    const assignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_employeeId: { projectId, employeeId: employee.id },
      },
    });
    if (!assignment) throw new Error('You are not assigned to this project');
  }

  return prisma.timecard.create({
    data: {
      userId,
      projectId,
      date: new Date(date),
      hoursWorked: parseFloat(hoursWorked),
      description: description || null,
      status: 'PENDING',
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });
};

const approveTimecard = async (id) => {
  const timecard = await prisma.timecard.findUnique({ where: { id } });
  if (!timecard) throw new Error('Timecard not found');
  if (timecard.status !== 'PENDING') throw new Error('Only pending timecards can be approved');

  return prisma.timecard.update({
    where: { id },
    data: { status: 'APPROVED' },
    include: {
      user: { select: { firstName: true, lastName: true } },
      project: { select: { name: true } },
    },
  });
};

const rejectTimecard = async (id) => {
  const timecard = await prisma.timecard.findUnique({ where: { id } });
  if (!timecard) throw new Error('Timecard not found');
  if (timecard.status !== 'PENDING') throw new Error('Only pending timecards can be rejected');

  return prisma.timecard.update({
    where: { id },
    data: { status: 'REJECTED' },
    include: {
      user: { select: { firstName: true, lastName: true } },
      project: { select: { name: true } },
    },
  });
};

const deleteTimecard = async (id, userId, userRole) => {
  const timecard = await prisma.timecard.findUnique({ where: { id } });
  if (!timecard) throw new Error('Timecard not found');

  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER'].includes(userRole);
  if (!isManager && timecard.userId !== userId) {
    throw new Error('You can only delete your own timecards');
  }
  if (timecard.status === 'APPROVED') {
    throw new Error('Cannot delete an approved timecard');
  }

  return prisma.timecard.delete({ where: { id } });
};

module.exports = {
  getTimecards, getTimecardById, createTimecard,
  approveTimecard, rejectTimecard, deleteTimecard,
};