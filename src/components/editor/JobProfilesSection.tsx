import type { CVData } from '../../types/cv';
import { JOB_PROFILES } from '../../utils/jobProfiles';
import { COLOR_MAP, TemplateType, ColorScheme } from '../../types/cv';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

/** Profils métiers prêts à l'emploi (Priorité 3). */
export default function JobProfilesSection({ data, onChange }: Props) {
  const apply = (id: string) => {
    const p = JOB_PROFILES.find(j => j.id === id);
    if (!p) return;
    // Compétences proposées : on ne remplace pas, on complète ce qui manque
    const existing = new Set(data.skills.map(s => s.name.toLowerCase()));
    const added = p.skills
      .filter(s => !existing.has(s.toLowerCase()))
      .map((name, i) => ({ id: `profile-${p.id}-${i}`, name, level: 4, category: p.name }));

    // Sections recommandées : ajoutées si absentes
    const existingSections = new Set((data.customSections ?? []).map(s => s.title.toLowerCase()));
    const presetSection = (title: string) => JOB_SECTION_ICONS[title] ?? '📄';
    const newSections = p.suggestedSections
      .filter(t => !existingSections.has(t.toLowerCase()))
      .map((title, i) => ({ id: `ps-${p.id}-${i}`, title, icon: presetSection(title), items: [''], visible: true }));

    onChange({
      ...data,
      template: p.template as TemplateType,
      color: p.color as ColorScheme,
      skills: [...data.skills, ...added],
      customSections: [...(data.customSections ?? []), ...newSections],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">🧑‍💼 Profils métiers</h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Choisissez votre secteur : compétences adaptées, sections recommandées, modèle visuel et mots-clés du métier sont appliqués automatiquement (rien n’écrase vos données).
        </p>
        <div className="grid grid-cols-2 gap-2">
          {JOB_PROFILES.map(p => (
            <button key={p.id} type="button" onClick={() => apply(p.id)}
              className="p-2.5 text-left border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 bg-white transition-all">
              <span className="text-lg">{p.icon}</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight mt-0.5">{p.name}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Modèle {COLOR_MAP[p.color].name}</p>
            </button>
          ))}
        </div>
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
