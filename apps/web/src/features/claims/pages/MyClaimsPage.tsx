import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Check, X, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { api, type Claim } from '@/lib/api';

export default function MyClaimsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  // 🆕 Edit modal state
  const [editing, setEditing] = useState<Claim | null>(null);
  const [editMessage, setEditMessage] = useState('');

  // 🆕 Delete confirm state
  const [confirmDelete, setConfirmDelete] = useState<Claim | null>(null);

  const { data: received, isLoading: loadingR } = useQuery({
    queryKey: ['claims-on-my-items'],
    queryFn: async () => {
      const { data } = await api.get('/claims/on-my-items');
      return data.data as Claim[];
    },
  });

  const { data: sent, isLoading: loadingS } = useQuery({
    queryKey: ['my-claims'],
    queryFn: async () => {
      const { data } = await api.get('/claims/mine');
      return data.data as Claim[];
    },
  });

  // Owner: approve/reject → /:id/status
  const decideMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      await api.patch(`/claims/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Claim updated');
      qc.invalidateQueries({ queryKey: ['claims-on-my-items'] });
      qc.invalidateQueries({ queryKey: ['my-claims'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed'),
  });

  // 🆕 Claimant: edit message
  const editMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      await api.patch(`/claims/${id}`, { message });
    },
    onSuccess: () => {
      toast.success('Claim updated');
      setEditing(null);
      qc.invalidateQueries({ queryKey: ['my-claims'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed'),
  });

  // 🆕 Claimant: withdraw/delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/claims/${id}`);
    },
    onSuccess: () => {
      toast.success('Claim withdrawn — you can submit a new one');
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ['my-claims'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const items = tab === 'received' ? received : sent;
  const isLoading = tab === 'received' ? loadingR : loadingS;

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('nav.claims')}</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab('received')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            tab === 'received'
              ? 'bg-uiu-orange text-white'
              : 'border bg-background hover:bg-muted'
          }`}
        >
          Received ({received?.length || 0})
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            tab === 'sent'
              ? 'bg-uiu-orange text-white'
              : 'border bg-background hover:bg-muted'
          }`}
        >
          My Claims ({sent?.length || 0})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-uiu-orange" />
        </div>
      ) : !items || items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">No claims yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((claim) => (
            <div key={claim.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        claim.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : claim.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {claim.status}
                    </span>
                    {claim.item && (
                      <Link
                        to={`/item/${claim.item.id}`}
                        className="text-sm font-medium hover:text-uiu-orange"
                      >
                        {claim.item.title}
                      </Link>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                    {claim.message}
                  </p>
                  {claim.claimant && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      By: {claim.claimant.name}
                    </p>
                  )}
                  {claim.owner && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      To: {claim.owner.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/claims/${claim.id}`}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  <MessageCircle className="h-3 w-3" />
                  Chat
                </Link>

                {/* 🟢 Received tab — Owner actions */}
                {tab === 'received' && claim.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() =>
                        decideMutation.mutate({ id: claim.id, status: 'APPROVED' })
                      }
                      className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        decideMutation.mutate({ id: claim.id, status: 'REJECTED' })
                      }
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </button>
                  </>
                )}

                {/* 🆕 Sent tab — Claimant actions (PENDING only) */}
                {tab === 'sent' && claim.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(claim);
                        setEditMessage(claim.message || '');
                      }}
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(claim)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Withdraw
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🆕 Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Edit Claim</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Update your message for this claim
            </p>
            <textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              placeholder="Explain why this item is yours..."
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  editMutation.mutate({ id: editing.id, message: editMessage })
                }
                disabled={editMutation.isPending || !editMessage.trim()}
                className="flex items-center gap-2 rounded-md bg-uiu-orange px-4 py-2 text-sm text-white hover:bg-uiu-orange/90 disabled:opacity-50"
              >
                {editMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Withdraw Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Withdraw claim?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently remove your claim. You can submit a new one
              afterward.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}