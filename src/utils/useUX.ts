import { useCallback, useEffect, useRef, useState } from 'react';
import type { CVData } from '../types/cv';

/**
 * Expérience utilisateur (Priorité 7) :
 * - Sauvegarde automatique + historique (snapshots)
 * - Undo / Redo (Ctrl+Z / Ctrl+Y) et raccourcis clavier
 * - Mode sombre
 * - Barre de progression du CV
 */

const HISTORY_KEY = 'cv_builder_history_v1';
const HISTORY_LIMIT = 30;

export function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('cv_builder_dark') === '1');
  useEffect(() => {
    localStorage.setItem('cv_builder_dark', dark ? '1' : '0');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return { dark, toggleDark: () => setDark(d => !d) };
}

export function useHistory(data: CVData) {
  const stackRef = useRef<CVData[]>([]);
  const indexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sync = () => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < stackRef.current.length - 1);
  };

  // Chargement de l'historique persisté
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CVData[];
        if (Array.isArray(parsed) && parsed.length) {
          stackRef.current = parsed.slice(-HISTORY_LIMIT);
          indexRef.current = stackRef.current.length - 1;
          sync();
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Empilement des états (sauvegarde auto + historique)
  useEffect(() => {
    const stack = stackRef.current;
    const current = stack[indexRef.current];
    if (current === data) return;
    if (JSON.stringify(current) === JSON.stringify(data)) return;
    stackRef.current = [...stack.slice(0, indexRef.current + 1), data].slice(-HISTORY_LIMIT);
    indexRef.current = stackRef.current.length - 1;
    sync();
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(stackRef.current)); } catch { /* quota */ }
  }, [data]);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      sync();
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(stackRef.current)); } catch { /* quota */ }
      return stackRef.current[indexRef.current];
    }
    return null;
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < stackRef.current.length - 1) {
      indexRef.current += 1;
      sync();
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(stackRef.current)); } catch { /* quota */ }
      return stackRef.current[indexRef.current];
    }
    return null;
  }, []);

  return { undo, redo, canUndo, canRedo };
}

/** Raccourcis clavier globaux. */
export function useShortcuts(handlers: Record<string, () => void>, dark: boolean) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '') || target?.isContentEditable;
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); handlers.undo?.(); return; }
      if ((ctrl && e.key.toLowerCase() === 'y') || (ctrl && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); handlers.redo?.(); return; }
      if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); handlers.save?.(); return; }
      if (ctrl && e.key.toLowerCase() === 'p') { e.preventDefault(); handlers.print?.(); return; }
      if (ctrl && e.key.toLowerCase() === 'd' && !typing) { e.preventDefault(); handlers.duplicate?.(); return; }
      if (e.key === 'F1') { e.preventDefault(); handlers.help?.(); return; }
      if (typing) return;
      if (e.key.toLowerCase() === 'd') handlers.dark?.();
      if (e.key === 'Escape') handlers.escape?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers, dark]);
}

/** Barre de progression : complétude du CV. */
export function cvProgress(data: CVData): { percent: number; steps: { label: string; done: boolean }[] } {
  const p = data.personal;
  const steps = [
    { label: 'Nom et prénom', done: Boolean(p.firstName && p.lastName) },
    { label: 'Titre professionnel', done: Boolean(p.title) },
    { label: 'Coordonnées', done: Boolean(p.email && p.phone) },
    { label: 'Accroche / résumé', done: p.summary.split(/\s+/).filter(Boolean).length >= 20 },
    { label: 'Au moins une expérience', done: data.experiences.length > 0 },
    { label: 'Expériences détaillées', done: data.experiences.length > 0 && data.experiences.every(e => e.description.trim()) },
    { label: 'Formation', done: data.education.length > 0 },
    { label: 'Compétences (5+)', done: data.skills.length >= 5 },
    { label: 'Langues', done: data.languages.length > 0 },
    { label: 'Sections supplémentaires', done: data.projects.length + data.certifications.length + (data.customSections?.length ?? 0) > 0 },
  ];
  const done = steps.filter(s => s.done).length;
  return { percent: Math.round((done / steps.length) * 100), steps };
}
