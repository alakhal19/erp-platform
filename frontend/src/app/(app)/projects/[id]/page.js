'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

const statusColors = {
  ACTIVE: 'bg-green-50 text-green-700',
  ON_HOLD: 'bg-yellow-50 text-yellow-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    fetchProject();
    fetchEmployees();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      setEmployees(res.data.employees);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedEmployee) return;
    try {
      await api.post(`/projects/${id}/members`, { employeeId: selectedEmployee });
      setSelectedEmployee('');
      setAddingMember(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding member');
    }
  };

  const handleRemoveMember = async (employeeId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${employeeId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.error || 'Error removing member');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!project) return <div className="p-8 text-gray-500">Project not found</div>;

  // Employees not yet in the project
  const assignedIds = project.assignments.map((a) => a.employee.id);
  const availableEmployees = employees.filter((e) => !assignedIds.includes(e.id));

  return (
    <div className="p-8 max-w-4xl">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700 mb-5 flex items-center gap-1"
      >
        ← Back to projects
      </button>

      {/* Project header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
            )}
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[project.status]}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Project meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Start date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(project.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">End date</p>
            <p className="text-sm font-medium text-gray-900">
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="text-sm font-medium text-gray-900">
              {project.budget ? `$${project.budget.toLocaleString()}` : '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Timecards logged</p>
            <p className="text-sm font-medium text-gray-900">{project._count.timecards}</p>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Team members ({project.assignments.length})
          </h2>
          <button
            onClick={() => setAddingMember(!addingMember)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add member
          </button>
        </div>

        {/* Add member UI */}
        {addingMember && (
          <div className="flex gap-3 mb-4 p-4 bg-blue-50 rounded-lg">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.firstName} {emp.user.lastName} — {emp.department.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setAddingMember(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Members list */}
        {project.assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No team members yet — click "Add member" to assign employees
          </div>
        ) : (
          <div className="space-y-3">
            {project.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 text-sm font-medium">
                      {assignment.employee.user.firstName[0]}
                      {assignment.employee.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {assignment.employee.user.firstName} {assignment.employee.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {assignment.employee.department.name} · {assignment.employee.user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(assignment.employee.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}