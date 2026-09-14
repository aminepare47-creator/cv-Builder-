import { CVData, Experience } from '../../types/cv';
import AIWriterButton from './AIWriterButton';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ExperienceSection({ data, onChange }: Props) {
  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange({
      ...data,
      experiences: data.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter(exp => exp.id !== id) });
  };

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    const idx = data.experiences.findIndex(e => e.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === data.experiences.length - 1)) return;
    const newArr = [...data.experiences];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newArr[idx], newArr[targetIdx]] = [newArr[targetIdx], newArr[idx]];
    onChange({ ...data, experiences: newArr });
  };

  return (
    <div className="space-y-3">
      {data.experiences.map((exp, idx) => (
        <div key={exp.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Expérience #{idx + 1}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => moveExperience(exp.id, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed" title="Monter">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </button>
              <button onClick={() => moveExperience(exp.id, 'down')} disabled={idx === data.experiences.length - 1} className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed" title="Descendre">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button onClick={() => removeExperience(exp.id)} className="p-1 text-slate-400 hover:text-red-500" title="Supprimer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Poste</label>
              <input type="text" value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" placeholder="Ex: Développeur Senior" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Entreprise</label>
              <input type="text" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Lieu</label>
            <input type="text" value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" placeholder="Paris, France" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date de début</label>
              <input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date de fin</label>
              <input type="month" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white disabled:bg-slate-100 disabled:cursor-not-allowed" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded" />
            <span>J'occupe actuellement ce poste</span>
          </label>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-medium text-slate-600">Description</label>
              <AIWriterButton
                kind="experience"
                language={data.language}
                value={exp.description}
                onApply={(value) => updateExperience(exp.id, 'description', value)}
                context={{ role: exp.position, company: exp.company }}
              />
            </div>
            <textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} rows={3} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-white" placeholder="• Décrivez vos missions et réalisations..." />
          </div>
        </div>
      ))}

      <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        Ajouter une expérience
      </button>
    </div>
  );
}
