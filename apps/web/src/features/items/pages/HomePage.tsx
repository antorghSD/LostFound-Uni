import { useState, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Loader2, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type Item, type Category } from '@/lib/api';
import ItemCard from '@/components/ItemCard';

type FilterType = 'all' | 'LOST' | 'FOUND';

export default function HomePage() {
  const { t } = useTranslation();
  const [type, setType] = useState<FilterType>('all');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(timer);
  }, [q]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data as Category[];
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['items', type, debouncedQ, categoryId],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: 20 };
      if (type !== 'all') params.type = type;
      if (debouncedQ) params.q = debouncedQ;
      if (categoryId) params.categoryId = categoryId;
      if (pageParam) params.cursor = pageParam;
      const { data } = await api.get('/items', { params });
      return data as { data: Item[]; nextCursor: string | null; hasMore: boolean };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
  });

  const items = data?.pages.flatMap((p) => p.data) || [];

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="container py-8">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-uiu-navy dark:text-white">
          {t('app.name')}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('app.tagline')}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('items.search')}
              className="w-full rounded-md border bg-background py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'LOST', 'FOUND'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setType(v)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  type === v
                    ? 'bg-uiu-orange text-white'
                    : 'border bg-background hover:bg-muted'
                }`}
              >
                {v === 'all' ? t('items.all') : v === 'LOST' ? t('items.lost') : t('items.found')}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryId('')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                !categoryId ? 'bg-uiu-orange text-white' : 'border bg-background hover:bg-muted'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  categoryId === c.id
                    ? 'bg-uiu-orange text-white'
                    : 'border bg-background hover:bg-muted'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <PackageOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('items.noItems')}</p>
          <Link
            to="/post"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-uiu-orange px-4 py-2 text-sm font-medium text-white hover:bg-uiu-orange-dark"
          >
            <Plus className="h-4 w-4" />
            {t('items.postItem')}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-uiu-orange" />
            </div>
          )}

          {!hasNextPage && items.length > 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You've seen all items
            </p>
          )}
        </>
      )}
    </div>
  );
}