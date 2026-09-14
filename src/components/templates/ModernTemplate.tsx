import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha, shade } from './shared';
import { InlineText } from './InlineEdit';

export default function ModernTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, gap, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const SideHead = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[9.5px] font-black uppercase tracking-[0.2em] text-white/95 mb-2 flex items-center gap-1.5">
      {children}
      <span className="flex-1 h-px bg-white/25" />
    </h2>
  );

  const MainHead = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="w-1 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
      <h2 className="text-[12px] font-black uppercase tracking-[0.16em]" style={{ color: colors.accent }}>{children}</h2>
      <span className="flex-1 h-px" style={{ backgroundColor: tint(colors.primary, 0.78) }} />
    </div>
  );

  return (
    <div className={`bg-white w-full ${fontClass} ${sizeClass} flex`} style={{ minHeight: 1123 }}>
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside
        className="w-[34%] px-5 py-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(165deg, ${colors.primary} 0%, ${shade(colors.primary, 0.35)} 100%)` }}
      >
        <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full" style={{ backgroundColor: alpha('#ffffff', 0.07) }} />
        <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full" style={{ backgroundColor: alpha('#ffffff', 0.05) }} />

        <div className="relative">
          {options.showPhoto && personal.photo && (
            <div className="flex justify-center mb-4">
              <img src={personal.photo} alt="" className="w-[104px] h-[104px] rounded-full object-cover shadow-xl" style={{ border: '3px solid rgba(255,255,255,0.9)' }} />
            </div>
          )}

          <div className="text-center mb-5 pb-4 border-b border-white/20">
            <h1 className="text-[21px] leading-[1.08] font-black uppercase tracking-tight">
              <InlineText path="personal.firstName" value={personal.firstName} /><br /><InlineText path="personal.lastName" value={personal.lastName} />
            </h1>
            {personal.title && <p className="text-[9.5px] mt-2 text-white/85 leading-snug px-1"><InlineText path="personal.title" value={personal.title} /></p>}
          </div>

          <section className="mb-5">
            <SideHead>{t.contact}</SideHead>
            <div className="space-y-1.5 text-[9px] text-white/90">
              {personal.email && <p className="flex gap-1.5 items-start"><span className="opacity-70">✉</span><span className="break-all leading-snug"><InlineText path="personal.email" value={personal.email} /></span></p>}
              {personal.phone && <p className="flex gap-1.5 items-start"><span className="opacity-70">📱</span><InlineText path="personal.phone" value={personal.phone} /></p>}
              {(personal.address || personal.city) && (
                <p className="flex gap-1.5 items-start">
                  <span className="opacity-70">📍</span>
                  <span className="leading-snug">
                    {personal.address && <><InlineText path="personal.address" value={personal.address} /><br /></>}
                    {[personal.postalCode, personal.city].filter(Boolean).join(' ')}
                    {personal.country && <><br /><InlineText path="personal.country" value={personal.country} /></>}
                  </span>
                </p>
              )}
              {personal.linkedIn && <p className="flex gap-1.5 items-start"><span className="opacity-70">🔗</span><span className="break-all leading-snug"><InlineText path="personal.linkedIn" value={personal.linkedIn} /></span></p>}
              {personal.website && <p className="flex gap-1.5 items-start"><span className="opacity-70">🌐</span><span className="break-all leading-snug"><InlineText path="personal.website" value={personal.website} /></span></p>}
            </div>
          </section>

          {options.showSkills && skills.length > 0 && (
            <section className="mb-5">
              <SideHead>{t.skills}</SideHead>
              <div className="space-y-2">
                {skills.map(s => (
                  <div key={s.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[9px] font-semibold leading-tight"><InlineText item={s} field="name" value={s.name} /></span>
                      <span className="text-[7.5px] text-white/55">{s.level}/5</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full rounded-full bg-white/90" style={{ width: `${(s.level / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showLanguages && languages.length > 0 && (
            <section className="mb-5">
              <SideHead>{t.languages}</SideHead>
              <div className="space-y-1">
                {languages.map(l => (
                  <div key={l.id} className="flex justify-between items-center text-[9px]">
                    <span className="font-medium"><InlineText item={l} field="name" value={l.name} /></span>
                    <span className="px-1.5 py-[1px] rounded text-[7.5px] font-bold bg-white/20">{l.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showCertifications && certifications.length > 0 && (
            <section className="mb-5">
              <SideHead>{t.certifications}</SideHead>
              <div className="space-y-1.5">
                {certifications.map(c => (
                  <div key={c.id}>
                    <p className="text-[9px] font-bold leading-tight"><InlineText item={c} field="name" value={c.name} /></p>
                    <p className="text-[7.5px] text-white/65">{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showHobbies && hobbies.length > 0 && (
            <section>
              <SideHead>{t.hobbies}</SideHead>
              <div className="flex flex-wrap gap-1">
                {hobbies.map(h => (
                  <span key={h.id} className="text-[8px] px-2 py-[3px] rounded-full bg-white/15 border border-white/20"><InlineText item={h} field="name" value={h.name} /></span>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>

      {/* ─── Contenu principal ──────────────────── */}
      <main className="flex-1 px-6 py-6 text-slate-800" style={{ display: 'flex', flexDirection: 'column', gap }}>
        {options.showSummary && personal.summary && (
          <section>
            <MainHead>{t.profile}</MainHead>
            <p className="text-[10px] leading-[1.6] text-slate-600"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
          </section>
        )}

        {options.showExperience && experiences.length > 0 && (
          <section>
            <MainHead>{t.experienceLong}</MainHead>
            <div className="space-y-3">
              {experiences.map((e, i) => (
                <div key={e.id} className="relative pl-4">
                  <span className="absolute left-0 top-[5px] w-[7px] h-[7px] rounded-full ring-[2.5px] ring-white" style={{ backgroundColor: colors.primary }} />
                  {i < experiences.length - 1 && (
                    <span className="absolute left-[3px] top-[15px] bottom-[-12px] w-px" style={{ backgroundColor: tint(colors.primary, 0.72) }} />
                  )}
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className="text-[11px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="position" value={e.position} /></h3>
                    <span className="text-[8px] font-bold px-1.5 py-[2px] rounded whitespace-nowrap" style={{ backgroundColor: tint(colors.primary, 0.88), color: colors.accent }}>
                      {range(e.startDate, e.endDate, e.current)}
                    </span>
                  </div>
                  <p className="text-[9.5px] font-semibold mt-[1px]" style={{ color: colors.primary }}>
                    <InlineText item={e} field="company" value={e.company} />{e.location && <span className="text-slate-400 font-normal"> · <InlineText item={e} field="location" value={e.location} /></span>}
                  </p>
                  {e.description && <p className="text-[9.5px] text-slate-600 mt-1 whitespace-pre-line leading-[1.55]"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showEducation && education.length > 0 && (
          <section>
            <MainHead>{t.education}</MainHead>
            <div className="space-y-2">
              {education.map(e => (
                <div key={e.id} className="pl-3 border-l-2" style={{ borderColor: tint(colors.primary, 0.6) }}>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className="text-[10.5px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="degree" value={e.degree} /></h3>
                    <span className="text-[8px] text-slate-400 whitespace-nowrap">{formatDate(e.startDate)} — {formatDate(e.endDate)}</span>
                  </div>
                  <p className="text-[9.5px]" style={{ color: colors.primary }}><InlineText item={e} field="school" value={e.school} />{e.location && <> · <InlineText item={e} field="location" value={e.location} /></>}</p>
                  {e.description && <p className="text-[9px] text-slate-500 mt-0.5"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showProjects && projects.length > 0 && (
          <section>
            <MainHead>{t.projects}</MainHead>
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.id} className="p-2.5 rounded-lg" style={{ backgroundColor: tint(colors.primary, 0.955) }}>
                  <h3 className="text-[10px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                  {p.description && <p className="text-[9.5px] text-slate-600 mt-0.5 leading-relaxed"><InlineText item={p} field="description" value={p.description} multiline /></p>}
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {p.technologies.split(/[,·]/).filter(Boolean).map((tech, i) => (
                      <span key={i} className="text-[7.5px] font-semibold px-1.5 py-[2px] rounded bg-white" style={{ color: colors.accent }}>{tech.trim()}</span>
                    ))}
                    {p.link && <span className="text-[8px] ml-auto" style={{ color: colors.primary }}>🔗 <InlineText item={p} field="link" value={p.link} /></span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showReferences && references.length > 0 && (
          <section>
            <MainHead>{t.references}</MainHead>
            <div className="grid grid-cols-2 gap-2">
              {references.map(r => (
                <div key={r.id} className="text-[9px] pl-2 border-l-2" style={{ borderColor: tint(colors.primary, 0.65) }}>
                  <p className="font-bold text-slate-900"><InlineText item={r} field="name" value={r.name} /></p>
                  <p className="text-slate-500"><InlineText item={r} field="position" value={r.position} />{r.company && <>, <InlineText item={r} field="company" value={r.company} /></>}</p>
                  <p style={{ color: colors.primary }}><InlineText item={r} field="contact" value={r.contact} /></p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
