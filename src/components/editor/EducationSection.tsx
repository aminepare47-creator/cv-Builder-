import { CVData, Education } from '../../types/cv';
import AIWriterButton from './AIWriterButton';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function EducationSection({ data, onChange }: Props) {
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(edu => edu.id !== id) });
  };

  return (
    <div className="space-y-3">
      {data.education.map((edu, idx) => (
        <div key={edu.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Formation #{idx + 1}</span>
            <button onClick={() => removeEducation(edu.id)} className="p-1 text-slate-400 hover:text-red-500" title="Supprimer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Diplôme</label>
            <input type="text" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" placeholder="Ex: Master, CAP, Licence, Formation professionnelle..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">École / Université</label>
              <input type="text" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lieu</label>
              <input type="text" value={edu.location} onChange={(e) => updateEducation(edu.id, 'location', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Début</label>
              <input type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fin</label>
              <input type="month" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-medium text-slate-600">Description (optionnel)</label>
              <AIWriterButton
                kind="education"
                language={data.language}
                value={edu.description}
                onApply={(value) => updateEducation(edu.id, 'description', value)}
                context={{ school: edu.school, role: edu.degree }}
              />
            </div>
            <textarea value={edu.description} onChange={(e) => updateEducation(edu.id, 'description', e.target.value)} rows={2} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-white" placeholder="Spécialisation, mention, projets..." />
          </div>
        </div>
      ))}

      <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        Ajouter une formation
      </button>
    </div>
  );
}
