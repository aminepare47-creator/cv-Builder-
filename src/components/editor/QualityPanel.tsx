import { useMemo, useState } from 'react';
import type { CVData } from '../../types/cv';
import { COLOR_MAP } from '../../types/cv';
import { computeCVScore, scoreGrade } from '../../utils/cvScore';
import { analyzeJobOffer } from '../../utils/aiWriter';
import { buildPlainText } from '../../utils/cvExportText';

interface Props {
  data: CVData;
}

/** Analyse qualité (note /100) + compatibilité offre d'emploi (Priorités 1 & 6). */
export default function QualityPanel({ data }: Props) {
  const score = useMemo(() => computeCVScore(data), [data]);
  const accent = COLOR_MAP[data.color].primary;

  const ring = (v: number) => {
    const r = 34, c = 2 * Math.PI * r;
    return { strokeDasharray: `${(v / 100) * c} ${c}` };
  };

  return (
    <div className="space-y-5">
      {/* Note globale */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" style={ring(score.total)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-slate-900">{score.total}</span>
            <span className="text-[8px] text-slate-400 font-bold">/100</span>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">Score qualité du CV</h3>
          <p className="text-[11px] text-slate-600">
            {scoreGrade(score.total)} · Compatibilité ATS estimée : <b>{score.atsScore}%</b>
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {score.criteria.slice(0, 6).map(c => (
              <span key={c.key} className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${c.score >= 70 ? 'bg-emerald-100 text-emerald-700' : c.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                {c.label} {Math.round(c.score)}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Détail des 12 critères */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Détail des critères</p>
        <div className="space-y-1.5">
          {score.criteria.map(c => (
            <div key={c.key} className="flex items-center gap-2">
              <span className="w-36 flex-shrink-0 text-[11px] text-slate-600 truncate">{c.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(c.score)}%`, backgroundColor: c.score >= 70 ? '#059669' : c.score >= 40 ? '#d97706' : '#dc2626' }} />
              </div>
              <span className="w-8 text-right text-[10px] font-bold text-slate-700 tabular-nums">{Math.round(c.score)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Recommandations</p>
        <ul className="space-y-1.5">
          {score.recommendations.map((r, i) => (
            <li key={i} className="text-[11px] flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-slate-700">
              <span>💡</span><span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Analyse ATS */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Compatibilité ATS</p>
        <div className="p-3 rounded-xl border border-slate-200 space-y-2">
          {score.criteria.filter(c => ['ats', 'structure', 'dates', 'quantified'].includes(c.key)).map(c => (
            <p key={c.key} className="text-[11px] text-slate-600 flex gap-2">
              <span className="flex-shrink-0">{c.score >= 70 ? '✅' : c.score >= 40 ? '⚠️' : '❌'}</span>
              <span><b>{c.label} :</b> {c.advice}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Offre d'emploi */}
      <JobOfferMatcher data={data} />
    </div>
  );
}

/** Comparaison CV ↔ offre collée : compétences manquantes, mots-clés, taux ATS. */
function JobOfferMatcher({ data }: { data: CVData }) {
  const [offer, setOffer] = useState('');
  const analysis = useMemo(() => {
    if (offer.trim().length < 40) return null;
    return analyzeJobOffer(buildPlainText(data), offer);
  }, [offer, data]);

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Adapter le CV à une offre</p>
      <textarea
        value={offer}
        onChange={e => setOffer(e.target.value)}
        rows={5}
        placeholder="Collez ici l’annonce d’emploi : missions, compétences demandées, mots-clés…"
        className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {analysis && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className={`text-2xl font-black ${analysis.atsRate >= 70 ? 'text-emerald-600' : analysis.atsRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
              {analysis.atsRate}%
            </span>
            <p className="text-[11px] text-slate-600 flex-1">Taux de compatibilité avec cette offre (mots-clés présents dans votre CV).</p>
          </div>
          {analysis.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.map(k => (
                <span key={k.word} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${k.present ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {k.present ? '✓' : '✕'} {k.word}
                </span>
              ))}
            </div>
          )}
          {analysis.missing.length > 0 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-[11px] font-bold text-red-800 mb-1">Compétences / mots-clés manquants</p>
              <p className="text-[11px] text-red-700">{analysis.missing.join(' · ')}</p>
              <p className="text-[10px] text-red-600/70 mt-1.5">Ajoutez ces termes s’ils correspondent réellement à votre expérience — n’inventez rien.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

