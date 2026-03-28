'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const statusColors = {
  PENDING:  'bg-yellow-50 text-yellow-700 border-yellow-100',
  APPROVED: 'bg-green-50 text-green-700 border-green-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
};

const isManager = (role) =>
  ['SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'HR_MANAGER'].includes(role);

export default function TimecardPage() {
  const { user } = useAuth();
  const [timecards, setTimecards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    projectId: '', date: '', hoursWorked: '', description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tcRes, projRes] = await Promise.all([
        api.get('/timecards'),
        api.get('/projects'),
      ]);
      setTimecards(tcRes.data.timecards);
      // Only show active projects
      setProjects(projRes.data.projects.filter((p) => p.status === 'ACTIVE'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/timecards', form);
      setForm({ projectId: '', date: '', hoursWorked: '', description: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/timecards/${id}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error approving timecard');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/timecards/${id}/reject`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error rejecting timecard');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this timecard?')) return;
    try {
      await api.delete(`/timecards/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting timecard');
    }
  };

  const filtered = filter === 'ALL'
    ? timecards
    : timecards.filter((t) => t.status === filter);

  // Summary stats
  const totalHours = timecards
    .filter((t) => t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.hoursWorked, 0);

  const pending = timecards.filter((t) => t.status === 'PENDING').length;

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TimeCard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isManager(user?.role) ? 'Review and approve team timecards' : 'Log your working hours'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Log hours'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Approved hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalHours}h</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total entries</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{timecards.length}</p>
        </div>
      </div>

      {/* Log hours form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Log working hours</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  name="projectId" value={form.projectId} onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  name="date" type="date" value={form.date} onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours worked</label>
              <input
                name="hoursWorked" type="number" step="0.5" min="0.5" max="24"
                value={form.hoursWorked} onChange={handleChange}
                required placeholder="e.g. 8"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="What did you work on?"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Saving...' : 'Submit timecard'}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Timecards table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No timecards found</p>
            <p className="text-sm">Click "+ Log hours" to add your first entry</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isManager(user?.role) && (
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Employee</th>
                )}
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Project</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Hours</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Description</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tc) => (
                <tr key={tc.id} className="hover:bg-gray-50 transition-colors">
                  {isManager(user?.role) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 text-xs font-medium">
                            {tc.user.firstName[0]}{tc.user.lastName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {tc.user.firstName} {tc.user.lastName}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tc.project.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tc.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {tc.hoursWorked}h
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {tc.description || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[tc.status]}`}>
                      {tc.status.charAt(0) + tc.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Approve/Reject for managers */}
                      {isManager(user?.role) && tc.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(tc.id)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(tc.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {/* Delete for own pending timecards */}
                      {tc.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleDelete(tc.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}