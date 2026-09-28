import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type AdminClaimRow } from '@/lib/api';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  DISPUTED: 'bg-purple-100 text-purple-700',
};

export default function ClaimsPage() {
  const qc = useQueryClient();

  const { data: claims, isLoading } = useQuery({
    queryKey: ['admin-claims'],
    queryFn: async () => {
      const { data } = await api.get('/admin/claims');
      return data.data as AdminClaimRow[];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/claims/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Claim updated');
      qc.invalidateQueries({ queryKey: ['admin-claims'] });
    },
  });

  return (
    <div>
      <Topbar title="Claims Review" />
      <div className="p-6">
        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Claimant</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {claims?.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.item.title}</td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium">{c.claimant.name}</p>
                      <p className="text-muted-foreground">{c.claimant.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium">{c.owner.name}</p>
                      <p className="text-muted-foreground">{c.owner.email}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-xs text-muted-foreground">{c.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          statusColors[c.status] || 'bg-gray-100'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={c.status}
                        onChange={(e) => statusMutation.mutate({ id: c.id, status: e.target.value })}
                        className="rounded border bg-white px-2 py-1 text-xs"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_REVIEW">IN_REVIEW</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="DISPUTED">DISPUTED</option>
                      </select>
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