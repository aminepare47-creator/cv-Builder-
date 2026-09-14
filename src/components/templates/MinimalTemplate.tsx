import { CVData } from '../../types/cv';
import { useTemplateBase, tint } from './shared';
import { InlineText } from './InlineEdit';

/** Minimaliste revisité : grille typographique, beaucoup de blanc, accents discrets. */
export default function MinimalTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, gap, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const Head = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[9px] font-bold uppercase tracking-[0.32em] text-slate-400 mb-2.5">{children}</h2>
  );

  /** Ligne en grille : colonne dates fixe + contenu */
  const Row = ({ date, children }: { date: React.ReactNode; children: React.ReactNode }) => (
    <div className="grid grid-cols-[84px_1fr] gap-4">
      <div className="text-[8.5px] text-slate-400 leading-[1.5] pt-[2px] tabular-nums">{date}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );

  return (
    <div className={`bg-white w-full px-11 py-11 ${fontClass} ${sizeClass}`} style={{ minHeight: 1123 }}>
      {/* En-tête */}
      <header className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[34px] leading-[1.02] font-light tracking-[-0.02em] text-slate-900">
            <InlineText path="personal.firstName" value={personal.firstName} />{' '}
            <span className="font-bold"><InlineText path="personal.lastName" value={personal.lastName} /></span>
          </h1>
          {personal.title && <p className="text-[10.5px] text-slate-500 mt-1.5 tracking-wide"><InlineText path="personal.title" value={personal.title} /></p>}
        </div>
        {options.showPhoto && personal.photo && (
          <img src={personal.photo} alt="" className="w-[62px] h-[62px] rounded-full object-cover flex-shrink-0 grayscale" />
        )}
      </header>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500">
        {[personal.email, personal.phone,
          [personal.city, personal.country].filter(Boolean).join(', '),
          personal.linkedIn, personal.website]
          .filter(Boolean)
          .map((item, i, arr) => (
            <span key={i} className="flex items-center gap-3">
              {item}
              {i < arr.length - 1 && <span className="w-1 h-1 rounded-full bg-slate-300" />}
            </span>
          ))}
      </div>

      <div className="w-12 h-[2px] my-6" style={{ backgroundColor: colors.primary }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: gap + 4 }}>
        {options.showSummary && personal.summary && (
          <p className="text-[10.5px] leading-[1.75] text-slate-600 max-w-[95%]"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
        )}

        {options.showExperience && experiences.length > 0 && (
          <section>
            <Head>{t.experience}</Head>
            <div className="space-y-3.5">
              {experiences.map(e => (
                <Row key={e.id} date={<>{range(e.startDate, e.endDate, e.current).split(' — ').map((d, i) => <div key={i}>{d}</div>)}</>}>
                  <h3 className="text-[11px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="position" value={e.position} /></h3>
                  <p className="text-[9.5px] mt-[1px]" style={{ color: colors.primary }}>
                    {e.company}{e.location && <span className="text-slate-400"> · {e.location}</span>}
                  </p>
                  {e.description && <p className="text-[9.5px] text-slate-600 mt-1.5 whitespace-pre-line leading-[1.65]">{e.description}</p>}
                </Row>
              ))}
            </div>
          </section>
        )}

        {options.showEducation && education.length > 0 && (
          <section>
            <Head>{t.education}</Head>
            <div className="space-y-2.5">
              {education.map(e => (
                <Row key={e.id} date={<>{formatDate(e.startDate)}<div>{formatDate(e.endDate)}</div></>}>
                  <h3 className="text-[10.5px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="degree" value={e.degree} /></h3>
                  <p className="text-[9.5px]" style={{ color: colors.primary }}>{e.school}{e.location && <span className="text-slate-400"> · {e.location}</span>}</p>
                  {e.description && <p className="text-[9px] text-slate-500 mt-0.5">{e.description}</p>}
                </Row>
              ))}
            </div>
          </section>
        )}

        {options.showProjects && projects.length > 0 && (
          <section>
            <Head>{t.projects}</Head>
            <div className="space-y-2">
              {projects.map(p => (
                <Row key={p.id} date={p.technologies ? <span className="italic">{p.technologies}</span> : ''}>
                  <h3 className="text-[10.5px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                  {p.description && <p className="text-[9.5px] text-slate-600 leading-relaxed">{p.description}</p>}
                  {p.link && <p className="text-[9px] mt-0.5" style={{ color: colors.primary }}>{p.link}</p>}
                </Row>
              ))}
            </div>
          </section>
        )}

        {/* Colonnes compétences / langues */}
        {((options.showSkills && skills.length > 0) || (options.showLanguages && languages.length > 0)) && (
          <div className="grid grid-cols-2 gap-8">
            {options.showSkills && skills.length > 0 && (
              <section>
                <Head>{t.skills}</Head>
                <div className="space-y-1.5">
                  {skills.map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-[9.5px] text-slate-700 flex-1 truncate">{s.name}</span>
                      <span className="flex gap-[2px] flex-shrink-0">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} className="w-[14px] h-[2px]" style={{ backgroundColor: i <= s.level ? colors.primary : tint(colors.primary, 0.82) }} />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="space-y-5">
              {options.showLanguages && languages.length > 0 && (
                <section>
                  <Head>{t.languages}</Head>
                  <div className="space-y-1">
                    {languages.map(l => (
                      <div key={l.id} className="flex justify-between text-[9.5px]">
                        <span className="text-slate-700">{l.name}</span>
                        <span className="text-slate-400">{l.level}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {options.showHobbies && hobbies.length > 0 && (
                <section>
                  <Head>{t.hobbies}</Head>
                  <p className="text-[9.5px] text-slate-600 leading-relaxed">{hobbies.map(h => h.name).join(' · ')}</p>
                </section>
              )}
            </div>
          </div>
        )}

        {options.showCertifications && certifications.length > 0 && (
          <section>
            <Head>{t.certifications}</Head>
            <div className="space-y-1">
              {certifications.map(c => (
                <Row key={c.id} date={c.date ? formatDate(c.date) : ''}>
                  <p className="text-[9.5px]">
                    <span className="font-bold text-slate-800">{c.name}</span>
                    {c.issuer && <span className="text-slate-500"> · {c.issuer}</span>}
                  </p>
                </Row>
              ))}
            </div>
          </section>
        )}

        {options.showReferences && references.length > 0 && (
          <section>
            <Head>{t.references}</Head>
            <div className="grid grid-cols-2 gap-4 text-[9.5px]">
              {references.map(r => (
                <div key={r.id}>
                  <p className="font-bold text-slate-900">{r.name}</p>
                  <p className="text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                  <p className="text-slate-400">{r.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
