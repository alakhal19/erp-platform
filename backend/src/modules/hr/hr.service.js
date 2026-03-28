const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── DEPARTMENTS ────────────────────────────────────────────

const getDepartments = async () => {
  return prisma.department.findMany({
    include: {
      _count: { select: { employees: true } },
    },
    orderBy: { name: 'asc' },
  });
};

const createDepartment = async ({ name }) => {
  const existing = await prisma.department.findUnique({ where: { name } });
  if (existing) throw new Error('Department already exists');

  return prisma.department.create({ data: { name } });
};

const updateDepartment = async (id, { name }) => {
  return prisma.department.update({
    where: { id },
    data: { name },
  });
};

const deleteDepartment = async (id) => {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  });

  if (!dept) throw new Error('Department not found');
  if (dept._count.employees > 0) {
    throw new Error('Cannot delete department with existing employees');
  }

  return prisma.department.delete({ where: { id } });
};

// ─── EMPLOYEES ───────────────────────────────────────────────

const getEmployees = async () => {
  return prisma.employee.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      },
      department: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      },
      department: true,
    },
  });

  if (!employee) throw new Error('Employee not found');
  return employee;
};

const createEmployee = async ({
  email, password, firstName, lastName,
  role, departmentId, position, hireDate, salary,
}) => {
  // Check email not taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user and employee in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'EMPLOYEE',
      },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        departmentId,
        position,
        hireDate: new Date(hireDate),
        salary: salary ? parseFloat(salary) : null,
      },
      include: {
        user: {
          select: {
            id: true, email: true,
            firstName: true, lastName: true,
            role: true, isActive: true,
          },
        },
        department: true,
      },
    });

    return employee;
  });

  return result;
};

const updateEmployee = async (id, {
  firstName, lastName, role,
  departmentId, position, hireDate, salary, isActive,
}) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!employee) throw new Error('Employee not found');

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: employee.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    const updated = await tx.employee.update({
      where: { id },
      data: {
        ...(departmentId && { departmentId }),
        ...(position && { position }),
        ...(hireDate && { hireDate: new Date(hireDate) }),
        ...(salary !== undefined && { salary: parseFloat(salary) }),
      },
      include: {
        user: {
          select: {
            id: true, email: true,
            firstName: true, lastName: true,
            role: true, isActive: true,
          },
        },
        department: true,
      },
    });

    return updated;
  });

  return result;
};

const deleteEmployee = async (id) => {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw new Error('Employee not found');

  await prisma.$transaction(async (tx) => {
    await tx.employee.delete({ where: { id } });
    await tx.user.delete({ where: { id: employee.userId } });
  });
};

module.exports = {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee,
};