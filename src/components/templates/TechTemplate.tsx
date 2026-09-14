import { CVData } from '../../types/cv';
import { useTemplateBase, alpha, shade } from './shared';
import { InlineText } from './InlineEdit';

/** Modèle « Nocturne » : fond sombre, accents lumineux et lecture très contrastée. */
export default function TechTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const BG = '#0b1220';
  const CARD = '#131c2e';
  const TXT = '#e2e8f0';
  const MUTED = '#94a3b8';

  const Head = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="font-mono text-[11px] font-bold" style={{ color: colors.primary }}>&gt;</span>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: TXT }}>{label}</h2>
      <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${alpha(colors.primary, 0.6)}, transparent)` }} />
    </div>
  );

  return (
    <div dir={t.dir} className={`w-full ${fontClass} ${sizeClass}`} style={{ minHeight: '297mm', backgroundColor: BG, color: TXT }}>
      {/* Header néon */}
      <header className="relative px-8 pt-8 pb-6 overflow-hidden" style={{ background: `linear-gradient(135deg, ${shade(colors.primary, 0.55)}, ${BG} 70%)` }}>
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full" style={{ background: `radial-gradient(circle, ${alpha(colors.primary, 0.35)}, transparent 65%)` }} />
        <div className="relative flex items-center gap-5">
          {options.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" className="w-[76px] h-[98px] object-cover rounded-lg" style={{ border: `2px solid ${colors.primary}`, boxShadow: `0 0 18px ${alpha(colors.primary, 0.55)}` }} />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] tracking-widest mb-1" style={{ color: colors.primary }}>PROFIL PROFESSIONNEL</p>
            <h1 className="text-[30px] leading-none font-black tracking-tight">
              <InlineText path="personal.firstName" value={personal.firstName} /> <span style={{ color: colors.primary, textShadow: `0 0 16px ${alpha(colors.primary, 0.6)}` }}><InlineText path="personal.lastName" value={personal.lastName} /></span>
            </h1>
            <p className="font-mono text-[11px] mt-1.5" style={{ color: MUTED }}>
              <span style={{ color: colors.primary }}>• </span><InlineText path="personal.title" value={personal.title} />
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-x-4 gap-y-1 mt-4 font-mono text-[9px]" style={{ color: MUTED }}>
          {personal.email && <span><span style={{ color: colors.primary }}>email:</span> {personal.email}</span>}
          {personal.phone && <span><span style={{ color: colors.primary }}>tel:</span> {personal.phone}</span>}
          {personal.city && <span><span style={{ color: colors.primary }}>loc:</span> {personal.city}{personal.country ? `, ${personal.country}` : ''}</span>}
          {personal.linkedIn && <span><span style={{ color: colors.primary }}>in:</span> {personal.linkedIn}</span>}
          {personal.website && <span><span style={{ color: colors.primary }}>web:</span> {personal.website}</span>}
        </div>
      </header>

      <div className="px-8 py-6 grid grid-cols-[1fr_195px] gap-6">
        <div className="space-y-5">
          {options.showSummary && personal.summary && (
            <section>
              <Head label={t.about} />
              <div className="p-3 rounded-lg font-mono text-[9.5px] leading-relaxed" style={{ backgroundColor: CARD, borderLeft: `2px solid ${colors.primary}`, color: MUTED }}>
                <InlineText path="personal.summary" value={personal.summary} multiline />
              </div>
            </section>
          )}

          {options.showExperience && experiences.length > 0 && (
            <section>
              <Head label={t.experienceLong} />
              <div className="space-y-2.5">
                {experiences.map(e => (
                  <div key={e.id} className="p-3 rounded-lg" style={{ backgroundColor: CARD, border: `1px solid ${alpha(colors.primary, 0.18)}` }}>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[11.5px] font-bold" style={{ color: TXT }}><InlineText item={e} field="position" value={e.position} /></h3>
                      <span className="font-mono text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: alpha(colors.primary, 0.16), color: colors.primary }}>
                        {range(e.startDate, e.endDate, e.current)}
                      </span>
                    </div>
                    <p className="font-mono text-[9.5px] mt-0.5" style={{ color: colors.primary }}>
                      <InlineText item={e} field="company" value={e.company} />{e.location && <span style={{ color: MUTED }}> @ <InlineText item={e} field="location" value={e.location} /></span>}
                    </p>
                    {e.description && (
                      <div className="mt-1.5 space-y-0.5">
                        {e.description.split('\n').filter(Boolean).map((line, i) => (
                          <p key={i} className="text-[9.5px] leading-relaxed" style={{ color: MUTED }}>
                            <span className="font-mono" style={{ color: colors.primary }}>• </span>
                            {line.replace(/^[•\-\s]+/, '')}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showProjects && projects.length > 0 && (
            <section>
              <Head label={t.projects} />
              <div className="grid grid-cols-2 gap-2">
                {projects.map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg" style={{ backgroundColor: CARD, border: `1px solid ${alpha(colors.primary, 0.18)}` }}>
                    <h3 className="text-[10px] font-bold" style={{ color: TXT }}>
                      <span className="font-mono" style={{ color: colors.primary }}>• </span><InlineText item={p} field="name" value={p.name} />
                    </h3>
                    {p.description && <p className="text-[9px] mt-1" style={{ color: MUTED }}><InlineText item={p} field="description" value={p.description} multiline /></p>}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.technologies.split(/[,·]/).filter(Boolean).map((tech, i) => (
                        <span key={i} className="font-mono text-[7.5px] px-1.5 py-0.5 rounded" style={{ backgroundColor: alpha(colors.primary, 0.15), color: colors.primary }}>{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showEducation && education.length > 0 && (
            <section>
              <Head label={t.education} />
              <div className="space-y-2">
                {education.map(e => (
                  <div key={e.id} className="flex justify-between items-start gap-3 p-2.5 rounded-lg" style={{ backgroundColor: CARD }}>
                    <div className="min-w-0">
                      <h3 className="text-[10.5px] font-bold" style={{ color: TXT }}><InlineText item={e} field="degree" value={e.degree} /></h3>
                      <p className="font-mono text-[9px]" style={{ color: colors.primary }}><InlineText item={e} field="school" value={e.school} />{e.location && <> · <InlineText item={e} field="location" value={e.location} /></>}</p>
                      {e.description && <p className="text-[9px] mt-0.5" style={{ color: MUTED }}>{e.description}</p>}
                    </div>
                    <span className="font-mono text-[8px] whitespace-nowrap" style={{ color: MUTED }}>{formatDate(e.startDate)}—{formatDate(e.endDate)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showReferences && references.length > 0 && (
            <section>
              <Head label={t.references} />
              <div className="grid grid-cols-2 gap-2">
                {references.map(r => (
                  <div key={r.id} className="p-2 rounded-lg font-mono text-[9px]" style={{ backgroundColor: CARD, color: MUTED }}>
                    <p className="font-bold" style={{ color: TXT }}><InlineText item={r} field="name" value={r.name} /></p>
                    <p>{r.position}{r.company && ` · ${r.company}`}</p>
                    <p style={{ color: colors.primary }}>{r.contact}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {options.showSkills && skills.length > 0 && (
            <section>
              <Head label={t.skills} />
              <div className="space-y-1.5">
                {skills.map(s => (
                  <div key={s.id}>
                    <div className="flex justify-between font-mono text-[9px] mb-0.5">
                      <span style={{ color: TXT }}><InlineText item={s} field="name" value={s.name} /></span>
                      <span style={{ color: colors.primary }}>{'█'.repeat(s.level)}<span style={{ color: alpha(TXT, 0.18) }}>{'█'.repeat(5 - s.level)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showLanguages && languages.length > 0 && (
            <section>
              <Head label={t.languages} />
              <div className="space-y-1">
                {languages.map(l => (
                  <div key={l.id} className="flex justify-between font-mono text-[9px]">
                    <span style={{ color: TXT }}><InlineText item={l} field="name" value={l.name} /></span>
                    <span style={{ color: colors.primary }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showCertifications && certifications.length > 0 && (
            <section>
              <Head label={t.certifications} />
              <div className="space-y-1.5">
                {certifications.map(c => (
                  <div key={c.id} className="p-2 rounded" style={{ backgroundColor: CARD }}>
                    <p className="text-[9px] font-bold leading-tight" style={{ color: TXT }}><InlineText item={c} field="name" value={c.name} /></p>
                    <p className="font-mono text-[8px]" style={{ color: MUTED }}>{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showHobbies && hobbies.length > 0 && (
            <section>
              <Head label={t.hobbies} />
              <div className="flex flex-wrap gap-1">
                {hobbies.map(h => (
                  <span key={h.id} className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${alpha(colors.primary, 0.35)}`, color: MUTED }}><InlineText item={h} field="name" value={h.name} /></span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
