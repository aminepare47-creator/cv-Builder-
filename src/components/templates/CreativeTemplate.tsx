import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha, shade } from './shared';
import { InlineText } from './InlineEdit';

/** Créatif revisité : formes organiques, pilules colorées, cartes douces. */
export default function CreativeTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, gap, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const Pill = ({ icon, label }: { icon: string; label: string }) => (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-[0.12em] mb-2 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${shade(colors.primary, 0.3)})` }}>
      <span className="text-[10px]">{icon}</span>{label}
    </div>
  );

  return (
    <div className={`bg-white w-full relative overflow-hidden ${fontClass} ${sizeClass}`} style={{ minHeight: 1123 }}>
      {/* Blobs décoratifs */}
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full" style={{ background: `radial-gradient(circle, ${alpha(colors.primary, 0.16)}, transparent 70%)` }} />
      <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full" style={{ background: `radial-gradient(circle, ${alpha(colors.primary, 0.1)}, transparent 70%)` }} />
      <div className="absolute bottom-0 right-0 w-52 h-52 rounded-full" style={{ background: `radial-gradient(circle, ${alpha(colors.primary, 0.08)}, transparent 70%)` }} />

      {/* Header courbé */}
      <header className="relative px-7 pt-7 pb-8" style={{ background: `linear-gradient(120deg, ${tint(colors.primary, 0.9)}, ${tint(colors.primary, 0.97)})`, borderBottomRightRadius: '58px' }}>
        <div className="flex items-center gap-4">
          {options.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" className="w-[88px] h-[110px] object-cover shadow-lg flex-shrink-0"
              style={{ borderRadius: '26px 6px 26px 6px', border: `3px solid ${colors.primary}` }} />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[29px] leading-[0.96] font-black tracking-tight" style={{ color: colors.accent }}>
              <InlineText path="personal.firstName" value={personal.firstName} /><br />
              <span style={{ color: colors.primary }}><InlineText path="personal.lastName" value={personal.lastName} /></span>
            </h1>
            {personal.title && (
              <p className="inline-block mt-2 text-[9.5px] font-bold px-2.5 py-1 rounded-full bg-white/80 shadow-sm" style={{ color: colors.accent }}>
                <InlineText path="personal.title" value={personal.title} />
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3.5 text-[9px]" style={{ color: shade(colors.primary, 0.45) }}>
          {personal.email && <span className="flex items-center gap-1">✉ {personal.email}</span>}
          {personal.phone && <span className="flex items-center gap-1">📱 {personal.phone}</span>}
          {personal.city && <span className="flex items-center gap-1">📍 {personal.city}{personal.country ? `, ${personal.country}` : ''}</span>}
          {personal.linkedIn && <span className="flex items-center gap-1">🔗 {personal.linkedIn}</span>}
          {personal.website && <span className="flex items-center gap-1">🌐 {personal.website}</span>}
        </div>
      </header>

      <div className="relative px-7 py-6 grid grid-cols-[200px_1fr] gap-6" style={{ rowGap: gap }}>
        {/* Colonne gauche */}
        <aside className="space-y-4">
          {options.showSummary && personal.summary && (
            <section>
              <Pill icon="✨" label={t.about} />
              <p className="text-[9.5px] text-slate-600 leading-[1.6]"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
            </section>
          )}

          {options.showSkills && skills.length > 0 && (
            <section>
              <Pill icon="🚀" label={t.skills} />
              <div className="flex flex-wrap gap-1">
                {skills.map(s => (
                  <span key={s.id}
                    className="text-[8.5px] font-semibold px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: s.level >= 4 ? colors.primary : tint(colors.primary, 0.86),
                      color: s.level >= 4 ? '#fff' : colors.accent,
                    }}>
                    <InlineText item={s} field="name" value={s.name} />
                  </span>
                ))}
              </div>
            </section>
          )}

          {options.showLanguages && languages.length > 0 && (
            <section>
              <Pill icon="🌐" label={t.languages} />
              <div className="space-y-1">
                {languages.map(l => (
                  <div key={l.id} className="flex justify-between items-center">
                    <span className="text-[9.5px] font-medium text-slate-700">{l.name}</span>
                    <span className="text-[8px] font-bold px-1.5 py-[2px] rounded-full text-white" style={{ backgroundColor: colors.primary }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showCertifications && certifications.length > 0 && (
            <section>
              <Pill icon="🏆" label={t.certifications} />
              <div className="space-y-1.5">
                {certifications.map(c => (
                  <div key={c.id} className="p-2 rounded-xl" style={{ backgroundColor: tint(colors.primary, 0.94) }}>
                    <p className="text-[9px] font-bold text-slate-800 leading-tight">{c.name}</p>
                    <p className="text-[8px] text-slate-500">{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showHobbies && hobbies.length > 0 && (
            <section>
              <Pill icon="🎯" label={t.hobbies} />
              <div className="flex flex-wrap gap-1">
                {hobbies.map(h => (
                  <span key={h.id} className="text-[8.5px] px-2 py-[3px] rounded-full border" style={{ borderColor: alpha(colors.primary, 0.4), color: colors.accent }}>{h.name}</span>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Colonne droite */}
        <div className="space-y-4">
          {options.showExperience && experiences.length > 0 && (
            <section>
              <Pill icon="💼" label={t.experience} />
              <div className="space-y-2.5">
                {experiences.map(e => (
                  <div key={e.id} className="relative p-3 rounded-2xl" style={{ backgroundColor: tint(colors.primary, 0.965) }}>
                    <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ backgroundColor: colors.primary }} />
                    <div className="pl-2">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <h3 className="text-[11px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="position" value={e.position} /></h3>
                        <span className="text-[7.5px] font-bold px-2 py-[3px] rounded-full text-white whitespace-nowrap" style={{ backgroundColor: colors.accent }}>
                          {range(e.startDate, e.endDate, e.current)}
                        </span>
                      </div>
                      <p className="text-[9.5px] font-semibold mt-[1px]" style={{ color: colors.primary }}>
                        <InlineText item={e} field="company" value={e.company} />{e.location && <span className="text-slate-400 font-normal"> · <InlineText item={e} field="location" value={e.location} /></span>}
                      </p>
                      {e.description && <p className="text-[9.5px] text-slate-600 mt-1 whitespace-pre-line leading-[1.55]"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showEducation && education.length > 0 && (
            <section>
              <Pill icon="🎓" label={t.education} />
              <div className="space-y-2">
                {education.map(e => (
                  <div key={e.id} className="flex gap-2.5 items-start">
                    <span className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] flex-shrink-0" style={{ backgroundColor: tint(colors.primary, 0.88) }}>🎓</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <h3 className="text-[10.5px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="degree" value={e.degree} /></h3>
                        <span className="text-[8px] text-slate-400 whitespace-nowrap">{formatDate(e.startDate)} — {formatDate(e.endDate)}</span>
                      </div>
                      <p className="text-[9.5px] font-medium" style={{ color: colors.primary }}><InlineText item={e} field="school" value={e.school} />{e.location && <> · <InlineText item={e} field="location" value={e.location} /></>}</p>
                      {e.description && <p className="text-[9px] text-slate-500 mt-0.5"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showProjects && projects.length > 0 && (
            <section>
              <Pill icon="💡" label={t.projects} />
              <div className="grid grid-cols-2 gap-2">
                {projects.map(p => (
                  <div key={p.id} className="p-2.5 rounded-2xl border" style={{ borderColor: tint(colors.primary, 0.8) }}>
                    <h3 className="text-[9.5px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                    {p.description && <p className="text-[9px] text-slate-600 mt-0.5 leading-snug"><InlineText item={p} field="description" value={p.description} multiline /></p>}
                    {p.technologies && <p className="text-[8px] font-semibold mt-1" style={{ color: colors.primary }}>{p.technologies}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showReferences && references.length > 0 && (
            <section>
              <Pill icon="👥" label={t.references} />
              <div className="grid grid-cols-2 gap-2">
                {references.map(r => (
                  <div key={r.id} className="p-2 rounded-xl text-[9px]" style={{ backgroundColor: tint(colors.primary, 0.955) }}>
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <p className="text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                    <p style={{ color: colors.primary }}>{r.contact}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
