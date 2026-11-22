'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, CheckCircle, XCircle, Search, UserPlus, ToggleLeft } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

function getUserDisplayName(u: any): string {
  if (u.facultyProfile?.firstName) {
    return `${u.facultyProfile.firstName} ${u.facultyProfile.lastName ?? ''}`.trim();
  }
  if (u.studentProfile?.firstName) {
    return `${u.studentProfile.firstName} ${u.studentProfile.lastName ?? ''}`.trim();
  }
  return u.email.split('@')[0];
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', { search: searchTerm, role: roleFilter }],
    queryFn: async () => {
      const res = await apiClient.get('/users', {
        params: {
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          search: searchTerm || undefined,
          limit: 50,
        },
      });
      return res.data;
    },
    staleTime: 1000 * 30,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (userId: string) => apiClient.patch(`/users/${userId}/toggle-active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Account status updated');
    },
    onError: () => toast.error('Failed to update account status'),
  });

  const users: any[] = Array.isArray(usersData)
    ? usersData
    : usersData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Academic User Directory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage anatomy faculty appointments, demonstrator rights, and enrolled medical students.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Users className="w-4 h-4" />
          <span>{users.length} account{users.length !== 1 ? 's' : ''} shown</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by institutional email..."
            className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-300 text-xs">
          {['ALL', 'FACULTY', 'STUDENT'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                roleFilter === role
                  ? 'bg-navy-800 text-white'
                  : 'text-gray-600 hover:text-navy-900'
              }`}
            >
              {role === 'ALL' ? 'All Accounts' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-6">Name</th>
              <th className="py-3.5 px-6">Institutional Email</th>
              <th className="py-3.5 px-6">Role</th>
              <th className="py-3.5 px-6">Department / ID</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Loading user accounts...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No accounts found matching search criteria.
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    {getUserDisplayName(u)}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{u.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'FACULTY'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500">
                    {u.facultyProfile?.department?.name ||
                      u.studentProfile?.studentId ||
                      '—'}
                  </td>
                  <td className="py-4 px-6">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-red-500" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => toggleActiveMutation.mutate(u.id)}
                      disabled={toggleActiveMutation.isPending}
                      title={u.isActive ? 'Deactivate account' : 'Activate account'}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <ToggleLeft className="w-3.5 h-3.5" />
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
