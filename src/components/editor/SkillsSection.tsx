import { CVData, Skill } from '../../types/cv';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function SkillsSection({ data, onChange }: Props) {
  const addSkill = () => {
    const newSkill: Skill = { id: generateId(), name: '', level: 3, category: 'Savoir-faire' };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    onChange({
      ...data,
      skills: data.skills.map(s => s.id === id ? { ...s, [field]: value } : s),
    });
  };

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  return (
    <div className="space-y-2">
      {data.skills.map((skill) => (
        <div key={skill.id} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-2">
            <input type="text" value={skill.name} onChange={(e) => updateSkill(skill.id, 'name', e.target.value)} placeholder="Compétence" className="flex-1 min-w-0 px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            <button onClick={() => removeSkill(skill.id)} className="p-1.5 text-slate-400 hover:text-red-500 active:bg-slate-200 rounded flex-shrink-0" aria-label="Supprimer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select value={skill.category} onChange={(e) => updateSkill(skill.id, 'category', e.target.value)} className="flex-1 min-w-0 px-2 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white">
              <option>Savoir-faire</option>
              <option>Métier</option>
              <option>Relationnel</option>
              <option>Outils</option>
              <option>Langues</option>
              <option>Autre</option>
            </select>
            <div className="flex items-center gap-1.5 flex-shrink-0 px-1">
              {[1, 2, 3, 4, 5].map(level => (
                <button key={level} onClick={() => updateSkill(skill.id, 'level', level)} className={`w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full transition-colors ${level <= skill.level ? 'bg-indigo-500' : 'bg-slate-300 hover:bg-slate-400'}`} title={`Niveau ${level}`} />
              ))}
            </div>
          </div>
        </div>
      ))}
      <button onClick={addSkill} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        Ajouter une compétence
      </button>
    </div>
  );
}
