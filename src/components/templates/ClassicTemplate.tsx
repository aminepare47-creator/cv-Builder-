import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha } from './shared';
import { InlineText } from './InlineEdit';

/** Classique revisité : sobre, structuré, très lisible et compatible ATS. */
export default function ClassicTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, gap, t, formatDate, range } = useTemplateBase(data, 'long');
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const Head = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2.5">
      <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-center" style={{ color: colors.accent }}>
        {children}
      </h2>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span className="h-px w-10" style={{ backgroundColor: tint(colors.primary, 0.6) }} />
        <span className="w-1 h-1 rotate-45" style={{ backgroundColor: colors.primary }} />
        <span className="h-px w-10" style={{ backgroundColor: tint(colors.primary, 0.6) }} />
      </div>
    </div>
  );

  const skillsByCat = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className={`bg-white w-full ${fontClass} ${sizeClass}`} style={{ minHeight: 1123 }}>
      {/* Filet supérieur */}
      <div className="h-[5px]" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />

      <div className="px-10 pt-7 pb-8" style={{ display: 'flex', flexDirection: 'column', gap }}>
        {/* En-tête */}
        <header className="text-center">
          {options.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" className="w-[86px] h-[108px] object-cover mx-auto mb-3 rounded-sm shadow-sm" style={{ border: `2px solid ${tint(colors.primary, 0.6)}` }} />
          )}
          <h1 className="text-[30px] leading-none font-black tracking-[0.04em] uppercase text-slate-900">
            <InlineText path="personal.firstName" value={personal.firstName} /> <InlineText path="personal.lastName" value={personal.lastName} />
          </h1>
          {personal.title && (
            <p className="text-[11px] tracking-[0.28em] uppercase mt-2 font-semibold" style={{ color: colors.primary }}><InlineText path="personal.title" value={personal.title} /></p>
          )}
          <div className="mt-3 pt-2.5 border-t border-b py-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] text-slate-600" style={{ borderColor: tint(colors.primary, 0.7) }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <><span className="text-slate-300">|</span><span>{personal.phone}</span></>}
            {(personal.address || personal.city) && <><span className="text-slate-300">|</span><span>{[personal.address, `${personal.postalCode} ${personal.city}`.trim(), personal.country].filter(Boolean).join(', ')}</span></>}
            {personal.linkedIn && <><span className="text-slate-300">|</span><span>{personal.linkedIn}</span></>}
            {personal.website && <><span className="text-slate-300">|</span><span>{personal.website}</span></>}
          </div>
        </header>

        {options.showSummary && personal.summary && (
          <section>
            <Head>{t.profile}</Head>
            <p className="text-[10px] leading-[1.65] text-slate-700 text-center max-w-[92%] mx-auto"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
          </section>
        )}

        {options.showExperience && experiences.length > 0 && (
          <section>
            <Head>{t.experienceLong}</Head>
            <div className="space-y-3">
              {experiences.map(e => (
                <article key={e.id}>
                  <div className="flex justify-between items-baseline gap-3 flex-wrap">
                    <h3 className="text-[11.5px] font-bold text-slate-900"><InlineText item={e} field="position" value={e.position} /></h3>
                    <span className="text-[8.5px] italic text-slate-500 whitespace-nowrap">{range(e.startDate, e.endDate, e.current)}</span>
                  </div>
                  <p className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                    <InlineText item={e} field="company" value={e.company} />{e.location && <span className="text-slate-400 font-normal italic"> — <InlineText item={e} field="location" value={e.location} /></span>}
                  </p>
                  {e.description && <p className="text-[9.5px] text-slate-600 mt-1 whitespace-pre-line leading-[1.6]"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {options.showEducation && education.length > 0 && (
          <section>
            <Head>{t.education}</Head>
            <div className="space-y-2">
              {education.map(e => (
                <div key={e.id}>
                  <div className="flex justify-between items-baseline gap-3 flex-wrap">
                    <h3 className="text-[11px] font-bold text-slate-900"><InlineText item={e} field="degree" value={e.degree} /></h3>
                    <span className="text-[8.5px] italic text-slate-500 whitespace-nowrap">{formatDate(e.startDate)} — {formatDate(e.endDate)}</span>
                  </div>
                  <p className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                    <InlineText item={e} field="school" value={e.school} />{e.location && <span className="text-slate-400 font-normal italic"> — <InlineText item={e} field="location" value={e.location} /></span>}
                  </p>
                  {e.description && <p className="text-[9.5px] text-slate-600 mt-0.5"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showSkills && skills.length > 0 && (
          <section>
            <Head>{t.skills}</Head>
            <div className="space-y-1.5">
              {Object.entries(skillsByCat).map(([cat, list]) => (
                <div key={cat} className="flex gap-2 items-baseline">
                  <span className="text-[9px] font-bold uppercase tracking-wider w-[78px] flex-shrink-0 text-right" style={{ color: colors.accent }}>{cat}</span>
                  <span className="w-px self-stretch" style={{ backgroundColor: tint(colors.primary, 0.72) }} />
                  <div className="flex flex-wrap gap-x-2 gap-y-1 flex-1">
                    {list.map(s => (
                      <span key={s.id} className="text-[9.5px] text-slate-700 flex items-center gap-1">
                        <InlineText item={s} field="name" value={s.name} />
                        <span className="flex gap-[1.5px]">
                          {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: i <= s.level ? colors.primary : tint(colors.primary, 0.78) }} />
                          ))}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showProjects && projects.length > 0 && (
          <section>
            <Head>{t.projectsPersonal}</Head>
            <div className="space-y-1.5">
              {projects.map(p => (
                <div key={p.id}>
                  <h3 className="text-[10.5px] font-bold text-slate-900">
                    <InlineText item={p} field="name" value={p.name} />
                    {p.technologies && <span className="font-normal italic text-slate-400 text-[9px]"> — {p.technologies}</span>}
                  </h3>
                  {p.description && <p className="text-[9.5px] text-slate-600 leading-relaxed"><InlineText item={p} field="description" value={p.description} multiline /></p>}
                  {p.link && <p className="text-[8.5px] italic" style={{ color: colors.primary }}>{p.link}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {options.showCertifications && certifications.length > 0 && (
          <section>
            <Head>{t.certifications}</Head>
            <div className="space-y-0.5">
              {certifications.map(c => (
                <div key={c.id} className="flex justify-between items-baseline gap-2 text-[9.5px]">
                  <span><span className="font-bold text-slate-800">{c.name}</span>{c.issuer && <span className="text-slate-500"> — {c.issuer}</span>}</span>
                  {c.date && <span className="italic text-slate-400 whitespace-nowrap">{formatDate(c.date)}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Deux colonnes basses */}
        {((options.showLanguages && languages.length > 0) || (options.showHobbies && hobbies.length > 0)) && (
          <div className="grid grid-cols-2 gap-6">
            {options.showLanguages && languages.length > 0 && (
              <section>
                <Head>{t.languages}</Head>
                <div className="space-y-0.5">
                  {languages.map(l => (
                    <div key={l.id} className="flex justify-between text-[9.5px] px-2">
                      <span className="font-semibold text-slate-700">{l.name}</span>
                      <span className="italic" style={{ color: colors.primary }}>{l.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {options.showHobbies && hobbies.length > 0 && (
              <section>
                <Head>{t.hobbies}</Head>
                <p className="text-[9.5px] text-slate-600 text-center leading-relaxed">{hobbies.map(h => h.name).join(' · ')}</p>
              </section>
            )}
          </div>
        )}

        {options.showReferences && references.length > 0 && (
          <section>
            <Head>{t.references}</Head>
            <div className="grid grid-cols-2 gap-3">
              {references.map(r => (
                <div key={r.id} className="text-[9.5px] p-2 rounded" style={{ backgroundColor: alpha(colors.primary, 0.05) }}>
                  <p className="font-bold text-slate-900"><InlineText item={r} field="name" value={r.name} /></p>
                  <p className="italic text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                  <p className="text-slate-500">{r.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
