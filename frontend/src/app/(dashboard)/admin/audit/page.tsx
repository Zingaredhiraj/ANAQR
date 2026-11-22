'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Search,
  Filter,
  Trash2,
  Download,
  RefreshCw,
  Shield,
  Activity,
  Layers,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Laptop,
  Smartphone,
  Globe,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export default function AdminAuditLogsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Fetch audit logs
  const { data: auditData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/audit-logs', { params: { limit: 100 } });
        return res.data;
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
        return { data: [], meta: { total: 0 } };
      }
    },
  });

  // Clear audit logs mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete('/audit-logs');
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Audit logs cleared successfully');
      setIsClearModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to clear audit logs');
    },
  });

  const rawLogs: AuditLogItem[] = useMemo(() => {
    if (!auditData) return [];
    if (Array.isArray(auditData)) return auditData;
    if (Array.isArray(auditData.data)) return auditData.data;
    return [];
  }, [auditData]);

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        log.entity.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        (log.user?.email && log.user.email.toLowerCase().includes(searchLower)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(searchLower)) ||
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchLower));

      return matchesAction && matchesEntity && matchesSearch;
    });
  }, [rawLogs, actionFilter, entityFilter, searchTerm]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = rawLogs.length;
    const authCount = rawLogs.filter((l) => ['LOGIN', 'LOGOUT'].includes(l.action)).length;
    const contentCount = rawLogs.filter((l) =>
      ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH'].includes(l.action)
    ).length;
    const interactiveCount = rawLogs.filter((l) =>
      ['SCAN', 'ATTEMPT_QUIZ'].includes(l.action)
    ).length;
    return { total, authCount, contentCount, interactiveCount };
  }, [rawLogs]);

  // Action badge styling
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'PUBLISH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'LOGIN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'LOGOUT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SCAN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ATTEMPT_QUIZ':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'User Email', 'Role', 'IP Address', 'Metadata'];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.action,
      l.entity,
      l.entityId || '',
      l.user?.email || 'System',
      l.user?.role || 'SYSTEM',
      l.ipAddress || '',
      JSON.stringify(l.metadata || {}).replace(/"/g, '""'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((f) => `"${f}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `anatoscan_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit log export downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-gray-900">Institutional Audit & Forensic Logs</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 max-w-2xl">
            Real-time, compliant activity trail recording administrative authorizations, curriculum revisions,
            QR code generations, and mobile learner scan telemetry.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            disabled={rawLogs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Clear Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Recorded Events</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            <span className="text-[11px] text-gray-400 mt-0.5 inline-block">Active institutional trail</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Security & Auth Events</p>
            <h3 className="text-2xl font-bold text-indigo-700 mt-1">{stats.authCount}</h3>
            <span className="text-[11px] text-gray-400 mt-0.5 inline-block">Logins & sessions</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Curriculum & Edits</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.contentCount}</h3>
            <span className="text-[11px] text-gray-400 mt-0.5 inline-block">Anatomical modifications</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Scans & Assessments</p>
            <h3 className="text-2xl font-bold text-purple-700 mt-1">{stats.interactiveCount}</h3>
            <span className="text-[11px] text-gray-400 mt-0.5 inline-block">AR Placard telemetry</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, entity, user email, or IP address..."
            className="w-full text-xs border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Action Filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="ALL">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="PUBLISH">PUBLISH</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="SCAN">SCAN</option>
          <option value="ATTEMPT_QUIZ">ATTEMPT_QUIZ</option>
        </select>

        {/* Entity Filter */}
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="text-xs border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="ALL">All Entities</option>
          <option value="Organ">Organ</option>
          <option value="User">User</option>
          <option value="QRCode">QRCode</option>
          <option value="Quiz">Quiz</option>
          <option value="Auth">Auth</option>
          <option value="OrganContent">OrganContent</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">Retrieving institutional audit stream...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-500">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">No Audit Logs Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {rawLogs.length === 0
                ? 'The audit log repository is currently empty. Actions taken by administrators, faculty, and students will appear here.'
                : 'No logs match your active filter criteria. Try resetting search filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">User / Operator</th>
                  <th className="py-3 px-4">Client / Network</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedRowId === log.id;
                  const dateObj = new Date(log.createdAt);
                  const isMobile = log.userAgent?.toLowerCase().includes('iphone') || log.userAgent?.toLowerCase().includes('android');

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/60 transition">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-600">
                          <div className="font-medium text-gray-900">{dateObj.toLocaleDateString()}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{dateObj.toLocaleTimeString()}</div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${getActionBadgeClass(
                              log.action
                            )}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">{log.entity}</span>
                          {log.entityId && (
                            <span className="block text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={log.entityId}>
                              ID: {log.entityId.slice(0, 8)}...
                            </span>
                          )}
                        </td>

                        {/* User / Operator */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.user ? (
                            <div>
                              <span className="font-medium text-gray-900 block">{log.user.email}</span>
                              <span className="inline-block text-[10px] font-semibold text-slate-500 uppercase">
                                {log.user.role}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">System / Anonymous</span>
                          )}
                        </td>

                        {/* Client / IP */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <span>{log.ipAddress || '127.0.0.1'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]" title={log.userAgent || 'Unknown'}>
                            {isMobile ? <Smartphone className="w-3 h-3 shrink-0" /> : <Laptop className="w-3 h-3 shrink-0" />}
                            <span className="truncate">{log.userAgent ? log.userAgent.split(' ')[0] : 'Browser client'}</span>
                          </div>
                        </td>

                        {/* Details Toggle */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            <span>{isExpanded ? 'Hide' : 'Payload'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON Metadata Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-gray-100">
                          <td colSpan={6} className="p-4">
                            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-[11px] font-mono shadow-inner overflow-x-auto">
                              <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-2 mb-2">
                                <span>Payload Metadata – Event ID: {log.id}</span>
                                <span className="text-slate-500">Entity: {log.entity}</span>
                              </div>
                              <pre className="whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(
                                  {
                                    action: log.action,
                                    entity: log.entity,
                                    entityId: log.entityId,
                                    ipAddress: log.ipAddress,
                                    userAgent: log.userAgent,
                                    metadata: log.metadata,
                                    createdAt: log.createdAt,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/60 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong className="text-gray-900">{filteredLogs.length}</strong> of{' '}
            <strong className="text-gray-900">{rawLogs.length}</strong> logs
          </span>
          <span className="text-[11px] text-gray-400">Institutional Compliance Standard • ISO 27001 Aligned</span>
        </div>
      </div>

      {/* Confirmation Modal: Clear Audit Logs */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">Clear Institutional Audit Logs?</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              This action will permanently delete all recorded audit logs ({rawLogs.length} records) from the database.
              This operation cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsClearModalOpen(false)}
                disabled={clearMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {clearMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing Logs...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Clear All Logs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
