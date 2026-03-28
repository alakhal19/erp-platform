'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function HRPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/departments'),
      ]);
      setEmployees(empRes.data.employees);
      setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/hr/departments/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting department');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    try {
      await api.delete(`/hr/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting employee');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR / Employees</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your team and departments</p>
        </div>
        <Link
          href="/hr/new-employee"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Add Employee
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total employees</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Departments</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{departments.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {['employees', 'departments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Employees Table */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {employees.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-1">No employees yet</p>
              <p className="text-sm">Click "Add Employee" to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Department</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Position</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 text-xs font-medium">
                            {emp.user.firstName[0]}{emp.user.lastName[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {emp.user.firstName} {emp.user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.department.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{emp.position}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                        {emp.user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        emp.user.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {emp.user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Departments Table */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {departments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-1">No departments yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Department name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Employees</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{dept._count.employees}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}