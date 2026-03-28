const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── PROJECTS ────────────────────────────────────────────────

const getProjects = async () => {
  return prisma.project.findMany({
    include: {
      _count: {
        select: { assignments: true, timecards: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true, firstName: true,
                  lastName: true, email: true, role: true,
                },
              },
              department: true,
            },
          },
        },
      },
      _count: {
        select: { timecards: true, expenses: true },
      },
    },
  });

  if (!project) throw new Error('Project not found');
  return project;
};

const createProject = async ({
  name, description, startDate, endDate, budget, status,
}) => {
  if (!name || !startDate) throw new Error('Name and start date are required');

  return prisma.project.create({
    data: {
      name,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      budget: budget ? parseFloat(budget) : null,
      status: status || 'ACTIVE',
    },
  });
};

const updateProject = async (id, {
  name, description, startDate, endDate, budget, status,
}) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error('Project not found');

  return prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
      ...(status && { status }),
    },
  });
};

const deleteProject = async (id) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error('Project not found');

  return prisma.project.delete({ where: { id } });
};

// ─── MEMBERS ─────────────────────────────────────────────────

const getProjectMembers = async (projectId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  return prisma.projectAssignment.findMany({
    where: { projectId },
    include: {
      employee: {
        include: {
          user: {
            select: {
              id: true, firstName: true,
              lastName: true, email: true, role: true,
            },
          },
          department: true,
        },
      },
    },
  });
};

const addMember = async (projectId, employeeId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new Error('Employee not found');

  const existing = await prisma.projectAssignment.findUnique({
    where: { projectId_employeeId: { projectId, employeeId } },
  });
  if (existing) throw new Error('Employee already in this project');

  return prisma.projectAssignment.create({
    data: { projectId, employeeId },
    include: {
      employee: {
        include: {
          user: {
            select: {
              id: true, firstName: true,
              lastName: true, email: true,
            },
          },
        },
      },
    },
  });
};

const removeMember = async (projectId, employeeId) => {
  const assignment = await prisma.projectAssignment.findUnique({
    where: { projectId_employeeId: { projectId, employeeId } },
  });
  if (!assignment) throw new Error('Assignment not found');

  return prisma.projectAssignment.delete({
    where: { projectId_employeeId: { projectId, employeeId } },
  });
};

module.exports = {
  getProjects, getProjectById, createProject,
  updateProject, deleteProject,
  getProjectMembers, addMember, removeMember,
};