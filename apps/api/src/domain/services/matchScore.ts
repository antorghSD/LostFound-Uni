interface ItemForMatch {
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  categoryId: string;
  brand?: string | null;
  color?: string | null;
  building?: string | null;
  lostFoundDate: Date;
}

export function scoreMatch(a: ItemForMatch, b: ItemForMatch): { score: number; signals: any } {
  if (a.type === b.type) return { score: 0, signals: {} };

  const signals: any = {};

  // Text (40%)
  const text = textSimilarity(`${a.title} ${a.description}`, `${b.title} ${b.description}`);
  signals.text = text;

  // Category (25%)
  signals.category = a.categoryId === b.categoryId ? 1 : 0;

  // Brand (10%)
  signals.brand = a.brand && b.brand && a.brand.toLowerCase() === b.brand.toLowerCase() ? 1 : 0;

  // Color (10%)
  signals.color = a.color && b.color && a.color.toLowerCase() === b.color.toLowerCase() ? 1 : 0;

  // Location (10%)
  signals.location = a.building && b.building && a.building.toLowerCase() === b.building.toLowerCase() ? 1 : 0;

  // Date proximity (5%)
  const days = Math.abs((a.lostFoundDate.getTime() - b.lostFoundDate.getTime()) / 86400000);
  signals.date = Math.max(0, 1 - days / 30);

  const score =
    text * 0.4 +
    signals.category * 0.25 +
    signals.brand * 0.1 +
    signals.color * 0.1 +
    signals.location * 0.1 +
    signals.date * 0.05;

  return { score: Number(score.toFixed(3)), signals };
}

function textSimilarity(a: string, b: string): number {
  const wa = new Set(tokenize(a));
  const wb = new Set(tokenize(b));
  const inter = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union === 0 ? 0 : inter / union;
}

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
}