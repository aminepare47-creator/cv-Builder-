import { CVData } from '../../types/cv';
import { useTemplateBase, tint, shade, alpha } from './shared';
import { InlineText } from './InlineEdit';

/** Modèle « Mosaïque » : blocs géométriques asymétriques, bandeau diagonal, cartes colorées. */
export default function MosaicTemplate({ data }: { data: CVData }) {
  const { colors, fontClass, sizeClass, t, formatDate, range } = useTemplateBase(data);
  const { personal, experiences, education, skills, languages, hobbies, projects, certifications, references, options } = data;

  const Tile = ({ label, children, dark = false, span = '' }: { label: string; children: React.ReactNode; dark?: boolean; span?: string }) => (
    <section className={`rounded-2xl p-3.5 ${span}`} style={{ backgroundColor: dark ? colors.primary : tint(colors.primary, 0.95) }}>
      <h2 className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: dark ? 'rgba(255,255,255,0.95)' : colors.accent }}>
        {label}
      </h2>
      {children}
    </section>
  );

  return (
    <div dir={t.dir} className={`bg-white w-full ${fontClass} ${sizeClass}`} style={{ minHeight: '297mm' }}>
      {/* Bandeau diagonal */}
      <header className="relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
        <div className="absolute inset-y-0 right-0 w-1/2" style={{ backgroundColor: shade(colors.primary, 0.25), clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0% 100%)' }} />
        <div className="absolute -bottom-10 left-10 w-28 h-28 rounded-2xl rotate-12" style={{ backgroundColor: alpha('#ffffff', 0.08) }} />

        <div className="relative px-8 py-7 flex items-center gap-5 text-white">
          {options.showPhoto && personal.photo && (
            <img src={personal.photo} alt="" className="w-[80px] h-[100px] object-cover rounded-xl shadow-xl rotate-[-2deg]" style={{ border: '3px solid rgba(255,255,255,0.85)' }} />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[31px] leading-[0.95] font-black tracking-tight uppercase">
              <InlineText path="personal.firstName" value={personal.firstName} /><br /><InlineText path="personal.lastName" value={personal.lastName} />
            </h1>
            <div className="inline-block mt-2 px-2.5 py-1 rounded-md" style={{ backgroundColor: alpha('#ffffff', 0.2) }}>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase"><InlineText path="personal.title" value={personal.title} /></p>
            </div>
          </div>
        </div>
      </header>

      {/* Bande contact */}
      <div className="px-8 py-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[9px] text-white" style={{ backgroundColor: colors.accent }}>
        {personal.email && <span>✉ {personal.email}</span>}
        {personal.phone && <span>📱 {personal.phone}</span>}
        {(personal.city || personal.address) && <span>📍 {[personal.address, `${personal.postalCode} ${personal.city}`.trim(), personal.country].filter(Boolean).join(' · ')}</span>}
        {personal.linkedIn && <span>🔗 {personal.linkedIn}</span>}
        {personal.website && <span>🌐 {personal.website}</span>}
      </div>

      {/* Mosaïque */}
      <div className="p-6 grid grid-cols-6 gap-3 auto-rows-min">
        {options.showSummary && personal.summary && (
          <Tile label={t.profile} dark span="col-span-6">
            <p className="text-[10px] leading-relaxed text-white/95"><InlineText path="personal.summary" value={personal.summary} multiline /></p>
          </Tile>
        )}

        {options.showExperience && experiences.length > 0 && (
          <section className="col-span-4 rounded-2xl p-3.5 border-2" style={{ borderColor: tint(colors.primary, 0.78) }}>
            <h2 className="text-[10px] font-black uppercase tracking-[0.18em] mb-2.5" style={{ color: colors.accent }}>{t.experienceLong}</h2>
            <div className="space-y-2.5">
              {experiences.map((e, i) => (
                <div key={e.id} className="flex gap-2.5">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                      style={{ backgroundColor: i === 0 ? colors.primary : tint(colors.primary, 0.45) }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {i < experiences.length - 1 && <span className="flex-1 w-px mt-1" style={{ backgroundColor: tint(colors.primary, 0.75) }} />}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[11px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="position" value={e.position} /></h3>
                      <span className="text-[8px] font-bold whitespace-nowrap" style={{ color: colors.primary }}>{range(e.startDate, e.endDate, e.current)}</span>
                    </div>
                    <p className="text-[9.5px] font-semibold text-slate-500"><InlineText item={e} field="company" value={e.company} />{e.location && <> · <InlineText item={e} field="location" value={e.location} /></>}</p>
                    {e.description && <p className="text-[9.5px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed"><InlineText item={e} field="description" value={e.description} multiline /></p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="col-span-2 space-y-3">
          {options.showSkills && skills.length > 0 && (
            <Tile label={t.skills}>
              <div className="flex flex-wrap gap-1">
                {skills.map(s => (
                  <span key={s.id} className="text-[8.5px] font-bold px-2 py-1 rounded-lg text-white"
                    style={{ backgroundColor: s.level >= 4 ? colors.primary : tint(colors.primary, 0.35) }}>
                    <InlineText item={s} field="name" value={s.name} />
                  </span>
                ))}
              </div>
            </Tile>
          )}

          {options.showLanguages && languages.length > 0 && (
            <Tile label={t.languages}>
              <div className="space-y-1">
                {languages.map(l => (
                  <div key={l.id} className="flex justify-between items-center">
                    <span className="text-[9.5px] font-semibold text-slate-700"><InlineText item={l} field="name" value={l.name} /></span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: colors.accent }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </Tile>
          )}

          {options.showHobbies && hobbies.length > 0 && (
            <Tile label={t.hobbies}>
              <div className="grid grid-cols-2 gap-1">
                {hobbies.map(h => (
                  <span key={h.id} className="text-[8.5px] text-center py-1 rounded-md bg-white font-medium" style={{ color: colors.accent }}><InlineText item={h} field="name" value={h.name} /></span>
                ))}
              </div>
            </Tile>
          )}
        </div>

        {options.showEducation && education.length > 0 && (
          <Tile label={t.education} span="col-span-3">
            <div className="space-y-2">
              {education.map(e => (
                <div key={e.id} className="bg-white rounded-lg p-2">
                  <h3 className="text-[10px] font-bold text-slate-900 leading-tight"><InlineText item={e} field="degree" value={e.degree} /></h3>
                  <p className="text-[9px] font-semibold" style={{ color: colors.primary }}><InlineText item={e} field="school" value={e.school} /></p>
                  <p className="text-[8px] text-slate-400">{formatDate(e.startDate)} — {formatDate(e.endDate)}{e.location && ` · ${e.location}`}</p>
                </div>
              ))}
            </div>
          </Tile>
        )}

        {options.showProjects && projects.length > 0 && (
          <Tile label={t.projects} span="col-span-3">
            <div className="space-y-1.5">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-lg p-2">
                  <h3 className="text-[10px] font-bold text-slate-900"><InlineText item={p} field="name" value={p.name} /></h3>
                  {p.description && <p className="text-[9px] text-slate-600 mt-0.5 leading-snug"><InlineText item={p} field="description" value={p.description} multiline /></p>}
                  {p.technologies && <p className="text-[8px] font-bold mt-0.5" style={{ color: colors.primary }}>{p.technologies}</p>}
                </div>
              ))}
            </div>
          </Tile>
        )}

        {options.showCertifications && certifications.length > 0 && (
          <Tile label={t.certifications} span={options.showReferences && references.length > 0 ? 'col-span-3' : 'col-span-6'}>
            <div className="space-y-1">
              {certifications.map(c => (
                <div key={c.id} className="flex justify-between items-baseline gap-2">
                  <span className="text-[9.5px] font-bold text-slate-800 leading-tight">{c.name}</span>
                  <span className="text-[8px] text-slate-500 whitespace-nowrap">{c.issuer}{c.date && ` · ${formatDate(c.date)}`}</span>
                </div>
              ))}
            </div>
          </Tile>
        )}

        {options.showReferences && references.length > 0 && (
          <Tile label={t.references} span={options.showCertifications && certifications.length > 0 ? 'col-span-3' : 'col-span-6'}>
            <div className="grid grid-cols-2 gap-2">
              {references.map(r => (
                <div key={r.id} className="text-[9px]">
                  <p className="font-bold text-slate-800">{r.name}</p>
                  <p className="text-slate-500">{r.position}{r.company && `, ${r.company}`}</p>
                  <p style={{ color: colors.primary }}>{r.contact}</p>
                </div>
              ))}
            </div>
          </Tile>
        )}
      </div>
    </div>
  );
}
