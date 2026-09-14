import type { CVData } from '../../types/cv';
import { COLOR_MAP } from '../../types/cv';
import { alpha } from './shared';

/**
 * Rendu générique des sections personnalisées (Priorité 2).
 * Affiché après le modèle pour tous les templates, dans le style du CV.
 */
export default function CustomSectionsBlock({ data }: { data: CVData }) {
  const sections = (data.customSections ?? []).filter(s => s.visible && (s.title.trim() || s.items.some(i => i.trim())));
  if (!sections.length) return null;
  const c = COLOR_MAP[data.color];

  return (
    <div className="px-8 py-5" style={{ borderTop: `2px solid ${alpha(c.primary, 0.35)}` }}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {sections.map(s => (
          <section key={s.id}>
            <h3
              className="text-[12px] font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
              style={{ color: c.primary }}
            >
              <span>{s.icon}</span> {s.title}
            </h3>
            <ul className="space-y-1">
              {s.items.filter(i => i.trim()).map((item, k) => (
                <li key={k} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.primary }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
