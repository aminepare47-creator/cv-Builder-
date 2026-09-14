import { CVData, TEMPLATES, COLOR_MAP, TemplateType, ColorScheme, CVOptions } from '../../types/cv';
import { LANGUAGES } from '../../i18n/labels';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const FONT_LABELS = { sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace' };
const SIZE_LABELS = { sm: 'Petit', md: 'Moyen', lg: 'Grand' };
const SPACING_LABELS = { compact: 'Compact', normal: 'Normal', relaxed: 'Aéré' };

export default function DesignSection({ data, onChange }: Props) {
  const updateOption = <K extends keyof CVOptions>(field: K, value: CVOptions[K]) => {
    onChange({ ...data, options: { ...data.options, [field]: value } });
  };

  const toggleOption = (field: keyof CVOptions) => {
    onChange({ ...data, options: { ...data.options, [field]: !data.options[field] } });
  };

  return (
    <div className="space-y-6">
      {/* Langue du CV */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <span className="text-base">🌍</span> Langue du CV
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Traduit automatiquement les titres de sections et les dates. Vos textes restent tels que vous les avez saisis.
        </p>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => onChange({ ...data, language: l.code })}
              className={`px-2 py-2 border-2 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                data.language === l.code ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              title={l.name}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="text-[10px] font-semibold text-slate-800">{l.native}</span>
              <span className="text-[9px] text-slate-400">{l.name}</span>
            </button>
          ))}
        </div>
        {data.language === 'ar' && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-2">
            Mode droite-à-gauche (RTL) activé pour l'arabe.
          </p>
        )}
      </div>

      {/* Templates */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">🎨</span> Modèle de CV
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">{TEMPLATES.length} modèles disponibles — cliquez pour un aperçu instantané.</p>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
          {TEMPLATES.map(template => {
            const active = data.template === template.id;
            return (
              <button
                key={template.id}
                onClick={() => onChange({ ...data, template: template.id as TemplateType })}
                className={`relative p-2.5 border-2 rounded-xl text-left transition-all ${
                  active ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
                }`}
              >
                {template.badge && !active && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow">
                    {template.badge}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-11 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                    active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {template.preview}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{template.name}</p>
                    <p className="text-[9.5px] text-slate-500 leading-tight mt-0.5">{template.description}</p>
                    {active && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-600 font-bold mt-1">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Sélectionné
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">🎨</span> Couleur principale
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
          {(Object.keys(COLOR_MAP) as ColorScheme[]).map(color => {
            const c = COLOR_MAP[color];
            return (
              <button
                key={color}
                onClick={() => onChange({ ...data, color })}
                className={`p-2 border-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
                  data.color === color ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
                title={c.name}
              >
                <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: c.primary }} />
                <span className="text-[10px] font-medium text-slate-700">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">🔤</span> Typographie
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Police</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FONT_LABELS) as Array<keyof typeof FONT_LABELS>).map(font => (
                <button
                  key={font}
                  onClick={() => updateOption('fontFamily', font)}
                  className={`px-2 py-2.5 text-xs border-2 rounded-lg transition-all ${
                    data.options.fontFamily === font
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  } ${font === 'sans' ? 'font-sans' : font === 'serif' ? 'font-serif' : 'font-mono'}`}
                >
                  {FONT_LABELS[font]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Taille</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SIZE_LABELS) as Array<keyof typeof SIZE_LABELS>).map(size => (
                <button
                  key={size}
                  onClick={() => updateOption('fontSize', size)}
                  className={`px-2 py-2.5 text-xs border-2 rounded-lg transition-all ${
                    data.options.fontSize === size
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Espacement</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SPACING_LABELS) as Array<keyof typeof SPACING_LABELS>).map(spacing => (
                <button
                  key={spacing}
                  onClick={() => updateOption('spacing', spacing)}
                  className={`px-2 py-2.5 text-xs border-2 rounded-lg transition-all ${
                    data.options.spacing === spacing
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {SPACING_LABELS[spacing]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sections to display */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">⚙️</span> Sections affichées
        </h3>
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg">
          {[
            { key: 'showPhoto', label: 'Photo', icon: '📷' },
            { key: 'showSummary', label: 'Résumé / Profil', icon: '✨' },
            { key: 'showExperience', label: 'Expériences professionnelles', icon: '💼' },
            { key: 'showEducation', label: 'Formation', icon: '🎓' },
            { key: 'showSkills', label: 'Compétences', icon: '🚀' },
            { key: 'showLanguages', label: 'Langues', icon: '🌐' },
            { key: 'showHobbies', label: 'Centres d\'intérêt', icon: '🎯' },
            { key: 'showProjects', label: 'Projets', icon: '💡' },
            { key: 'showCertifications', label: 'Certifications', icon: '🏆' },
            { key: 'showReferences', label: 'Références', icon: '👥' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
              <input
                type="checkbox"
                checked={data.options[item.key as keyof CVOptions] as boolean}
                onChange={() => toggleOption(item.key as keyof CVOptions)}
                className="rounded text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm">{item.icon}</span>
              <span className="text-xs text-slate-700 flex-1">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
