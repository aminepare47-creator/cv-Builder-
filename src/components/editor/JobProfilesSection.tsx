import { useState } from 'react';
import type { CVData } from '../../types/cv';
import { JOB_PROFILES, type JobProfile } from '../../utils/jobProfiles';
import { COLOR_MAP, type TemplateType, type ColorScheme } from '../../types/cv';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

/** Profils métiers prêts à l'emploi (Priorité 3). */
export default function JobProfilesSection({ data, onChange }: Props) {
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const skills = data.skills ?? [];
  const sections = data.customSections ?? [];

  const apply = (p: JobProfile) => {
    // Compétences proposées : on ne remplace pas, on complète ce qui manque
    const existing = new Set(skills.map(s => s.name.toLowerCase()));
    const added = p.skills
      .filter(s => !existing.has(s.toLowerCase()))
      .map((name, i) => ({
        id: `profile-${p.id}-${Date.now()}-${i}`,
        name,
        level: 4,
        category: p.name,
      }));

    // Sections recommandées : ajoutées si absentes
    const existingSections = new Set(sections.map(s => s.title.toLowerCase()));
    const presetSection = (title: string) => JOB_SECTION_ICONS[title] ?? '📄';
    const newSections = p.suggestedSections
      .filter(t => !existingSections.has(t.toLowerCase()))
      .map((title, i) => ({
        id: `ps-${p.id}-${Date.now()}-${i}`,
        title,
        icon: presetSection(title),
        items: [''],
        visible: true,
      }));

    // Titre d'exemple : proposé uniquement si le champ est vide (on n'écrase jamais)
    const titleEmpty = !data.personal.title.trim();
    onChange({
      ...data,
      personal: titleEmpty ? { ...data.personal, title: p.titleExample } : data.personal,
      template: p.template as TemplateType,
      color: p.color as ColorScheme,
      skills: [...skills, ...added],
      customSections: [...sections, ...newSections],
    });
    setAppliedId(p.id);
    setSelectedId(p.id);
  };

  const selected: JobProfile | undefined =
    JOB_PROFILES.find(j => j.id === (selectedId ?? appliedId)) ?? undefined;
  const applied: JobProfile | undefined = JOB_PROFILES.find(j => j.id === appliedId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">🧑‍💼 Profils métiers</h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Choisissez votre secteur : compétences adaptées, sections recommandées, modèle visuel et mots-clés du métier sont appliqués automatiquement (rien n’écrase vos données).
        </p>

        {applied && (
          <p className="mb-2 px-3 py-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg animate-fadeIn" role="status">
            ✅ Profil « {applied.name} » appliqué : modèle + couleur mis à jour, compétences et sections ajoutées. Regardez l’aperçu du CV →
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {JOB_PROFILES.map(p => {
            const isActive = p.id === (selectedId ?? appliedId);
            const alreadyFull =
              p.skills.every(s => skills.some(e => e.name.toLowerCase() === s.toLowerCase())) &&
              p.suggestedSections.every(t => sections.some(e => e.title.toLowerCase() === t.toLowerCase()));
            return (
              <button key={p.id} type="button"
                onClick={() => { setSelectedId(p.id); apply(p); }}
                title={`${p.titleExample} — cliquez pour appliquer`}
                className={`p-2.5 text-left border-2 rounded-xl bg-white transition-all active:scale-[0.98] ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                    : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
                }`}>
                <span className="text-lg">{p.icon}</span>
                <p className="text-[11px] font-bold text-slate-800 leading-tight mt-0.5 flex items-center gap-1">
                  {p.name}
                  {p.id === appliedId && <span className="text-emerald-600">✓</span>}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Modèle {COLOR_MAP[p.color].name}{alreadyFull ? ' · déjà complet' : ''}
                </p>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/60 text-[11px] text-slate-600 space-y-1.5 animate-fadeIn">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{selected.icon}</span> {selected.name}
              {selected.id === appliedId && (
                <span className="ml-auto text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">APPLIQUÉ</span>
              )}
            </p>
            <p>💼 <span className="font-medium text-slate-700">Titre suggéré :</span> {selected.titleExample}</p>
            <p>🧠 <span className="font-medium text-slate-700">Compétences :</span> {selected.skills.join(', ')}</p>
            <p>🔑 <span className="font-medium text-slate-700">Mots-clés ATS :</span> {selected.keywords.join(', ')}</p>
            {selected.id !== appliedId ? (
              <button type="button" onClick={() => apply(selected)}
                className="mt-1 w-full py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 active:scale-[0.99] transition-all">
                Appliquer ce profil
              </button>
            ) : (
              <p className="text-emerald-700 font-medium">✔ Ce profil est appliqué à votre CV. Cliquez sur un autre métier pour changer.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const JOB_SECTION_ICONS: Record<string, string> = {
  'Réalisations principales': '🏆',
  'Prix et distinctions': '🥇',
  'Publications': '📚',
  'Portfolio': '🎨',
  'Réseaux sociaux': '🔗',
  'Disponibilité': '📅',
  'Permis de conduire': '🚗',
  'Mobilité géographique': '🗺️',
  'Centres d’expertise': '🧠',
  'Activités associatives': '👥',
  'Références professionnelles': '✉️',
  'Certifications professionnelles': '📜',
  'Informations complémentaires': '➕',
  'Conférences': '🎤',
};
