import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Search, Shield,  Ban, CheckCircle } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api, type AdminUserRow } from '@/lib/api';

export default function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', q, roleFilter],
    queryFn: async () => {
      const params: any = {};
      if (q) params.q = q;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/admin/users', { params });
      return data.data as AdminUserRow[];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/verify`),
    onSuccess: () => {
      toast.success('User verified');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) =>
      api.patch(`/admin/users/${id}/ban`, { ban }),
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div>
      <Topbar title="Users" />
      <div className="p-6">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-md border bg-white py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
            <option value="SECURITY_OFFICER">Security Officer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Dept.</th>
                  <th className="px-4 py-3 font-medium">Stats</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                        className="rounded border bg-white px-2 py-1 text-xs"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="STAFF">STAFF</option>
                        <option value="SECURITY_OFFICER">SECURITY_OFFICER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.department || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u._count.items} items · {u._count.claims} claims
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.isVerified && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                            ✓ Verified
                          </span>
                        )}
                        {u.isBanned && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {!u.isVerified && (
                          <button
                            onClick={() => verifyMutation.mutate(u.id)}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50"
                            title="Verify"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => banMutation.mutate({ id: u.id, ban: !u.isBanned })}
                          className={`rounded p-1.5 hover:bg-muted ${
                            u.isBanned ? 'text-green-600' : 'text-red-600'
                          }`}
                          title={u.isBanned ? 'Unban' : 'Ban'}
                        >
                          {u.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                      </div>
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