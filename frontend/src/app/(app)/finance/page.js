'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const canManage = (role) =>
  ['SUPER_ADMIN', 'FINANCE_OFFICER', 'PROJECT_MANAGER'].includes(role);

export default function FinancePage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterProject, setFilterProject] = useState('ALL');

  const [form, setForm] = useState({
    projectId: '', title: '', amount: '', date: '', description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, projRes, sumRes] = await Promise.all([
        api.get('/finance/expenses'),
        api.get('/projects'),
        api.get('/finance/summary'),
      ]);
      setExpenses(expRes.data.expenses);
      setProjects(projRes.data.projects);
      setSummary(sumRes.data);
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
      await api.post('/finance/expenses', form);
      setForm({ projectId: '', title: '', amount: '', date: '', description: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/finance/expenses/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting expense');
    }
  };

  const filteredExpenses = filterProject === 'ALL'
    ? expenses
    : expenses.filter((e) => e.projectId === filterProject);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-500 mt-1 text-sm">Track budgets and expenses across projects</p>
        </div>
        {canManage(user?.role) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Log expense'}
          </button>
        )}
      </div>

      {/* Top stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total budget</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${summary.totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total spent</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              ${summary.totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Remaining</p>
            <p className={`text-3xl font-bold mt-1 ${
              summary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${summary.totalRemaining.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Add expense form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Log new expense</h2>

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

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title" value={form.title} onChange={handleChange}
                  required placeholder="e.g. Software licenses"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  name="amount" type="number" step="0.01" min="0"
                  value={form.amount} onChange={handleChange}
                  required placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="More details about this expense..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Saving...' : 'Log expense'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {['overview', 'expenses'].map((tab) => (
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

      {/* Overview tab — budget per project */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-4">
          {summary.summary.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <p>No projects found</p>
            </div>
          ) : (
            summary.summary.map((item) => (
              <div key={item.projectId} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.projectName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.expenseCount} expense{item.expenseCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${item.totalSpent.toLocaleString()}
                      {item.budget > 0 && (
                        <span className="text-gray-400 font-normal">
                          {' '}/ ${item.budget.toLocaleString()}
                        </span>
                      )}
                    </p>
                    {item.burnRate !== null && (
                      <p className={`text-xs mt-0.5 font-medium ${
                        item.burnRate > 90 ? 'text-red-600' :
                        item.burnRate > 70 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.burnRate}% used
                      </p>
                    )}
                  </div>
                </div>

                {/* Budget progress bar */}
                {item.budget > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.burnRate > 90 ? 'bg-red-500' :
                        item.burnRate > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.burnRate, 100)}%` }}
                    />
                  </div>
                )}

                {item.budget === 0 && (
                  <p className="text-xs text-gray-400">No budget set for this project</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Expenses tab */}
      {activeTab === 'expenses' && (
        <>
          {/* Project filter */}
          <div className="mb-4">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg mb-1">No expenses found</p>
                <p className="text-sm">Log an expense using the button above</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Title</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Project</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Description</th>
                    {canManage(user?.role) && (
                      <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {exp.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {exp.project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          ${exp.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {exp.description || '—'}
                      </td>
                      {canManage(user?.role) && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}