import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  MapPin, Calendar, Gift, Loader2, ArrowLeft, Shield, MessageSquare,
} from 'lucide-react';
import { api, type Item } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const nav = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [activeImg, setActiveImg] = useState(0);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/${id}`);
      return data.data as Item;
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/claims/item/${id}`, { message: claimMessage, proofUrl });
    },
    onSuccess: () => {
      toast.success('Claim submitted! Owner will review soon.');
      setClaimOpen(false);
      setClaimMessage('');
      setProofUrl('');
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || 'Failed to submit claim');
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uiu-orange" />
      </div>
    );
  }

  if (!item) return null;

  const isLost = item.type === 'LOST';
  const isOwner = currentUser?.id === item.userId;
  const canClaim = !isOwner && item.status === 'OPEN';

  return (
    <div className="container py-6">
      <button
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mx-auto max-w-3xl">
        {/* Image gallery */}
        <div className="mb-4 overflow-hidden rounded-xl border bg-muted">
          <div className="aspect-video w-full">
            {item.images[activeImg] ? (
              <img
                src={item.images[activeImg].url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">📦</div>
            )}
          </div>
        </div>

        {item.images.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {item.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                  activeImg === i ? 'border-uiu-orange' : 'border-transparent'
                }`}
              >
                <img src={img.url} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {isLost ? t('items.lost') : t('items.found')}
            </span>
            <span className="text-xs text-muted-foreground">{item.category.name}</span>
            {item.status === 'RESOLVED' && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Resolved
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold">{item.title}</h1>

          <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">
            {item.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.building && (
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={`${item.building}${item.floor ? ', ' + item.floor : ''}${item.room ? ', ' + item.room : ''}`} />
            )}
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date"
              value={new Date(item.lostFoundDate).toLocaleDateString()}
            />
            {item.brand && <InfoRow icon={<Shield className="h-4 w-4" />} label="Brand" value={item.brand} />}
            {item.color && <InfoRow icon={<Shield className="h-4 w-4" />} label="Color" value={item.color} />}
            {item.reward && <InfoRow icon={<Gift className="h-4 w-4" />} label="Reward" value={item.reward} />}
          </div>

          {/* Actions */}
          <div className="mt-6 border-t pt-6">
            {canClaim && !claimOpen && (
              <button
                onClick={() => setClaimOpen(true)}
                className="w-full rounded-md bg-uiu-orange py-2 font-medium text-white hover:bg-uiu-orange-dark"
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                {isLost ? "I Found This" : "This Is Mine"}
              </button>
            )}

            {isOwner && (
              <p className="text-center text-sm text-muted-foreground">
                This is your item. You'll receive claims here.
              </p>
            )}

            {claimOpen && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <h3 className="font-semibold">Submit Claim</h3>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Explain why this item belongs to you..."
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
                />
                <input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Proof URL (optional — IMEI, receipt, photo link)"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => claimMutation.mutate()}
                    disabled={!claimMessage || claimMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-uiu-orange py-2 text-sm font-medium text-white hover:bg-uiu-orange-dark disabled:opacity-50"
                  >
                    {claimMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit
                  </button>
                  <button
                    onClick={() => setClaimOpen(false)}
                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}