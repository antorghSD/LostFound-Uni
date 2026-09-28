import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type Location } from '@/lib/api';

export default function LocationsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');

  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data } = await api.get('/admin/locations');
      return data.data as Location[];
    },
  });

  const addMutation = useMutation({
    mutationFn: () => api.post('/admin/locations', { name, building, room }),
    onSuccess: () => {
      toast.success('Location added');
      setName('');
      setBuilding('');
      setRoom('');
      qc.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || 'Failed to add location');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/locations/${id}`, { isActive }),
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? 'Location enabled' : 'Location disabled');
      qc.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || 'Failed to update');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/locations/${id}`),
    onSuccess: () => {
      toast.success('Location deleted permanently');
      qc.invalidateQueries({ queryKey: ['admin-locations'] });
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || 'Failed to delete location';
      toast.error(msg, { duration: 5000 });
    },
  });

  const handleDelete = (loc: Location) => {
    if (confirm(`Delete "${loc.name}" permanently? This cannot be undone.`)) {
      deleteMutation.mutate(loc.id);
    }
  };

  return (
    <div>
      <Topbar title="Handover Locations" />
      <div className="p-6">
        {/* Add form */}
        <div className="mb-6 rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-semibold">Add New Location</h3>
          <div className="flex flex-wrap gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (e.g., Library Front Desk)"
              className="flex-1 min-w-[200px] rounded-md border bg-white px-3 py-2 text-sm"
            />
            <input
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="Building"
              className="w-40 rounded-md border bg-white px-3 py-2 text-sm"
            />
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room"
              className="w-32 rounded-md border bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={() => addMutation.mutate()}
              disabled={!name || addMutation.isPending}
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locations?.map((l) => (
              <div key={l.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.building} {l.room && `· ${l.room}`}
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        l.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {l.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({ id: l.id, isActive: !l.isActive })
                      }
                      className={`rounded p-1.5 ${
                        l.isActive
                          ? 'text-gray-600 hover:bg-gray-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={l.isActive ? 'Disable' : 'Enable'}
                    >
                      {l.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(l)}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}