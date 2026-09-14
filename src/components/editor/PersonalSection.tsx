import { useState } from 'react';
import { CVData } from '../../types/cv';
import PhotoStudio from '../PhotoStudio';
import AIWriterButton from './AIWriterButton';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

export default function PersonalSection({ data, onChange }: Props) {
  const [studioOpen, setStudioOpen] = useState(false);

  const update = (field: keyof CVData['personal'], value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  return (
    <div className="space-y-4">
      <PhotoStudio open={studioOpen} onClose={() => setStudioOpen(false)} onApply={(url) => update('photo', url)} />
      <div className="flex items-start gap-4 mb-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {data.personal.photo ? (
              <img src={data.personal.photo} alt="Profil" className="w-20 h-[104px] rounded-xl object-cover border-2 border-slate-200 shadow-sm" />
            ) : (
              <div className="w-20 h-[104px] rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 gap-1">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[8px] uppercase tracking-wide">Optionnel</span>
              </div>
            )}
            <button
              onClick={() => setStudioOpen(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-md"
              title="Ouvrir le studio photo"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <button onClick={() => setStudioOpen(true)} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">
            {data.personal.photo ? 'Modifier' : 'Ajouter'}
          </button>
          {data.personal.photo && (
            <button onClick={() => update('photo', '')} className="text-[10px] text-slate-400 hover:text-red-500">Retirer</button>
          )}
        </div>
        <div className="flex-1 grid grid-cols-1 xs:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Prénom</label>
            <input type="text" value={data.personal.firstName} onChange={(e) => update('firstName', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nom</label>
            <input type="text" value={data.personal.lastName} onChange={(e) => update('lastName', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Titre professionnel</label>
        <input type="text" value={data.personal.title} onChange={(e) => update('title', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Ex: Responsable commercial, Infirmière, Graphiste..." />
        <p className="text-[10px] text-slate-400 mt-1">Tous les métiers sont pris en charge : commerce, santé, enseignement, artisanat, industrie, communication, administration et plus encore.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input type="email" value={data.personal.email} onChange={(e) => update('email', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
          <input type="tel" value={data.personal.phone} onChange={(e) => update('phone', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
        <input type="text" value={data.personal.address} onChange={(e) => update('address', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Code postal</label>
          <input type="text" value={data.personal.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Ville</label>
          <input type="text" value={data.personal.city} onChange={(e) => update('city', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Pays</label>
          <input type="text" value={data.personal.country} onChange={(e) => update('country', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">LinkedIn</label>
          <input type="text" value={data.personal.linkedIn} onChange={(e) => update('linkedIn', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="linkedin.com/in/..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Site web</label>
          <input type="text" value={data.personal.website} onChange={(e) => update('website', e.target.value)} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="monsite.com" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="block text-xs font-medium text-slate-600">Résumé professionnel</label>
          <AIWriterButton
            kind="summary"
            language={data.language}
            value={data.personal.summary}
            onApply={(value) => update('summary', value)}
            context={{ role: data.personal.title }}
          />
        </div>
        <textarea value={data.personal.summary} onChange={(e) => update('summary', e.target.value)} rows={4} className="w-full px-3 py-2.5 lg:py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none" placeholder="Décrivez votre profil professionnel en quelques lignes..." />
        <p className="text-[10px] text-slate-400 mt-1">{data.personal.summary.length} caractères</p>
      </div>
    </div>
  );
}
