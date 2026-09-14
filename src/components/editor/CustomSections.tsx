import { useState } from 'react';
import type { CVData, CustomSection } from '../../types/cv';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

/** Sections prédéfinies proposées à l'ajout en un clic (Priorité 2). */
export const SECTION_PRESETS: { title: string; icon: string; items?: string[] }[] = [
  { title: 'Réalisations principales', icon: '🏆' },
  { title: 'Prix et distinctions', icon: '🥇' },
  { title: 'Bénévolat', icon: '🤲' },
  { title: 'Publications', icon: '📚' },
  { title: 'Conférences', icon: '🎤' },
  { title: 'Disponibilité', icon: '📅', items: ['Disponible immédiatement', 'Temps plein'] },
  { title: 'Permis de conduire', icon: '🚗', items: ['Permis B — véhicule personnel'] },
  { title: 'Mobilité géographique', icon: '🗺️', items: ['Mobile sur toute la France'] },
  { title: 'Centres d’expertise', icon: '🧠' },
  { title: 'Portfolio', icon: '🎨' },
  { title: 'Réseaux sociaux', icon: '🔗' },
  { title: 'Activités associatives', icon: '👥' },
  { title: 'Références professionnelles', icon: '✉️' },
  { title: 'Certifications professionnelles', icon: '📜' },
  { title: 'Informations complémentaires', icon: '➕' },
];

const uid = () => Math.random().toString(36).slice(2, 11);

export default function CustomSections({ data, onChange }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const sections = data.customSections ?? [];

  const setSections = (next: CustomSection[]) => onChange({ ...data, customSections: next });
  const addSection = (title: string, icon = '📄', items: string[] = []) =>
    setSections([...sections, { id: uid(), title, icon, items, visible: true }]);
  const update = (id: string, patch: Partial<CustomSection>) =>
    setSections(sections.map(s => (s.id === id ? { ...s, ...patch } : s)));
  const move = (id: string, dir: -1 | 1) => {
    const i = sections.findIndex(s => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  };
  const remove = (id: string) => setSections(sections.filter(s => s.id !== id));

  const usedPresets = new Set(sections.map(s => s.title));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">🧩 Sections personnalisables</h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Ajoutez vos propres sections : titre, contenu ligne par ligne, réorganisation, masquage ou affichage.
        </p>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Ajouter une section prête à l’emploi</p>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_PRESETS.map(preset => {
              const used = usedPresets.has(preset.title);
              return (
                <button key={preset.title} type="button" disabled={used}
                  onClick={() => addSection(preset.title, preset.icon, preset.items ?? [])}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-all ${used ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400' : 'border-slate-200 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                  {preset.icon} {preset.title}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newTitle.trim()) { addSection(newTitle.trim()); setNewTitle(''); } }}
            placeholder="Titre d’une section entièrement personnalisée…"
            className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="button" onClick={() => { if (newTitle.trim()) { addSection(newTitle.trim()); setNewTitle(''); } }}
            className="h-9 px-3 text-xs font-bold text-white rounded-lg bg-indigo-600 hover:bg-indigo-700">
            + Créer
          </button>
        </div>
      </div>
      {/* Liste des sections créées */}
      {sections.length === 0 && (
        <p className="text-[11px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
          Aucune section personnalisée pour l’instant.
        </p>
      )}

      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className={`p-3 rounded-xl border ${s.visible ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm flex-shrink-0">{s.icon}</span>
              <input
                value={s.title}
                onChange={e => update(s.id, { title: e.target.value })}
                className="flex-1 min-w-0 h-8 px-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button type="button" onClick={() => update(s.id, { visible: !s.visible })} title={s.visible ? 'Masquer' : 'Afficher'}
                className="w-7 h-7 flex-shrink-0 rounded-md text-slate-500 hover:bg-slate-100 text-[11px]">
                {s.visible ? '👁' : '🚫'}
              </button>
              <button type="button" onClick={() => move(s.id, -1)} disabled={i === 0} className="w-7 h-7 flex-shrink-0 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 text-[11px]">↑</button>
              <button type="button" onClick={() => move(s.id, 1)} disabled={i === sections.length - 1} className="w-7 h-7 flex-shrink-0 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 text-[11px]">↓</button>
              <button type="button" onClick={() => remove(s.id)} className="w-7 h-7 flex-shrink-0 rounded-md text-red-500 hover:bg-red-50 text-[11px]">✕</button>
            </div>
            <div className="space-y-1.5">
              {s.items.map((item, k) => (
                <div key={k} className="flex gap-1.5">
                  <input
                    value={item}
                    onChange={e => update(s.id, { items: s.items.map((it, idx) => idx === k ? e.target.value : it) })}
                    placeholder="Contenu de la ligne…"
                    className="flex-1 min-w-0 h-8 px-2 text-xs border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="button" onClick={() => update(s.id, { items: s.items.filter((_, idx) => idx !== k) })}
                    className="w-8 h-8 text-[11px] text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => update(s.id, { items: [...s.items, ''] })}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">+ Ajouter une ligne</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


