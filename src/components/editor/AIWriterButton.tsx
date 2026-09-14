import { useState } from 'react';
import type { CVLanguage } from '../../i18n/labels';
import {
  generateProfessionalText,
  generateWithAI,
  loadAISettings,
  saveAISettings,
  hasActiveKey,
  buildProfileContextFromStorage,
  TONE_LABELS,
  GROQ_MODELS,
  GEMINI_MODELS,
  type WritingKind,
  type AISettings,
  type AIProvider,
  type CVTone,
} from '../../utils/aiWriter';

interface Props {
  kind: WritingKind;
  language: CVLanguage;
  value: string;
  onApply: (value: string) => void;
  context?: {
    role?: string;
    company?: string;
    school?: string;
    project?: string;
    technologies?: string;
  };
}

const KIND_LABELS: Record<WritingKind, { title: string; placeholder: string; hint: string }> = {
  summary: {
    title: 'Améliorer mon profil',
    placeholder: 'Ex : React, gestion de projet, relation client, 5 ans…',
    hint: 'Donnez quelques mots-clés : l’assistant construit une accroche professionnelle.',
  },
  experience: {
    title: 'Formuler cette expérience',
    placeholder: 'Ex : gérer une équipe, améliorer les ventes de 20 %, créer le site…',
    hint: 'Indiquez vos missions, outils et résultats, même en vrac.',
  },
  education: {
    title: 'Décrire cette formation',
    placeholder: 'Ex : spécialisation data, mention bien, projet de fin d’études…',
    hint: 'Ajoutez la spécialisation, les projets ou les résultats importants.',
  },
  project: {
    title: 'Présenter ce projet',
    placeholder: 'Ex : application de réservation, 2 000 utilisateurs, paiement en ligne…',
    hint: 'Décrivez l’idée, l’impact et les technologies utilisées.',
  },
};

function SparkIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.2 4.1a3.8 3.8 0 0 1-2.7 2.7L4 11l4.1 1.2a3.8 3.8 0 0 1 2.7 2.7L12 19l1.2-4.1a3.8 3.8 0 0 1 2.7-2.7L20 11l-4.1-1.2a3.8 3.8 0 0 1-2.7-2.7L12 3Z" />
      <path d="m19 3-.45 1.55A2.1 2.1 0 0 1 17.1 6L15.5 6.5l1.6.5a2.1 2.1 0 0 1 1.45 1.45L19 10l.45-1.55A2.1 2.1 0 0 1 20.9 7L22.5 6.5l-1.6-.5a2.1 2.1 0 0 1-1.45-1.45L19 3Z" />
    </svg>
  );
}

export default function AIWriterButton({ kind, language, value, onApply, context }: Props) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [showJobOffer, setShowJobOffer] = useState(false);
  const [tone, setTone] = useState<CVTone>('classique');
  const [variants, setVariants] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AISettings>(() => loadAISettings());
  const [showSettings, setShowSettings] = useState(false);
  const labels = KIND_LABELS[kind];
  const aiReady = hasActiveKey(settings);

  const openAssistant = () => {
    setPrompt('');
    setVariants([]);
    setError(null);
    setOpen(true);
  };

  const persist = (next: AISettings) => {
    setSettings(next);
    saveAISettings(next);
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    const ctx = {
      kind, language, tone, prompt, existing: value,
      variants: aiReady ? 3 : 1,
      jobOffer: jobOffer.trim() || undefined,
      profileContext: buildProfileContextFromStorage(),
      ...context,
    };
    try {
      if (aiReady) {
        const results = await generateWithAI(ctx, settings);
        setVariants(results);
        setSelected(0);
      } else {
        setVariants([generateProfessionalText(ctx)]);
        setSelected(0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      // repli automatique sur le générateur local
      setVariants([generateProfessionalText(ctx)]);
      setSelected(0);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openAssistant}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
        title="Ouvrir l'assistant de rédaction"
      >
        <SparkIcon className="w-3 h-3" />
        Assistant IA
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-5 bg-slate-900/55 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-sheet">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <SparkIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{labels.title}</h3>
                <p className="text-[10px] text-slate-500">
                  {aiReady
                    ? `IA connectée · ${settings.provider === 'groq' ? 'Groq' : 'Gemini'} · vos clés restent dans votre navigateur`
                    : 'Assistant local · connectez Groq ou Gemini pour une IA réelle'}
                </p>
              </div>
              <button type="button" onClick={() => setShowSettings(v => !v)}
                className={`p-2 rounded-lg text-slate-400 hover:bg-slate-100 ${showSettings ? 'bg-slate-100 text-indigo-600' : ''}`}
                title="Réglages IA (Groq / Gemini)" aria-label="Réglages IA">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.3 4.3a1.7 1.7 0 0 1 3.4 0 1.7 1.7 0 0 0 2.5 1.1 1.7 1.7 0 0 1 2.4 2.4 1.7 1.7 0 0 0 1.1 2.5 1.7 1.7 0 0 1 0 3.4 1.7 1.7 0 0 0-1.1 2.5 1.7 1.7 0 0 1-2.4 2.4 1.7 1.7 0 0 0-2.5 1.1 1.7 1.7 0 0 1-3.4 0 1.7 1.7 0 0 0-2.5-1.1 1.7 1.7 0 0 1-2.4-2.4 1.7 1.7 0 0 0-1.1-2.5 1.7 1.7 0 0 1 0-3.4 1.7 1.7 0 0 0 1.1-2.5 1.7 1.7 0 0 1 2.4-2.4 1.7 1.7 0 0 0 2.5-1.1Z" /><circle cx="12" cy="12" r="2.5" /></svg>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg" aria-label="Fermer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-4 sm:max-h-[65vh] sm:overflow-y-auto">
              {showSettings && (
                <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3 animate-fadeIn">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-700">Réglages IA</p>
                  <div className="flex gap-2">
                    {(['groq', 'gemini'] as AIProvider[]).map(p => (
                      <button key={p} type="button"
                        onClick={() => persist({ ...settings, provider: p, model: p === 'groq' ? GROQ_MODELS[0].id : GEMINI_MODELS[0].id })}
                        className={`flex-1 h-9 rounded-lg text-[11px] font-bold border transition-colors ${settings.provider === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                        {p === 'groq' ? '⚡ Groq' : '✦ Gemini'}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Clé API {settings.provider === 'groq' ? 'Groq (console.groq.com)' : 'Google AI Studio (aistudio.google.com)'}
                    </label>
                    <input
                      type="password"
                      value={settings.provider === 'groq' ? settings.groqKey : settings.geminiKey}
                      onChange={e => persist({ ...settings, [settings.provider === 'groq' ? 'groqKey' : 'geminiKey']: e.target.value })}
                      placeholder={settings.provider === 'groq' ? 'gsk_…' : 'AIza…'}
                      className="w-full h-9 px-3 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Modèle</label>
                    <select
                      value={settings.model}
                      onChange={e => persist({ ...settings, model: e.target.value })}
                      className="w-full h-9 px-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                      {(settings.provider === 'groq' ? GROQ_MODELS : GEMINI_MODELS).map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500">La clé est stockée uniquement dans ce navigateur (localStorage). Sans clé, l’assistant local est utilisé.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ton du texte</label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(TONE_LABELS) as CVTone[]).map(t => (
                    <button key={t} type="button" onClick={() => setTone(t)}
                      className={`px-2.5 h-7 rounded-full text-[10px] font-bold border transition-colors ${tone === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                      {TONE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quelques mots ou phrases</label>
                <textarea
                  autoFocus
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  placeholder={labels.placeholder}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">{labels.hint}</p>
              </div>

              <div>
                <button type="button" onClick={() => setShowJobOffer(v => !v)} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">
                  {showJobOffer ? '− Masquer' : '+ Cibler'} une offre d’emploi
                </button>
                {showJobOffer && (
                  <textarea
                    value={jobOffer}
                    onChange={e => setJobOffer(e.target.value)}
                    rows={4}
                    placeholder="Collez ici l’annonce : l’IA adaptera le texte aux mots-clés de l’offre, sans inventer d’informations."
                    className="mt-1.5 w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              {value && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Texte actuel</p>
                  <p className="text-[11px] text-slate-600 line-clamp-3 whitespace-pre-line">{value}</p>
                </div>
              )}

              <button type="button" onClick={generate} disabled={generating}
                className="w-full h-11 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
                <SparkIcon />
                {generating ? 'Rédaction en cours…' : aiReady ? 'Générer 3 versions avec l’IA' : 'Générer une description (local)'}
              </button>

              {error && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-[11px] text-amber-800 font-semibold">⚠ {error}</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Une version locale a été générée en attendant.</p>
                </div>
              )}

              {variants.length > 0 && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {variants.length > 1 ? `${variants.length} versions proposées` : 'Proposition de l’assistant'}
                    </label>
                    {variants.length > 1 && (
                      <div className="flex gap-1">
                        {variants.map((_, i) => (
                          <button key={i} type="button" onClick={() => setSelected(i)}
                            className={`w-6 h-6 rounded-md text-[10px] font-bold border ${selected === i ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea
                    value={variants[selected] ?? ''}
                    onChange={e => setVariants(vs => vs.map((v, i) => i === selected ? e.target.value : v))}
                    rows={kind === 'experience' ? 6 : 4}
                    className="w-full px-3 py-2.5 text-sm border border-emerald-200 bg-emerald-50/40 rounded-xl outline-none resize-y focus:ring-2 focus:ring-emerald-500" />
                  <div className="flex justify-end gap-2 mt-3">
                    <button type="button" onClick={() => setOpen(false)} className="h-10 px-4 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                    <button type="button" onClick={() => { onApply(variants[selected] ?? ''); setOpen(false); }} className="h-10 px-4 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg">Insérer dans le CV</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
