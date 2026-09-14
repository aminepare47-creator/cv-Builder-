import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha } from './shared';
import { InlineText } from './InlineEdit';

export default function TimelineTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const Node = ({ children, last }: { children: React.ReactNode; last?: boolean }) => (
    <div className="relative pl-7">
      <span className="absolute left-[7px] top-[7px] w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: colors.primary }} />
      {!last && <span className="absolute left-[11.5px] top-[19px] bottom-[-14px] w-[1.5px]" style={{ backgroundColor: alpha(colors.primary, 0.25) }} />}
      {children}
    </div>
  );

  const Head = ({ n, label }: { n: string; label: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: colors.primary }}>{n}</span>
      <h2 className="text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: colors.accent }}>{label}</h2>
      <span className="flex-1 h-px" style={{ backgroundColor: alpha(colors.primary, 0.2) }} />
    </div>
  );

  let step = 0;
  const next = () => String(++step).padStart(2, '0');

  return (
    <div dir={t.dir} className={`bg-white w-full ${fontClass} ${sizeClass}`} style={{ minHeight: '297mm' }}>
      {/* En-tête latéral */}
      <div className="flex items-stretch">
        <div className="w-[9px]" style={{ background: `linear-gradient(180deg, ${colors.primary}, ${colors.accent})` }} />
        <div className="flex-1 px-8 pt-8 pb-5">
          <div className="flex items-center gap-5">
            {options.showPhoto && personal.photo && (
              <img src={personal.photo} alt="" className="w-[74px] h-[96px] object-cover rounded-lg shadow-md" />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-[30px] leading-none font-black tracking-tight text-slate-900">
                <InlineText path="personal.firstName" value={personal.firstName} /> <span style={{ color: colors.primary }}><InlineText path="personal.lastName" value={personal.lastName} /></span>
              </h1>
              <p className="text-[12px] font-semibold tracking-[0.2em] uppercase mt-1.5" style={{ color: colors.accent }}><InlineText path="personal.title" value={personal.title} /></p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2.5 text-[9.5px] text-slate-600">
                {personal.email && <span>✉ {personal.email}</span>}
                {personal.phone && <span>📱 {personal.phone}</span>}
                {personal.city && <span>📍 {personal.city}{personal.country ? `, ${personal.country}` : ''}</span>}
                {personal.linkedIn && <span>🔗 {personal.linkedIn}</span>}
                {personal.website && <span>🌐 {personal.website}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 grid grid-cols-[1fr_190px] gap-7">
        {/* Colonne principale : la frise */}
        <div className="space-y-5">
          {options.showSummary && personal.summary && (
            <div className="p-3.5 rounded-lg border-l-[3px]" style={{ borderColor: colors.primary, backgroundColor: tint(colors.primary, 0.94) }}>
              <p className="text-[10px] leading-relaxed text-slate-700"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
            </div>
          )}

          {options.showExperience && experiences.length > 0 && (
            <section>
              <Head n={next()} label={t.experienceLong} />
              <div className="space-y-3.5">
                {experiences.map((e, i) => (
                  <Node key={e.id} last={i === experiences.length - 1}>
                    <span className="inline-block text-[8.5px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: tint(colors.primary, 0.86), color: colors.accent }}>
                      {range(e.startDate, e.endDate, e.current)}
                    </span>
                    <h3 className="text-[11.5px] font-bold text-slate-900 mt-1"><InlineText item={e} field="position" value={e.position} /></h3>
                    <p className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                      <InlineText item={e} field="company" value={e.company} />{e.location && <span className="text-slate-400 font-normal"> · <InlineText item={e} field="location" value={e.location} /></span>}
                    </p>
                    {e.description && <p className="text-[9.5px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                  </Node>
                ))}
              </div>
            </section>
          )}

          {options.showEducation && education.length > 0 && (
            <section>
              <Head n={next()} label={t.education} />
              <div className="space-y-3">
                {education.map((e, i) => (
                  <Node key={e.id} last={i === education.length - 1}>
                    <span className="text-[8.5px] font-bold tracking-wider uppercase text-slate-400">{formatDate(e.startDate)} — {formatDate(e.endDate)}</span>
                    <h3 className="text-[11px] font-bold text-slate-900"><InlineText item={e} field="degree" value={e.degree} /></h3>
                    <p className="text-[10px]" style={{ color: colors.primary }}><InlineText item={e} field="school" value={e.school} />{e.location && <> · <InlineText item={e} field="location" value={e.location} /></>}</p>
                    {e.description && <p className="text-[9.5px] text-slate-600 mt-0.5"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                  </Node>
                ))}
              </div>
            </section>
          )}

          {options.showProjects && projects.length > 0 && (
            <section>
              <Head n={next()} label={t.projects} />
              <div className="space-y-2">
                {projects.map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg" style={{ backgroundColor: tint(colors.primary, 0.95) }}>
                    <h3 className="text-[10.5px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                    {p.description && <p className="text-[9.5px] text-slate-600 mt-0.5"><InlineText item={p} field="description" value={p.description} multiline /></p>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologies.split(/[,·]/).filter(Boolean).map((tech, i) => (
                        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: 'white', color: colors.accent }}>{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showReferences && references.length > 0 && (
            <section>
              <Head n={next()} label={t.references} />
              <div className="grid grid-cols-2 gap-2">
                {references.map(r => (
                  <div key={r.id} className="text-[9.5px] border-l-2 pl-2" style={{ borderColor: alpha(colors.primary, 0.4) }}>
                     <p className="font-bold text-slate-900"><InlineText item={r} field="name" value={r.name} /></p>
                    <p className="text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                    <p className="text-slate-400">{r.contact}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-5 pt-1">
          {options.showSkills && skills.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.16em] mb-2.5 pb-1 border-b-2" style={{ color: colors.accent, borderColor: colors.primary }}>{t.skills}</h2>
              <div className="space-y-2">
                {skills.map(s => (
                  <div key={s.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[9.5px] font-semibold text-slate-700"><InlineText item={s} field="name" value={s.name} /></span>
                      <span className="text-[8px] text-slate-400">{s.level}/5</span>
                    </div>
                    <div className="h-[3px] rounded-full" style={{ backgroundColor: tint(colors.primary, 0.85) }}>
                      <div className="h-full rounded-full" style={{ width: `${(s.level / 5) * 100}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showLanguages && languages.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.16em] mb-2.5 pb-1 border-b-2" style={{ color: colors.accent, borderColor: colors.primary }}>{t.languages}</h2>
              <div className="space-y-1.5">
                {languages.map(l => (
                  <div key={l.id} className="flex items-center justify-between">
                    <span className="text-[9.5px] font-medium text-slate-700"><InlineText item={l} field="name" value={l.name} /></span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: colors.primary }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showCertifications && certifications.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.16em] mb-2.5 pb-1 border-b-2" style={{ color: colors.accent, borderColor: colors.primary }}>{t.certifications}</h2>
              <div className="space-y-1.5">
                {certifications.map(c => (
                  <div key={c.id}>
                    <p className="text-[9.5px] font-bold text-slate-800 leading-tight"><InlineText item={c} field="name" value={c.name} /></p>
                    <p className="text-[8.5px] text-slate-500">{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showHobbies && hobbies.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.16em] mb-2.5 pb-1 border-b-2" style={{ color: colors.accent, borderColor: colors.primary }}>{t.hobbies}</h2>
              <div className="flex flex-wrap gap-1">
                {hobbies.map(h => (
                  <span key={h.id} className="text-[8.5px] px-2 py-0.5 rounded-full border" style={{ borderColor: alpha(colors.primary, 0.35), color: colors.accent }}><InlineText item={h} field="name" value={h.name} /></span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
