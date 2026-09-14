import { CVData } from '../../types/cv';
import { useTemplateBase, tint, alpha } from './shared';
import { InlineText } from './InlineEdit';

/** Modèle « Magazine » : typographie éditoriale, lettrine, colonnes et filets. */
export default function MagazineTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, t, formatDate, range } = useTemplateBase(data, 'long');
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const summary = personal.summary.trim();
  const dropCap = summary.charAt(0);

  const Rubric = ({ label }: { label: string }) => (
    <div className="flex items-baseline gap-2 mb-2.5">
      <h2 className="font-serif text-[13px] font-bold italic" style={{ color: colors.accent }}>{label}</h2>
      <span className="flex-1 border-b border-dotted" style={{ borderColor: alpha(colors.primary, 0.45) }} />
    </div>
  );

  return (
    <div dir={t.dir} className={`bg-white w-full ${fontClass} ${sizeClass}`} style={{ minHeight: '297mm' }}>
      {/* Ours / bandeau supérieur */}
      <div className="flex items-center justify-between px-9 pt-6 pb-2 text-[8px] uppercase tracking-[0.35em] text-slate-400">
        <span>Curriculum Vitæ</span>
        <span style={{ color: colors.primary }}>{personal.city || personal.country}</span>
      </div>
      <div className="mx-9 border-t-2 border-b" style={{ borderColor: colors.accent }} />

      {/* Titraille */}
      <header className="px-9 pt-5 pb-4">
        <div className="flex items-end gap-5">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-[44px] leading-[0.92] font-black tracking-tight text-slate-900">
              <InlineText path="personal.firstName" value={personal.firstName} />
              <br />
              <span className="italic font-light" style={{ color: colors.primary }}><InlineText path="personal.lastName" value={personal.lastName} /></span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] mt-2.5 text-slate-500"><InlineText path="personal.title" value={personal.title} /></p>
          </div>
          {options.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" className="w-[84px] h-[110px] object-cover grayscale" style={{ filter: 'grayscale(1) contrast(1.05)' }} />
          )}
        </div>
      </header>

      <div className="mx-9 border-t" style={{ borderColor: alpha(colors.accent, 0.35) }} />

      {/* Chapô en 3 colonnes de contact */}
      <div className="px-9 py-2.5 grid grid-cols-3 gap-4 text-[9px] text-slate-600 border-b" style={{ borderColor: alpha(colors.accent, 0.15) }}>
        <div>{personal.email && <p>{personal.email}</p>}{personal.phone && <p>{personal.phone}</p>}</div>
        <div>{personal.address && <p>{personal.address}</p>}{(personal.postalCode || personal.city) && <p>{personal.postalCode} {personal.city}</p>}</div>
        <div className="text-right">{personal.linkedIn && <p>{personal.linkedIn}</p>}{personal.website && <p>{personal.website}</p>}</div>
      </div>

      <div className="px-9 py-5 grid grid-cols-[1.55fr_1fr] gap-7">
        {/* Corps éditorial */}
        <div className="space-y-5">
          {options.showSummary && summary && (
            <p className="text-[10.5px] leading-[1.65] text-slate-700 text-justify">
              <span className="float-left font-serif font-black mr-2 leading-[0.78]" style={{ fontSize: '40px', color: colors.primary }}>{dropCap}</span>
              <InlineText path="personal.summary" value={personal.summary} multiline />
            </p>
          )}

          {options.showExperience && experiences.length > 0 && (
            <section>
              <Rubric label={t.experienceLong} />
              <div className="space-y-3.5">
                {experiences.map((e, i) => (
                  <article key={e.id}>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-[17px] font-black leading-none" style={{ color: alpha(colors.primary, 0.35) }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-[12.5px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="position" value={e.position} /></h3>
                        <p className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: colors.primary }}>
                          <InlineText item={e} field="company" value={e.company} />{e.location && <span className="text-slate-400 normal-case tracking-normal"> — <InlineText item={e} field="location" value={e.location} /></span>}
                        </p>
                        <p className="text-[8.5px] italic text-slate-400 mt-0.5">{range(e.startDate, e.endDate, e.current)}</p>
                      </div>
                    </div>
                    {e.description && (
                      <p className="text-[9.5px] leading-relaxed text-slate-600 mt-1.5 pl-[26px] whitespace-pre-line text-justify">{e.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {options.showProjects && projects.length > 0 && (
            <section>
              <Rubric label={t.projectsPersonal} />
              <div className="space-y-2">
                {projects.map(p => (
                  <div key={p.id} className="pl-3 border-l-2" style={{ borderColor: alpha(colors.primary, 0.4) }}>
                      <h3 className="font-serif text-[11px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                    {p.description && <p className="text-[9.5px] text-slate-600 leading-relaxed">{p.description}</p>}
                    {p.technologies && <p className="text-[8.5px] italic mt-0.5" style={{ color: colors.primary }}>{p.technologies}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showReferences && references.length > 0 && (
            <section>
              <Rubric label={t.references} />
              <div className="grid grid-cols-2 gap-3">
                {references.map(r => (
                  <div key={r.id} className="text-[9.5px]">
                      <p className="font-serif font-bold text-slate-900"><InlineText item={r} field="name" value={r.name} /></p>
                    <p className="italic text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                    <p className="text-slate-400">{r.contact}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonne encadrés */}
        <aside className="space-y-4">
          {options.showSkills && skills.length > 0 && (
            <section className="p-3.5" style={{ backgroundColor: tint(colors.primary, 0.93) }}>
              <h2 className="font-serif text-[11px] font-bold italic mb-2" style={{ color: colors.accent }}>{t.skills}</h2>
              <div className="space-y-1">
                {skills.map(s => (
                  <div key={s.id} className="flex items-baseline gap-1.5">
                    <span className="text-[9.5px] text-slate-700 flex-1">{s.name}</span>
                    <span className="flex-1 border-b border-dotted self-end mb-0.5" style={{ borderColor: alpha(colors.accent, 0.3) }} />
                    <span className="font-serif text-[9px] font-bold" style={{ color: colors.primary }}>{s.level}/5</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showEducation && education.length > 0 && (
            <section>
              <Rubric label={t.education} />
              <div className="space-y-2">
                {education.map(e => (
                  <div key={e.id}>
                    <h3 className="font-serif text-[10.5px] font-bold text-slate-900 leading-tight">{e.degree}</h3>
                    <p className="text-[9px]" style={{ color: colors.primary }}>{e.school}</p>
                    <p className="text-[8.5px] italic text-slate-400">{formatDate(e.startDate)} — {formatDate(e.endDate)}</p>
                    {e.description && <p className="text-[9px] text-slate-600 mt-0.5">{e.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showLanguages && languages.length > 0 && (
            <section>
              <Rubric label={t.languages} />
              <div className="space-y-0.5">
                {languages.map(l => (
                  <p key={l.id} className="text-[9.5px] text-slate-700">
                    <span className="font-semibold">{l.name}</span>
                    <span className="italic text-slate-400"> — {l.level}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {options.showCertifications && certifications.length > 0 && (
            <section>
              <Rubric label={t.certifications} />
              <div className="space-y-1">
                {certifications.map(c => (
                  <div key={c.id}>
                    <p className="text-[9.5px] font-semibold text-slate-800 leading-tight">{c.name}</p>
                    <p className="text-[8.5px] italic text-slate-400">{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {options.showHobbies && hobbies.length > 0 && (
            <section className="pt-1 border-t" style={{ borderColor: alpha(colors.accent, 0.25) }}>
              <p className="text-[9px] italic text-slate-500 leading-relaxed">
                <span className="font-serif font-bold not-italic" style={{ color: colors.accent }}>{t.interests} · </span>
                {hobbies.map(h => h.name).join(', ')}
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
