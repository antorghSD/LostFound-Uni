import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type Category } from '@/lib/api';

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get('/admin/categories');
      return data.data as Category[];
    },
  });

  const addMutation = useMutation({
    mutationFn: () => api.post('/admin/categories', { name, slug, icon: icon || null }),
    onSuccess: () => {
      toast.success('Category added');
      setName('');
      setSlug('');
      setIcon('');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || 'Failed to add category';
      if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
        toast.error(`"${name}" category already exists!`);
      } else {
        toast.error(msg);
      }
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/categories/${id}`, { isActive }),
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? 'Category enabled' : 'Category disabled');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || 'Failed to update');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted permanently');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || 'Failed to delete category';
      toast.error(msg, { duration: 5000 });
    },
  });

  const handleDelete = (c: Category) => {
    if (c._count.items > 0) {
      toast.error(
        `Cannot delete "${c.name}" — ${c._count.items} item(s) use it. Disable it instead.`,
        { duration: 5000 }
      );
      return;
    }
    if (confirm(`Delete "${c.name}" permanently? This cannot be undone.`)) {
      deleteMutation.mutate(c.id);
    }
  };

  return (
    <div>
      <Topbar title="Categories" />
      <div className="p-6">
        {/* Add form */}
        <div className="mb-6 rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-semibold">Add New Category</h3>
          <div className="flex flex-wrap gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (e.g., Electronics)"
              className="flex-1 min-w-[200px] rounded-md border bg-white px-3 py-2 text-sm"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug (e.g., electronics)"
              className="flex-1 min-w-[200px] rounded-md border bg-white px-3 py-2 text-sm"
            />
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Icon name (optional)"
              className="flex-1 min-w-[200px] rounded-md border bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!name || !slug || addMutation.isPending}
              className="flex items-center gap-1 rounded-md bg-uiu-orange px-4 py-2 text-sm font-medium text-white hover:bg-uiu-orange-dark disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                    <td className="px-4 py-3 text-xs">{c._count.items}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          c.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            toggleActiveMutation.mutate({ id: c.id, isActive: !c.isActive })
                          }
                          className={`rounded p-1.5 ${
                            c.isActive
                              ? 'text-gray-600 hover:bg-gray-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={c.isActive ? 'Disable' : 'Enable'}
                        >
                          {c.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
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
    </div>
  );
}