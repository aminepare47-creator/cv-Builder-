import { CVData, Language, Hobby, Project, Certification, Reference, LANGUAGE_LEVELS } from '../../types/cv';
import AIWriterButton from './AIWriterButton';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

function ListEditor<T extends { id: string }>({
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel,
  emptyText,
}: {
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
  addLabel: string;
  emptyText: string;
}) {
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-slate-400 italic text-center py-4">{emptyText}</p>
      )}
      {items.map(item => (
        <div key={item.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2 relative">
          <button onClick={() => onRemove(item.id)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {renderItem(item)}
        </div>
      ))}
      <button onClick={onAdd} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        {addLabel}
      </button>
    </div>
  );
}

export default function OtherSections({ data, onChange }: Props) {
  // Languages
  const addLanguage = () => {
    onChange({ ...data, languages: [...data.languages, { id: generateId(), name: '', level: 'B2' }] });
  };
  const updateLanguage = (id: string, lang: Language) => {
    onChange({ ...data, languages: data.languages.map(l => l.id === id ? lang : l) });
  };
  const removeLanguage = (id: string) => {
    onChange({ ...data, languages: data.languages.filter(l => l.id !== id) });
  };

  // Hobbies
  const addHobby = () => {
    onChange({ ...data, hobbies: [...data.hobbies, { id: generateId(), name: '' }] });
  };
  const updateHobby = (id: string, hobby: Hobby) => {
    onChange({ ...data, hobbies: data.hobbies.map(h => h.id === id ? hobby : h) });
  };
  const removeHobby = (id: string) => {
    onChange({ ...data, hobbies: data.hobbies.filter(h => h.id !== id) });
  };

  // Projects
  const addProject = () => {
    onChange({ ...data, projects: [...data.projects, { id: generateId(), name: '', description: '', link: '', technologies: '' }] });
  };
  const updateProject = (id: string, proj: Project) => {
    onChange({ ...data, projects: data.projects.map(p => p.id === id ? proj : p) });
  };
  const removeProject = (id: string) => {
    onChange({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  // Certifications
  const addCert = () => {
    onChange({ ...data, certifications: [...data.certifications, { id: generateId(), name: '', issuer: '', date: '', link: '' }] });
  };
  const updateCert = (id: string, cert: Certification) => {
    onChange({ ...data, certifications: data.certifications.map(c => c.id === id ? cert : c) });
  };
  const removeCert = (id: string) => {
    onChange({ ...data, certifications: data.certifications.filter(c => c.id !== id) });
  };

  // References
  const addRef = () => {
    onChange({ ...data, references: [...data.references, { id: generateId(), name: '', position: '', company: '', contact: '' }] });
  };
  const updateRef = (id: string, ref: Reference) => {
    onChange({ ...data, references: data.references.map(r => r.id === id ? ref : r) });
  };
  const removeRef = (id: string) => {
    onChange({ ...data, references: data.references.filter(r => r.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Languages */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">🌐</span> Langues
        </h3>
        <ListEditor
          items={data.languages}
          onAdd={addLanguage}
          onRemove={removeLanguage}
          addLabel="Ajouter une langue"
          emptyText="Aucune langue ajoutée"
          renderItem={(lang) => (
            <div className="grid grid-cols-2 gap-2 pr-6">
              <input type="text" value={lang.name} onChange={(e) => updateLanguage(lang.id, { ...lang, name: e.target.value })} placeholder="Langue" className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              <select value={lang.level} onChange={(e) => updateLanguage(lang.id, { ...lang, level: e.target.value })} className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white">
                {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
        />
      </div>

      {/* Hobbies */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">🎯</span> Centres d'intérêt
        </h3>
        <ListEditor
          items={data.hobbies}
          onAdd={addHobby}
          onRemove={removeHobby}
          addLabel="Ajouter un centre d'intérêt"
          emptyText="Aucun centre d'intérêt ajouté"
          renderItem={(hobby) => (
            <input type="text" value={hobby.name} onChange={(e) => updateHobby(hobby.id, { ...hobby, name: e.target.value })} placeholder="Ex: Photographie, Voyages..." className="w-full px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white pr-6" />
          )}
        />
      </div>

      {/* Projects */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">💡</span> Projets
        </h3>
        <ListEditor
          items={data.projects}
          onAdd={addProject}
          onRemove={removeProject}
          addLabel="Ajouter un projet"
          emptyText="Aucun projet ajouté"
          renderItem={(proj) => (
            <div className="space-y-2 pr-6">
              <input type="text" value={proj.name} onChange={(e) => updateProject(proj.id, { ...proj, name: e.target.value })} placeholder="Nom du projet" className="w-full px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-medium text-slate-600">Description</label>
                  <AIWriterButton
                    kind="project"
                    language={data.language}
                    value={proj.description}
                    onApply={(value) => updateProject(proj.id, { ...proj, description: value })}
                    context={{ project: proj.name, technologies: proj.technologies }}
                  />
                </div>
                <textarea value={proj.description} onChange={(e) => updateProject(proj.id, { ...proj, description: e.target.value })} rows={2} placeholder="Description" className="w-full px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={proj.technologies} onChange={(e) => updateProject(proj.id, { ...proj, technologies: e.target.value })} placeholder="Outils, méthodes, disciplines..." aria-label="Outils, méthodes ou disciplines" className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
                <input type="text" value={proj.link} onChange={(e) => updateProject(proj.id, { ...proj, link: e.target.value })} placeholder="Lien (optionnel)" className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              </div>
            </div>
          )}
        />
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">🏆</span> Certifications
        </h3>
        <ListEditor
          items={data.certifications}
          onAdd={addCert}
          onRemove={removeCert}
          addLabel="Ajouter une certification"
          emptyText="Aucune certification ajoutée"
          renderItem={(cert) => (
            <div className="space-y-2 pr-6">
              <input type="text" value={cert.name} onChange={(e) => updateCert(cert.id, { ...cert, name: e.target.value })} placeholder="Nom de la certification" className="w-full px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={cert.issuer} onChange={(e) => updateCert(cert.id, { ...cert, issuer: e.target.value })} placeholder="Organisme" className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
                <input type="month" value={cert.date} onChange={(e) => updateCert(cert.id, { ...cert, date: e.target.value })} className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              </div>
            </div>
          )}
        />
      </div>

      {/* References */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-base">👥</span> Références
        </h3>
        <ListEditor
          items={data.references}
          onAdd={addRef}
          onRemove={removeRef}
          addLabel="Ajouter une référence"
          emptyText="Aucune référence ajoutée"
          renderItem={(ref) => (
            <div className="space-y-2 pr-6">
              <input type="text" value={ref.name} onChange={(e) => updateRef(ref.id, { ...ref, name: e.target.value })} placeholder="Nom" className="w-full px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={ref.position} onChange={(e) => updateRef(ref.id, { ...ref, position: e.target.value })} placeholder="Poste" className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
                <input type="text" value={ref.company} onChange={(e) => updateRef(ref.id, { ...ref, company: e.target.value })} placeholder="Entreprise" className="px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
              </div>
              <input type="text" value={ref.contact} onChange={(e) => updateRef(ref.id, { ...ref, contact: e.target.value })} placeholder="Contact (email ou téléphone)" className="w-full px-2.5 py-2 lg:py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white" />
            </div>
          )}
        />
      </div>
    </div>
  );
}
