import { CVData, COLOR_MAP } from '../../types/cv';
import { getLabels, formatCVDate } from '../../i18n/labels';

export function useTemplateBase(data: CVData, dateStyle: 'short' | 'long' = 'short') {
  const colors = COLOR_MAP[data.color];
  const { options } = data;

  const fontClass = { sans: 'font-sans', serif: 'font-serif', mono: 'font-mono' }[options.fontFamily];
  const sizeClass = {
    sm: 'text-[10px] leading-snug',
    md: 'text-[11px] leading-relaxed',
    lg: 'text-[12px] leading-relaxed',
  }[options.fontSize];
  const gap = { compact: 12, normal: 16, relaxed: 22 }[options.spacing];

  const t = getLabels(data.language);
  const formatDate = (d: string) => formatCVDate(d, data.language, dateStyle);
  const range = (start: string, end: string, current: boolean) =>
    `${formatDate(start)} — ${current ? t.present : formatDate(end)}`;

  return { colors, fontClass, sizeClass, gap, t, formatDate, range };
}

/** Convertit #rrggbb en rgba(...) avec alpha. */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Mélange une couleur vers le blanc (t=0 couleur, t=1 blanc). */
export function tint(hex: string, t: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const m = (v: number) => Math.round(v + (255 - v) * t);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

/** Mélange une couleur vers le noir (t=0 couleur, t=1 noir). */
export function shade(hex: string, t: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const m = (v: number) => Math.round(v * (1 - t));
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

/** Nombre total d'années d'expérience (pour les modèles infographiques). */
export function totalYears(data: CVData): number {
  const now = new Date().getFullYear();
  let total = 0;
  for (const e of data.experiences) {
    const a = parseInt((e.startDate || '').slice(0, 4));
    if (!a) continue;
    const b = e.current ? now : parseInt((e.endDate || '').slice(0, 4)) || a;
    total += Math.max(0, b - a);
  }
  return total;
}

export const levelPercent = (level: number) => Math.max(0, Math.min(100, (level / 5) * 100));

export const LANG_LEVEL_VALUE: Record<string, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 4.5, C2: 5, Natif: 5,
};
