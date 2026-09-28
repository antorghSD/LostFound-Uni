import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, X, Upload } from 'lucide-react';
import { api, type Category } from '@/lib/api';

const schema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().min(3, 'Min 3 characters').max(200),
  description: z.string().min(10, 'Min 10 characters').max(2000),
  categoryId: z.string().min(1, 'Category required'),
  brand: z.string().optional(),
  color: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  lostFoundDate: z.string().min(1, 'Date required'),
  reward: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PostItemPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data as Category[];
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'LOST' },
  });

  const type = watch('type');

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: created } = await api.post('/items', {
        ...data,
        lostFoundDate: new Date(data.lostFoundDate).toISOString(),
      });

      // Upload images
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((img) => fd.append('images', img));
        await api.post(`/upload/items/${created.data.id}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      return created.data;
    },
    onSuccess: () => {
      toast.success('Item posted successfully!');
      qc.invalidateQueries({ queryKey: ['items'] });
      nav('/');
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || 'Failed to post item');
    },
  });

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Max 5 images');
      return;
    }
    setImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">{t('items.postItem')}</h1>

        <form
          onSubmit={handleSubmit((d) => createMutation.mutate(d))}
          className="space-y-4 rounded-xl border bg-card p-6"
        >
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3">
            {(['LOST', 'FOUND'] as const).map((v) => (
              <label
                key={v}
                className={`cursor-pointer rounded-lg border-2 p-4 text-center transition ${
                  type === v
                    ? v === 'LOST'
                      ? 'border-red-500 bg-red-50'
                      : 'border-green-500 bg-green-50'
                    : 'border-muted hover:bg-muted'
                }`}
              >
                <input {...register('type')} type="radio" value={v} className="hidden" />
                <p className="font-semibold">{v === 'LOST' ? t('items.lost') : t('items.found')}</p>
              </label>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium">{t('items.title')} *</label>
            <input
              {...register('title')}
              placeholder="e.g., Black iPhone 13"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
            />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">{t('items.description')} *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe the item, where you lost/found it, any identifying details..."
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">{t('items.category')} *</label>
            <select
              {...register('categoryId')}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
            >
              <option value="">Select category...</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Brand + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Brand</label>
              <input
                {...register('brand')}
                placeholder="Apple, Samsung..."
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <input
                {...register('color')}
                placeholder="Black, Blue..."
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">{t('items.location')}</label>
              <input
                {...register('building')}
                placeholder="Library"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Floor</label>
              <input
                {...register('floor')}
                placeholder="2nd"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Room</label>
              <input
                {...register('room')}
                placeholder="Reading Room"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
            </div>
          </div>

          {/* Date + Reward */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t('items.date')} *</label>
              <input
                {...register('lostFoundDate')}
                type="date"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
              />
              {errors.lostFoundDate && (
                <p className="mt-1 text-xs text-destructive">{errors.lostFoundDate.message}</p>
              )}
            </div>
            {type === 'LOST' && (
              <div>
                <label className="text-sm font-medium">{t('items.reward')}</label>
                <input
                  {...register('reward')}
                  placeholder="৳5000"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uiu-orange"
                />
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium">Images (max 5)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img src={p} className="h-full w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageAdd}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-uiu-orange py-2 font-medium text-white hover:bg-uiu-orange-dark disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createMutation.isPending ? 'Posting...' : t('items.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}