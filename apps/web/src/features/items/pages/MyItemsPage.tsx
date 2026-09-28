import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Package, Trash2, Loader2, Plus } from 'lucide-react';
import { api, type Item } from '@/lib/api';

export default function MyItemsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['my-items'],
    queryFn: async () => {
      const { data } = await api.get('/items/mine');
      return data.data as Item[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/items/${id}`);
    },
    onSuccess: () => {
      toast.success('Item deleted');
      qc.invalidateQueries({ queryKey: ['my-items'] });
      qc.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to delete'),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uiu-orange" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.myItems')}</h1>
        <Link
          to="/post"
          className="inline-flex items-center gap-1 rounded-md bg-uiu-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-uiu-orange-dark"
        >
          <Plus className="h-4 w-4" />
          New
        </Link>
      </div>

      {!items || items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">You haven't posted any items yet</p>
          <Link
            to="/post"
            className="mt-4 inline-block rounded-md bg-uiu-orange px-4 py-2 text-sm text-white hover:bg-uiu-orange-dark"
          >
            Post your first item
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl border bg-card p-3">
              <Link
                to={`/item/${item.id}`}
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
              >
                {item.images[0] ? (
                  <img src={item.images[0].url} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.type === 'LOST'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.category.name}</span>
                </div>
                <Link to={`/item/${item.id}`} className="mt-1 line-clamp-1 font-semibold hover:text-uiu-orange">
                  {item.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()} · Status: {item.status}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Delete this item?')) deleteMutation.mutate(item.id);
                }}
                className="self-start rounded-md p-2 text-destructive hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}