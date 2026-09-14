import { useEffect, useRef, useState, useCallback } from 'react';
import { InlineEditProvider } from './templates/InlineEdit';
import CustomSectionsBlock from './templates/CustomSectionsBlock';
import type { CVData } from '../types/cv';

interface Props {
  children: React.ReactNode;
  innerRef: React.RefObject<HTMLDivElement | null>;
  dir: 'ltr' | 'rtl';
  footer?: React.ReactNode;
  data: CVData;
  onEdit: (path: string, value: string) => void;
}

const A4_W = 794;   // 210mm @ 96dpi
const A4_H = 1123;  // 297mm @ 96dpi

/**
 * Aperçu A4 qui se met automatiquement à l'échelle selon la largeur disponible.
 * Le noeud exporté (innerRef) garde toujours ses dimensions réelles 794×1123,
 * ce qui garantit un PDF/PNG identique quel que soit l'écran.
 */
export default function CVPreview({ children, innerRef, dir, footer, data, onEdit }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1);
  const [pageH, setPageH] = useState(A4_H);
  const [editMode, setEditMode] = useState(false);

  const recompute = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const pad = window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 32 : 56;
    const available = el.clientWidth - pad;
    setFitScale(Math.min(1, Math.max(0.2, available / A4_W)));
    const h = pageRef.current?.scrollHeight ?? A4_H;
    setPageH(Math.max(A4_H, h));
  }, []);

  useEffect(() => {
    recompute();
    const ro = new ResizeObserver(recompute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (pageRef.current) ro.observe(pageRef.current);
    window.addEventListener('resize', recompute);
    window.addEventListener('orientationchange', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
      window.removeEventListener('orientationchange', recompute);
    };
  }, [recompute, children]);

  const scale = fitScale * userZoom;
  const clamp = (z: number) => Math.min(2.5, Math.max(0.4, z));

  return (
    <div ref={wrapRef} className="w-full h-full overflow-auto scrollbar-thin">
      <div className="min-h-full flex flex-col items-center px-2 sm:px-4 py-4 sm:py-6">
        {/* Zone de scale : la hauteur réservée suit l'échelle pour éviter le vide */}
        <div
          className="relative mx-auto"
          style={{ width: A4_W * scale, height: pageH * scale }}
        >
          <div
            style={{
              width: A4_W,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <div
              ref={pageRef}
              className="bg-white shadow-2xl shadow-slate-400/30 rounded-[2px] overflow-hidden"
              style={{ width: A4_W, minHeight: A4_H }}
            >
              <div ref={innerRef} dir={dir} style={{ width: A4_W, minHeight: A4_H, background: '#fff' }}>
                <InlineEditProvider data={data} enabled={editMode} onEdit={onEdit}>
                  {children}
                  <CustomSectionsBlock data={data} />
                </InlineEditProvider>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de zoom */}
        <div className="no-print mt-3 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-200 rounded-full px-1.5 py-1 shadow-sm">
          <button
            onClick={() => setEditMode(value => !value)}
            className={`h-8 px-3 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors ${editMode ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 text-indigo-700'}`}
            aria-pressed={editMode}
            title="Modifier directement les textes visibles du CV"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m13 5 6 6M4 20l4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z" /></svg>
            {editMode ? 'Terminer' : 'Modifier'}
          </button>
          <span className="w-px h-5 bg-slate-200" />
          <button
            onClick={() => setUserZoom(z => clamp(z - 0.15))}
            className="w-8 h-8 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-600 flex items-center justify-center text-lg leading-none"
            aria-label="Dézoomer"
          >−</button>
          <button
            onClick={() => setUserZoom(1)}
            className="px-2.5 h-8 rounded-full hover:bg-slate-100 text-[11px] font-semibold text-slate-700 tabular-nums min-w-[52px]"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => setUserZoom(z => clamp(z + 0.15))}
            className="w-8 h-8 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-600 flex items-center justify-center text-lg leading-none"
            aria-label="Zoomer"
          >+</button>
        </div>

        {editMode && (
          <p className="no-print mt-2 text-[10px] text-indigo-600 font-medium text-center animate-fadeIn">
            Cliquez sur un texte souligné pour le modifier · Entrée pour valider · Échap pour annuler
          </p>
        )}

        {footer && <div className="no-print mt-2 px-4 text-center">{footer}</div>}
      </div>
    </div>
  );
}
