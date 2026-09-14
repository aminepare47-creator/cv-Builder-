import { useRef, useState } from 'react';
import { CVData, createEmptyCV } from '../types/cv';
import { extractTextFromFile, parseCVText, improveCV } from '../utils/cvImport';

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (data: CVData) => void;
  current: CVData;
}

type Mode = 'file' | 'paste';

export default function ImportCVModal({ open, onClose, onImport, current }: Props) {
  const [mode, setMode] = useState<Mode>('file');
  const [pasted, setPasted] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: CVData; stats: Record<string, number>; improvements: string[] } | null>(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const close = () => {
    setResult(null); setError(null); setPasted(''); setFileName('');
    onClose();
  };

  const runFile = async (file: File) => {
    setLoading(true); setError(null); setResult(null); setFileName(file.name);
    try {
      const { text, json } = await extractTextFromFile(file);
      if (json) {
        const merged = { ...createEmptyCV(), ...json } as CVData;
        const { data, improvements } = improveCV(merged);
        setResult({
          data,
          stats: {
            experiences: data.experiences.length, education: data.education.length,
            skills: data.skills.length, languages: data.languages.length,
            projects: data.projects.length, certifications: data.certifications.length,
          },
          improvements: ['Sauvegarde JSON restaurée intégralement', ...improvements],
        });
      } else {
        if (text.trim().length < 40) throw new Error('Très peu de texte détecté : ce PDF est probablement une image scannée. Copiez-collez le texte dans l\'onglet « Coller le texte ».');
        const r = parseCVText(text, current);
        setResult(r);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Import impossible.');
    } finally {
      setLoading(false);
    }
  };

  const runPaste = () => {
    setLoading(true); setError(null); setResult(null);
    try {
      if (pasted.trim().length < 40) throw new Error('Collez au moins quelques lignes de votre CV.');
      setResult(parseCVText(pasted, current));
    } catch (e: any) {
      setError(e?.message ?? 'Analyse impossible.');
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!result) return;
    // on conserve la photo déjà validée dans le studio photo
    const merged: CVData = {
      ...result.data,
      personal: { ...result.data.personal, photo: result.data.personal.photo || current.personal.photo },
      template: current.template,
      color: current.color,
      language: current.language,
      options: current.options,
    };
    onImport(merged);
    close();
  };

  const STAT_LABELS: Record<string, string> = {
    experiences: 'Expériences', education: 'Formations', skills: 'Compétences',
    languages: 'Langues', projects: 'Projets', certifications: 'Certifications',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-3xl h-[92dvh] sm:h-auto sm:max-h-[92vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-sheet">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">📄 Importer un CV existant</h2>
            <p className="text-[11px] text-slate-500">Le système extrait vos informations, les structure et les améliore automatiquement.</p>
          </div>
          <button onClick={close} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {!result && (
            <>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-4">
                {([['file', '📎 Fichier'], ['paste', '📋 Coller le texte']] as [Mode, string][]).map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === m ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'file' ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) runFile(f); }}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl mb-3">📥</div>
                  <p className="text-sm font-semibold text-slate-800">Déposez votre CV ou cliquez pour parcourir</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT ou sauvegarde JSON</p>
                  <input ref={inputRef} type="file" accept=".pdf,.txt,.md,.json,.docx" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) runFile(f); e.target.value = ''; }} />
                </div>
              ) : (
                <div>
                  <textarea value={pasted} onChange={e => setPasted(e.target.value)} rows={12}
                    placeholder={"Collez ici le contenu de votre CV…\n\nExemple :\nMarie Martin\nCheffe de projet digital\nmarie@email.com · 06 12 34 56 78 · Lyon\n\nEXPÉRIENCE\n2021 - Présent — Cheffe de projet — Agence Web, Lyon\n- Pilotage de 12 projets clients\n\nFORMATION\n2016 - 2019 — Master Marketing — Université Lyon 3\n\nCOMPÉTENCES\nAgile, Jira, SEO, Google Analytics"}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono" />
                  <button onClick={runPaste} disabled={loading}
                    className="mt-3 w-full sm:w-auto px-4 h-11 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60">
                    {loading ? 'Analyse…' : 'Analyser le CV'}
                  </button>
                </div>
              )}

              {loading && mode === 'file' && <p className="text-center text-xs text-indigo-600 mt-4">Lecture et analyse de {fileName}…</p>}
              {error && <p className="text-xs text-red-700 mt-4 bg-red-50 border border-red-100 p-3 rounded-lg">{error}</p>}

              <div className="mt-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-900 mb-2">Ce que fait l'analyse automatique</p>
                <ul className="text-[11px] text-indigo-900/80 space-y-1">
                  <li>• Extraction de l'identité, du contact, des dates et des sections</li>
                  <li>• Reformatage des missions en puces claires et homogènes</li>
                  <li>• Tri antéchronologique des expériences et formations</li>
                  <li>• Dédoublonnage et catégorisation des compétences</li>
                  <li>• Génération d'une accroche professionnelle si elle manque</li>
                  <li>• Conseils personnalisés pour renforcer l'impact du CV</li>
                </ul>
              </div>
            </>
          )}

          {result && (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg">✓</span>
                <div>
                  <p className="text-sm font-bold text-emerald-900">CV analysé et amélioré</p>
                  <p className="text-[11px] text-emerald-800/80">
                    {result.data.personal.firstName || result.data.personal.lastName
                      ? `Profil détecté : ${result.data.personal.firstName} ${result.data.personal.lastName}`
                      : 'Profil extrait — vérifiez les champs avant export'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                {Object.entries(result.stats).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg border border-slate-200 text-center">
                    <p className="text-lg font-bold text-slate-900">{v}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wide">{STAT_LABELS[k] ?? k}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-slate-800 mb-2">Améliorations appliquées</p>
                <ul className="space-y-1">
                  {result.improvements.map((i, idx) => (
                    <li key={idx} className={`text-[11px] flex items-start gap-2 p-2 rounded-lg ${i.startsWith('Conseil') ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-700'}`}>
                      <span>{i.startsWith('Conseil') ? '💡' : '✓'}</span>
                      <span>{i.replace(/^Conseil\s*:\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 max-h-40 overflow-y-auto scrollbar-thin">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Aperçu des données</p>
                <p className="text-[11px] text-slate-700"><b>Titre :</b> {result.data.personal.title || '—'}</p>
                <p className="text-[11px] text-slate-700"><b>Email :</b> {result.data.personal.email || '—'} · <b>Tél :</b> {result.data.personal.phone || '—'}</p>
                <p className="text-[11px] text-slate-700 mt-1"><b>Accroche :</b> {result.data.personal.summary.slice(0, 220)}…</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button onClick={close} className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg">Annuler</button>
          {result && (
            <div className="flex gap-2">
              <button onClick={() => setResult(null)} className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-lg">← Réessayer</button>
              <button onClick={apply}
                className="px-4 h-10 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 whitespace-nowrap">
                Appliquer au CV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
