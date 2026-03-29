'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const statusColors = {
  PENDING:  'bg-yellow-50 text-yellow-700 border-yellow-100',
  APPROVED: 'bg-green-50 text-green-700 border-green-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
};

const leaveTypeColors = {
  ANNUAL:  'bg-blue-50 text-blue-700',
  SICK:    'bg-red-50 text-red-700',
  UNPAID:  'bg-gray-50 text-gray-700',
  OTHER:   'bg-purple-50 text-purple-700',
};

const isManager = (role) =>
  ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD'].includes(role);

const getDayCount = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

export default function LeavePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    startDate: '', endDate: '', type: 'ANNUAL', reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/leave');
      setRequests(res.data.requests);
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
      await api.post('/leave', form);
      setForm({ startDate: '', endDate: '', type: 'ANNUAL', reason: '' });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/leave/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Error approving request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/leave/${id}/reject`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Error rejecting request');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this leave request?')) return;
    try {
      await api.delete(`/leave/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting request');
    }
  };

  const filtered = filter === 'ALL'
    ? requests
    : requests.filter((r) => r.status === filter);

  // Stats
  const approved = requests.filter((r) => r.status === 'APPROVED').length;
  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const totalDays = requests
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + getDayCount(r.startDate, r.endDate), 0);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isManager(user?.role)
              ? 'Review and manage team leave requests'
              : 'Submit and track your leave requests'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Request leave'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Approved days</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalDays}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{requests.length}</p>
        </div>
      </div>

      {/* Request form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New leave request</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Leave type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave type</label>
              <select
                name="type" value={form.type} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ANNUAL">Annual leave</option>
                <option value="SICK">Sick leave</option>
                <option value="UNPAID">Unpaid leave</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                <input
                  name="startDate" type="date" value={form.startDate}
                  onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                <input
                  name="endDate" type="date" value={form.endDate}
                  onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Day count preview */}
            {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
              <div className="px-4 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                Duration: <span className="font-semibold">
                  {getDayCount(form.startDate, form.endDate)} day(s)
                </span>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (optional)
              </label>
              <textarea
                name="reason" value={form.reason} onChange={handleChange}
                placeholder="Provide a reason for your leave request..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit request'}
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
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Leave requests table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No leave requests found</p>
            <p className="text-sm">Click "+ Request leave" to submit one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isManager(user?.role) && (
                  <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Employee</th>
                )}
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">From</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">To</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Days</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Reason</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">

                  {/* Employee (managers only) */}
                  {isManager(user?.role) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-700 text-xs font-medium">
                            {req.user.firstName[0]}{req.user.lastName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {req.user.firstName} {req.user.lastName}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${leaveTypeColors[req.type]}`}>
                      {req.type.charAt(0) + req.type.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(req.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(req.endDate).toLocaleDateString()}
                  </td>

                  {/* Days */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {getDayCount(req.startDate, req.endDate)}d
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {req.reason || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[req.status]}`}>
                      {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {isManager(user?.role) && req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {req.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleDelete(req.id)}
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