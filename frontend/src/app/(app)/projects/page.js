'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const statusColors = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-100',
  ON_HOLD: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-100',
  CANCELLED: 'bg-red-50 text-red-700 border-red-100',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting project');
    }
  };

  const filtered = filter === 'ALL'
    ? projects
    : projects.filter((p) => p.status === filter);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">Track and manage all projects</p>
        </div>
        <Link
          href="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: projects.length, filter: 'ALL' },
          { label: 'Active', value: projects.filter(p => p.status === 'ACTIVE').length, filter: 'ACTIVE' },
          { label: 'On hold', value: projects.filter(p => p.status === 'ON_HOLD').length, filter: 'ON_HOLD' },
          { label: 'Completed', value: projects.filter(p => p.status === 'COMPLETED').length, filter: 'COMPLETED' },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filter)}
            className={`bg-white rounded-xl border p-5 text-left transition-all ${
              filter === stat.filter
                ? 'border-blue-300 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          <p className="text-lg mb-1">No projects found</p>
          <p className="text-sm">Click "+ New Project" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              {/* Status badge */}
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Project name */}
              <Link href={`/projects/${project.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                  {project.name}
                </h3>
              </Link>

              {/* Description */}
              {project.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {/* Meta info */}
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Start date</span>
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                {project.endDate && (
                  <div className="flex justify-between">
                    <span>End date</span>
                    <span>{new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="flex justify-between">
                    <span>Budget</span>
                    <span className="font-medium text-gray-700">
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span>Team members</span>
                  <span className="font-medium text-gray-700">
                    {project._count.assignments}
                  </span>
                </div>
              </div>

              {/* View button */}
              <Link
                href={`/projects/${project.id}`}
                className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}