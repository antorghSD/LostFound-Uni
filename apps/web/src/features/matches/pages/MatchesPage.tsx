import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function MatchesPage() {
  const { itemId } = useParams<{ itemId: string }>();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', itemId],
    queryFn: async () => {
      const { data } = await api.get(`/matches/item/${itemId}`);
      return data.data as any[];
    },
  });

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-uiu-orange" />
            Potential Matches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These items may be related to yours based on our matching algorithm.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-uiu-orange" />
          </div>
        ) : !matches || matches.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <Sparkles className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No matches found yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const other = m.lostItem.id === itemId ? m.foundItem : m.lostItem;
              const confidence = Math.round(m.score * 100);
              return (
                <div key={m.id} className="rounded-xl border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-uiu-orange">
                      {confidence}% match
                    </span>
                  </div>
                  <Link to={`/item/${other.id}`} className="flex gap-3 hover:opacity-80">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {other.images[0] ? (
                        <img src={other.images[0].url} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{other.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {other.description}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}