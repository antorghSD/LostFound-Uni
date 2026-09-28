import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Item } from '@/lib/api';

interface Props {
  item: Item;
}

export default function ItemCard({ item }: Props) {
  const { t } = useTranslation();
  const isLost = item.type === 'LOST';

  return (
    <Link
      to={`/item/${item.id}`}
      className="group flex gap-3 overflow-hidden rounded-xl border bg-card p-3 transition hover:shadow-md"
    >
      {/* Image */}
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {item.images[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="text-3xl">{item.category.icon === 'laptop' ? '💻' : '📦'}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {isLost ? t('items.lost') : t('items.found')}
          </span>
          <span className="text-xs text-muted-foreground">{item.category.name}</span>
        </div>

        <h3 className="mt-1 line-clamp-1 font-semibold">{item.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-2 text-xs text-muted-foreground">
          {item.building && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.building}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(item.lostFoundDate).toLocaleDateString()}
          </span>
          {item.reward && (
            <span className="flex items-center gap-1 text-uiu-orange">
              <Gift className="h-3 w-3" />
              {item.reward}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}