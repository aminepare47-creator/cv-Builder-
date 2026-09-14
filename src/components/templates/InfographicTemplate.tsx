import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha, totalYears, LANG_LEVEL_VALUE } from './shared';
import { InlineText } from './InlineEdit';

/** Modèle « Infographie » : anneaux de progression, cartes statistiques, jauges. */
export default function InfographicTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const years = totalYears(data);
  const stats = [
    { value: years > 0 ? `${years}+` : `${experiences.length}`, label: years > 0 ? 'ANS' : 'POSTES' },
    { value: `${experiences.length}`, label: 'EXP.' },
    { value: `${skills.length}`, label: 'SKILLS' },
    { value: `${projects.length || certifications.length}`, label: projects.length ? 'PROJETS' : 'CERTIFS' },
  ];

  const Ring = ({ value, label }: { value: number; label: string }) => {
    const r = 15.9155;
    const pct = Math.max(0, Math.min(100, (value / 5) * 100));
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-[42px] h-[42px]">
          <svg viewBox="0 0 36 36" className="w-[42px] h-[42px] -rotate-90">
            <circle cx="18" cy="18" r={r} fill="none" stroke={tint(colors.primary, 0.82)} strokeWidth="3.4" />
            <circle cx="18" cy="18" r={r} fill="none" stroke={colors.primary} strokeWidth="3.4"
              strokeDasharray={`${pct} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8.5px] font-black" style={{ color: colors.accent }}>{value}/5</span>
          </div>
        </div>
        <span className="text-[8px] font-semibold text-slate-600 text-center leading-tight max-w-[52px]">{label}</span>
      </div>
    );
  };

  const Head = ({ icon, label }: { icon: string; label: string }) => (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px]" style={{ backgroundColor: tint(colors.primary, 0.85) }}>{icon}</span>
      <h2 className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: colors.accent }}>{label}</h2>
      <span className="flex-1 h-[2px] rounded-full" style={{ backgroundColor: tint(colors.primary, 0.88) }} />
    </div>
  );

  return (
    <div dir={t.dir} className={`bg-white w-full ${fontClass} ${sizeClass}`} style={{ minHeight: '297mm' }}>
      {/* Header avec vagues */}
      <header className="relative px-8 pt-7 pb-6 overflow-hidden" style={{ background: `linear-gradient(120deg, ${colors.primary}, ${colors.accent})` }}>
        <div className="absolute -bottom-8 -left-6 w-40 h-40 rounded-full" style={{ backgroundColor: alpha('#ffffff', 0.08) }} />
        <div className="absolute -top-10 right-10 w-32 h-32 rounded-full" style={{ backgroundColor: alpha('#ffffff', 0.07) }} />
        <div className="relative flex items-center gap-5 text-white">
          {options.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" className="w-[78px] h-[78px] rounded-full object-cover border-[3px] border-white/80 shadow-lg" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[27px] leading-none font-black tracking-tight"><InlineText path="personal.firstName" value={personal.firstName} /> <InlineText path="personal.lastName" value={personal.lastName} /></h1>
            <p className="text-[11px] font-medium opacity-90 mt-1"><InlineText path="personal.title" value={personal.title} /></p>
          </div>
          {/* Cartes stats */}
          <div className="flex gap-1.5">
            {stats.map((s, i) => (
              <div key={i} className="w-[46px] py-1.5 rounded-lg text-center" style={{ backgroundColor: alpha('#ffffff', 0.18) }}>
                <p className="text-[14px] font-black leading-none">{s.value}</p>
                <p className="text-[6.5px] tracking-widest opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-x-3.5 gap-y-1 mt-4 text-[9px] text-white/90">
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>📱 {personal.phone}</span>}
          {personal.city && <span>📍 {personal.city}{personal.country ? `, ${personal.country}` : ''}</span>}
          {personal.linkedIn && <span>🔗 {personal.linkedIn}</span>}
          {personal.website && <span>🌐 {personal.website}</span>}
        </div>
      </header>

      <div className="px-8 py-5 space-y-5">
        {options.showSummary && personal.summary && (
          <div className="relative p-3.5 rounded-xl" style={{ backgroundColor: tint(colors.primary, 0.94) }}>
            <span className="absolute -top-1.5 left-4 text-[22px] leading-none font-serif" style={{ color: alpha(colors.primary, 0.45) }}>“</span>
            <p className="text-[10px] leading-relaxed text-slate-700 pl-3"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
          </div>
        )}

        {/* Compétences en anneaux */}
        {options.showSkills && skills.length > 0 && (
          <section>
            <Head icon="🚀" label={t.skills} />
            <div className="flex flex-wrap gap-x-3 gap-y-2.5 justify-start">
              {skills.slice(0, 12).map(s => <Ring key={s.id} value={s.level} label={s.name} />)}
            </div>
          </section>
        )}

        <div className="grid grid-cols-[1.5fr_1fr] gap-6">
          <div className="space-y-5">
            {options.showExperience && experiences.length > 0 && (
              <section>
                <Head icon="💼" label={t.experienceLong} />
                <div className="space-y-2.5">
                  {experiences.map(e => (
                    <div key={e.id} className="relative p-3 rounded-xl border" style={{ borderColor: tint(colors.primary, 0.8) }}>
                      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ backgroundColor: colors.primary }} />
                      <div className="pl-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-[11.5px] font-bold text-slate-900"><InlineText item={e} field="position" value={e.position} /></h3>
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: tint(colors.primary, 0.86), color: colors.accent }}>
                            {range(e.startDate, e.endDate, e.current)}
                          </span>
                        </div>
                        <p className="text-[9.5px] font-semibold" style={{ color: colors.primary }}>
                          {e.company}{e.location && <span className="text-slate-400 font-normal"> · {e.location}</span>}
                        </p>
                        {e.description && <p className="text-[9.5px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {options.showProjects && projects.length > 0 && (
              <section>
                <Head icon="💡" label={t.projects} />
                <div className="grid grid-cols-2 gap-2">
                  {projects.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl" style={{ backgroundColor: tint(colors.primary, 0.95) }}>
                      <h3 className="text-[10px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                      {p.description && <p className="text-[9px] text-slate-600 mt-0.5">{p.description}</p>}
                      {p.technologies && <p className="text-[8px] font-semibold mt-1" style={{ color: colors.primary }}>{p.technologies}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            {options.showEducation && education.length > 0 && (
              <section>
                <Head icon="🎓" label={t.education} />
                <div className="space-y-2">
                  {education.map(e => (
                    <div key={e.id} className="p-2.5 rounded-xl border" style={{ borderColor: tint(colors.primary, 0.82) }}>
                      <h3 className="text-[10px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="degree" value={e.degree} /></h3>
                      <p className="text-[9px]" style={{ color: colors.primary }}><InlineText item={e} field="school" value={e.school} /></p>
                      <p className="text-[8px] text-slate-400 mt-0.5">{formatDate(e.startDate)} — {formatDate(e.endDate)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {options.showLanguages && languages.length > 0 && (
              <section>
                <Head icon="🌐" label={t.languages} />
                <div className="space-y-2">
                  {languages.map(l => {
                    const v = LANG_LEVEL_VALUE[l.level] ?? 3;
                    return (
                      <div key={l.id}>
                        <div className="flex justify-between text-[9.5px] mb-0.5">
                          <span className="font-semibold text-slate-700">{l.name}</span>
                          <span className="font-bold" style={{ color: colors.primary }}>{l.level}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i <= v ? colors.primary : tint(colors.primary, 0.85) }} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {options.showCertifications && certifications.length > 0 && (
              <section>
                <Head icon="🏆" label={t.certifications} />
                <div className="space-y-1.5">
                  {certifications.map(c => (
                    <div key={c.id} className="flex gap-1.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                      <div>
                        <p className="text-[9.5px] font-bold text-slate-800 leading-tight">{c.name}</p>
                        <p className="text-[8.5px] text-slate-500">{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {options.showHobbies && hobbies.length > 0 && (
              <section>
                <Head icon="🎯" label={t.hobbies} />
                <div className="flex flex-wrap gap-1">
                  {hobbies.map(h => (
                    <span key={h.id} className="text-[8.5px] font-medium px-2 py-1 rounded-full" style={{ backgroundColor: tint(colors.primary, 0.88), color: colors.accent }}>{h.name}</span>
                  ))}
                </div>
              </section>
            )}

            {options.showReferences && references.length > 0 && (
              <section>
                <Head icon="👥" label={t.references} />
                <div className="space-y-1.5">
                  {references.map(r => (
                    <div key={r.id} className="text-[9px]">
                      <p className="font-bold text-slate-800">{r.name}</p>
                      <p className="text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                      <p style={{ color: colors.primary }}>{r.contact}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
