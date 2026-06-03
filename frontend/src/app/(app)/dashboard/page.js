'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const modules = [
  { name: 'HR / Employees', desc: 'Manage your team', href: '/hr', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { name: 'Projects', desc: 'Track active projects', href: '/projects', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { name: 'TimeCard', desc: 'Log and approve hours', href: '/timecard', color: 'bg-green-50 text-green-700 border-green-100' },
  { name: 'Leave', desc: 'Manage leave requests', href: '/leave', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { name: 'Finance', desc: 'Budgets and expenses', href: '/finance', color: 'bg-red-50 text-red-700 border-red-100' },
  { name: 'Reports', desc: 'Analytics and insights', href: '/reports', color: 'bg-gray-50 text-gray-700 border-gray-200' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening in your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 border ${module.color}`}>
              {module.name}
            </div>
            <p className="text-sm text-gray-500">{module.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 
