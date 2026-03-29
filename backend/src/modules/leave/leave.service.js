const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Managers see all requests, employees see only their own
const getLeaveRequests = async (userId, userRole) => {
  const isManager = ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD'].includes(userRole);
  const where = isManager ? {} : { userId };

  return prisma.leaveRequest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true, firstName: true,
          lastName: true, email: true, role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const createLeaveRequest = async ({ userId, startDate, endDate, type, reason }) => {
  if (!startDate || !endDate || !type) {
    throw new Error('Start date, end date, and type are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new Error('End date cannot be before start date');
  }

  // Check for overlapping leave requests
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: { not: 'REJECTED' },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });

  if (overlap) {
    throw new Error('You already have a leave request overlapping these dates');
  }

  return prisma.leaveRequest.create({
    data: {
      userId,
      startDate: start,
      endDate: end,
      type,
      reason: reason || null,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true, firstName: true,
          lastName: true, email: true,
        },
      },
    },
  });
};

const approveLeave = async (id) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new Error('Leave request not found');
  if (leave.status !== 'PENDING') throw new Error('Only pending requests can be approved');

  return prisma.leaveRequest.update({
    where: { id },
    data: { status: 'APPROVED' },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });
};

const rejectLeave = async (id) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new Error('Leave request not found');
  if (leave.status !== 'PENDING') throw new Error('Only pending requests can be rejected');

  return prisma.leaveRequest.update({
    where: { id },
    data: { status: 'REJECTED' },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });
};

const deleteLeaveRequest = async (id, userId, userRole) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new Error('Leave request not found');

  const isManager = ['SUPER_ADMIN', 'HR_MANAGER'].includes(userRole);
  if (!isManager && leave.userId !== userId) {
    throw new Error('You can only delete your own leave requests');
  }
  if (leave.status === 'APPROVED') {
    throw new Error('Cannot delete an approved leave request');
  }

  return prisma.leaveRequest.delete({ where: { id } });
};

module.exports = {
  getLeaveRequests, createLeaveRequest,
  approveLeave, rejectLeave, deleteLeaveRequest,
};