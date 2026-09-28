import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type AdminReportRow } from '@/lib/api';

export default function ReportsPage() {
  const qc = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await api.get('/admin/reports');
      return data.data as AdminReportRow[];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/reports/${id}`, { status }),
    onSuccess: () => {
      toast.success('Report updated');
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  return (
    <div>
      <Topbar title="Reports Queue" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
          </div>
        ) : reports?.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">No reports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports?.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        {r.targetType}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.status}</span>
                    </div>
                    <p className="mt-2 font-semibold">{r.reason}</p>
                    {r.details && (
                      <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      By {r.reporter.name} ({r.reporter.email}) ·{' '}
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <select
                    value={r.status}
                    onChange={(e) => statusMutation.mutate({ id: r.id, status: e.target.value })}
                    className="rounded border bg-white px-3 py-1.5 text-xs"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}