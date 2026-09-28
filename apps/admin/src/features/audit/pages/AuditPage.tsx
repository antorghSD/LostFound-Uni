import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type AuditLogRow } from '@/lib/api';

export default function AuditPage() {
  const [q, setQ] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit', q],
    queryFn: async () => {
      const { data } = await api.get('/admin/audit-logs', { params: q ? { q } : {} });
      return data.data as AuditLogRow[];
    },
  });

  return (
    <div>
      <Topbar title="Audit Logs" />
      <div className="p-6">
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by action (e.g., auth.login)..."
            className="w-full rounded-md border bg-white py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
          />
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {l.actor ? (
                        <>
                          <p className="font-medium">{l.actor.name}</p>
                          <p className="text-muted-foreground">{l.actor.email}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">{l.action}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {l.targetType && `${l.targetType}:${l.targetId?.slice(0, 8)}...`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}