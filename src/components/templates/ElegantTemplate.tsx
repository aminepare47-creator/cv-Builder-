import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha } from './shared';
import { InlineText } from './InlineEdit';

/** Élégant revisité : cadre filet, serif raffiné, ornements discrets. */
export default function ElegantTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, gap, t, formatDate, range } = useTemplateBase(data, 'long');
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const Head = ({ children }: { children: React.ReactNode }) => (
    <div className="text-center mb-3">
      <h2 className="font-serif text-[12px] tracking-[0.3em] uppercase" style={{ color: colors.accent }}>{children}</h2>
      <div className="flex items-center justify-center gap-2 mt-1.5">
        <span className="h-px w-8" style={{ backgroundColor: tint(colors.primary, 0.55) }} />
        <span className="text-[7px]" style={{ color: colors.primary }}>❖</span>
        <span className="h-px w-8" style={{ backgroundColor: tint(colors.primary, 0.55) }} />
      </div>
    </div>
  );

  return (
    <div className={`bg-white w-full ${fontClass} ${sizeClass} relative`} style={{ minHeight: 1123, padding: '18px' }}>
      {/* Cadre filet double */}
      <div className="absolute inset-[10px] border pointer-events-none" style={{ borderColor: tint(colors.primary, 0.68) }} />
      <div className="absolute inset-[15px] border pointer-events-none" style={{ borderColor: tint(colors.primary, 0.85) }} />

      <div className="relative px-8 py-8" style={{ display: 'flex', flexDirection: 'column', gap }}>
        {/* En-tête */}
        <header className="text-center">
          {options.showPhoto && personal.photo && (
            <div className="relative inline-block mb-3">
              <img src={personal.photo} alt="" className="w-[96px] h-[96px] rounded-full object-cover" style={{ border: `1px solid ${colors.primary}`, padding: '3px' }} />
            </div>
          )}
          <h1 className="font-serif text-[36px] leading-[1.05] tracking-[0.02em] text-slate-900">
            <InlineText path="personal.firstName" value={personal.firstName} /> <span className="italic font-light" style={{ color: colors.primary }}><InlineText path="personal.lastName" value={personal.lastName} /></span>
          </h1>
          {personal.title && (
            <p className="text-[9.5px] tracking-[0.4em] uppercase mt-2.5 text-slate-500"><InlineText path="personal.title" value={personal.title} /></p>
          )}

          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="h-px w-16" style={{ backgroundColor: tint(colors.primary, 0.5) }} />
            <span className="text-[8px]" style={{ color: colors.primary }}>❖</span>
            <span className="h-px w-16" style={{ backgroundColor: tint(colors.primary, 0.5) }} />
          </div>

          <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-3 text-[9px] text-slate-500 italic">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <><span className="not-italic text-slate-300">·</span><span>{personal.phone}</span></>}
            {personal.city && <><span className="not-italic text-slate-300">·</span><span>{personal.city}{personal.country ? `, ${personal.country}` : ''}</span></>}
            {personal.linkedIn && <><span className="not-italic text-slate-300">·</span><span>{personal.linkedIn}</span></>}
            {personal.website && <><span className="not-italic text-slate-300">·</span><span>{personal.website}</span></>}
          </div>
        </header>

        {options.showSummary && personal.summary && (
          <section>
            <p className="font-serif text-[10.5px] leading-[1.8] text-slate-600 italic text-center max-w-[88%] mx-auto">
              <span className="text-[16px] leading-none" style={{ color: alpha(colors.primary, 0.5) }}>“</span>
              <InlineText path="personal.summary" value={personal.summary} multiline />
              <span className="text-[16px] leading-none" style={{ color: alpha(colors.primary, 0.5) }}>”</span>
            </p>
          </section>
        )}

        {options.showExperience && experiences.length > 0 && (
          <section>
            <Head>{t.experienceLong}</Head>
            <div className="space-y-3.5">
              {experiences.map(e => (
                <article key={e.id} className="text-center">
                  <h3 className="font-serif text-[13px] font-semibold" style={{ color: colors.accent }}><InlineText item={e} field="position" value={e.position} /></h3>
                  <p className="text-[10px] italic mt-[1px]" style={{ color: colors.primary }}>
                    <InlineText item={e} field="company" value={e.company} />{e.location && <span className="text-slate-400"> — <InlineText item={e} field="location" value={e.location} /></span>}
                  </p>
                  <p className="text-[8px] tracking-[0.22em] uppercase text-slate-400 mt-1">{range(e.startDate, e.endDate, e.current)}</p>
                  {e.description && (
                    <p className="text-[9.5px] text-slate-600 mt-1.5 whitespace-pre-line leading-[1.65] max-w-[86%] mx-auto text-left"><InlineText item={e} field="description" value={e.description} multiline /></p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {options.showEducation && education.length > 0 && (
          <section>
            <Head>{t.education}</Head>
            <div className="space-y-2.5">
              {education.map(e => (
                <div key={e.id} className="text-center">
                  <h3 className="font-serif text-[11.5px] font-semibold" style={{ color: colors.accent }}><InlineText item={e} field="degree" value={e.degree} /></h3>
                  <p className="text-[9.5px] italic" style={{ color: colors.primary }}>{e.school}{e.location && <span className="text-slate-400"> — {e.location}</span>}</p>
                  <p className="text-[8px] tracking-[0.22em] uppercase text-slate-400 mt-0.5">{formatDate(e.startDate)} — {formatDate(e.endDate)}</p>
                  {e.description && <p className="text-[9px] text-slate-500 italic mt-0.5">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trois colonnes ornées */}
        {((options.showSkills && skills.length > 0) || (options.showLanguages && languages.length > 0) || (options.showHobbies && hobbies.length > 0)) && (
          <div className="grid grid-cols-3 gap-5">
            {options.showSkills && skills.length > 0 && (
              <section>
                <Head>{t.skills}</Head>
                <div className="space-y-1.5">
                  {skills.map(s => (
                    <div key={s.id} className="text-center">
                      <p className="text-[9.5px] text-slate-700">{s.name}</p>
                      <div className="flex justify-center gap-[2px] mt-[2px]">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} className="w-[9px] h-px" style={{ backgroundColor: i <= s.level ? colors.primary : tint(colors.primary, 0.78) }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {options.showLanguages && languages.length > 0 && (
              <section>
                <Head>{t.languages}</Head>
                <div className="space-y-1 text-center">
                  {languages.map(l => (
                    <p key={l.id} className="text-[9.5px]">
                      <span className="italic font-medium text-slate-700">{l.name}</span>
                      <span className="text-slate-400"> — {l.level}</span>
                    </p>
                  ))}
                </div>
              </section>
            )}

            {options.showHobbies && hobbies.length > 0 && (
              <section>
                <Head>{t.interests}</Head>
                <div className="space-y-0.5 text-center">
                  {hobbies.map(h => <p key={h.id} className="text-[9.5px] italic text-slate-600">{h.name}</p>)}
                </div>
              </section>
            )}
          </div>
        )}

        {options.showProjects && projects.length > 0 && (
          <section>
            <Head>{t.projects}</Head>
            <div className="space-y-2 max-w-[88%] mx-auto">
              {projects.map(p => (
                <div key={p.id} className="text-center">
                  <h3 className="font-serif text-[11px] font-semibold" style={{ color: colors.accent }}>{p.name}</h3>
                  {p.description && <p className="text-[9.5px] text-slate-600 italic leading-relaxed">{p.description}</p>}
                  {p.technologies && <p className="text-[8.5px] mt-0.5" style={{ color: colors.primary }}>{p.technologies}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showCertifications && certifications.length > 0 && (
          <section>
            <Head>{t.certifications}</Head>
            <div className="space-y-1 text-center">
              {certifications.map(c => (
                <p key={c.id} className="text-[9.5px]">
                  <span className="font-serif font-semibold italic text-slate-800">{c.name}</span>
                  {c.issuer && <span className="text-slate-500"> — {c.issuer}</span>}
                  {c.date && <span className="text-slate-400"> ({formatDate(c.date)})</span>}
                </p>
              ))}
            </div>
          </section>
        )}

        {options.showReferences && references.length > 0 && (
          <section>
            <Head>{t.references}</Head>
            <div className="grid grid-cols-2 gap-4 max-w-[82%] mx-auto text-center">
              {references.map(r => (
                <div key={r.id} className="text-[9.5px]">
                  <p className="font-serif font-semibold italic" style={{ color: colors.accent }}>{r.name}</p>
                  <p className="text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                  <p className="text-slate-400 italic">{r.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
