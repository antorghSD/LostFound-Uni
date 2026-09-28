import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Search, Trash2, ExternalLink, PackageOpen } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type AdminItemRow } from '@/lib/api';

export default function ItemsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-items', q],
    queryFn: async () => {
      const { data } = await api.get('/admin/items', { params: q ? { q } : {} });
      return data.data as AdminItemRow[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/items/${id}`),
    onSuccess: () => {
      toast.success('Item deleted permanently');
      qc.invalidateQueries({ queryKey: ['admin-items'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || 'Failed to delete item';
      toast.error(msg, { duration: 6000 });
    },
  });

  const handleDelete = (item: AdminItemRow) => {
    if (item._count.claims > 0) {
      toast.error(
        `Cannot delete — ${item._count.claims} claim(s) exist on this item. Resolve or reject claims first.`,
        { duration: 6000 }
      );
      return;
    }
    if (confirm(`Delete "${item.title}" permanently? This cannot be undone.`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Items Moderation" />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 sm:p-6">
          {/* Search */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full rounded-lg border border-border/60 bg-card py-2 pl-10 pr-3 text-sm focus:border-uiu-orange/50 focus:outline-none focus:ring-2 focus:ring-uiu-orange/20"
              />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {items?.length || 0} item(s)
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PackageOpen className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Claims</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr
                        key={it.id}
                        className="border-t border-border/40 transition hover:bg-muted/30"
                      >
                        <td className="max-w-xs px-4 py-3">
                          <p className="truncate font-medium">{it.title}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {it.description}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              it.type === 'LOST'
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                            }`}
                          >
                            {it.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{it.category.name}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{it.user.name}</p>
                          <p className="text-xs text-muted-foreground">{it.user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              it.status === 'OPEN'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                : it.status === 'RESOLVED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400'
                            }`}
                          >
                            {it.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {it._count.claims > 0 ? (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                              {it._count.claims}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <a
                              href={`http://localhost:5173/item/${it.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              title="View on student app"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(it)}
                              className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                              title="Delete permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info note */}
          <p className="mt-4 text-xs text-muted-foreground">
            💡 Items with claims cannot be deleted. Reject claims first, then delete the item.
          </p>
        </div>
      </div>
    </div>
  );
}