import { useMemo, useState } from 'react';
import type { CVData } from '../../types/cv';
import { COLOR_MAP } from '../../types/cv';
import { computeCVScore, scoreGrade } from '../../utils/cvScore';
import { buildPlainText } from '../../utils/cvExportText';

interface Props {
  data: CVData;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const STOP_WORDS = new Set(['le', 'la', 'les', 'des', 'une', 'un', 'et', 'de', 'du', 'en', 'pour', 'avec', 'vous', 'notre', 'vos', 'sur', 'dans', 'au', 'aux', 'est', 'que', 'qui', 'nous', 'se', 'son', 'sa', 'ses', 'par', 'plus', 'tout', 'tous', 'the', 'and', 'for', 'with', 'our', 'your']);

/** Analyse d'une offre d'emploi copiée : compétences manquantes, mots-clés, taux ATS. */
function analyzeJobOffer(data: CVData, offer: string) {
  const cvText = normalize(buildPlainText(data));
  const cvWords = new Set(cvText.split(/[^a-z0-9+#]+/).filter(w => w.length > 2));

  const offerWords = offer
    .split(/[^a-zA-ZÀ-ÿ0-9+#]+/)
    .map(normalize)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of offerWords) freq.set(w, (freq.get(w) ?? 0) + 1);

  const keywords = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w, c]) => ({ word: w, count: c, present: cvWords.has(w) }));

  const matched = keywords.filter(k => k.present).length;
  const atsRate = keywords.length ? Math.round((matched / keywords.length) * 100) : 0;

  return { keywords, missing: keywords.filter(k => !k.present).map(k => k.word), atsRate };
}

export default function ScorePanel({ data }: Props) {
  const [offer, setOffer] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const score = useMemo(() => computeCVScore(data), [data]);
  const analysis = useMemo(
    () => (offer.trim().length > 40 ? analyzeJobOffer(data, offer) : null),
    [offer, data],
  );
  const accent = COLOR_MAP[data.color].primary;

  const gradeColor = score.total >= 85 ? '#059669' : score.total >= 70 ? '#2563eb' : score.total >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="space-y-5">
      {/* Note globale */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={gradeColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(score.total / 100) * 264} 264`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900">{score.total}</span>
            <span className="text-[9px] text-slate-400">/ 100</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: gradeColor }}>{scoreGrade(score.total)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Compatibilité ATS estimée : <b className="text-slate-700">{score.atsScore}%</b></p>
          <p className="text-[11px] text-slate-500">Analyse sur 12 critères de qualité.</p>
        </div>
      </div>

      {/* Critères */}
      <div className="space-y-2">
        {score.criteria.map(c => {
          const color = c.score >= 80 ? '#059669' : c.score >= 50 ? '#d97706' : '#dc2626';
          return (
            <div key={c.key} className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-700">{c.label}</span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{Math.round(c.score)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.score}%`, backgroundColor: color }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{c.advice}</p>
            </div>
          );
        })}
      </div>

      {/* Recommandations */}
      <div>
        <p className="text-xs font-bold text-slate-800 mb-2">💡 Recommandations</p>
        <ul className="space-y-1.5">
          {score.recommendations.map((r, i) => (
            <li key={i} className="text-[11px] text-slate-700 bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-start gap-2">
              <span>➜</span><span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Comparaison avec une offre d'emploi */}
      <div>
        <button type="button" onClick={() => setShowAnalysis(v => !v)}
          className="w-full flex items-center justify-between p-3 rounded-xl text-white text-xs font-bold"
          style={{ backgroundColor: accent }}>
          <span>🎯 Comparer le CV à une offre d’emploi</span>
          <span>{showAnalysis ? '−' : '+'}</span>
        </button>

        {showAnalysis && (
          <div className="mt-3 space-y-3">
            <textarea
              value={offer}
              onChange={e => setOffer(e.target.value)}
              rows={5}
              placeholder="Collez ici l’annonce : compétences demandées, missions, mots-clés…"
              className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {analysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl font-black" style={{ color: analysis.atsRate >= 70 ? '#059669' : analysis.atsRate >= 40 ? '#d97706' : '#dc2626' }}>{analysis.atsRate}%</span>
                  <p className="text-[11px] text-slate-600 flex-1">Taux de compatibilité avec cette offre (mots-clés trouvés dans votre CV).</p>
                </div>

                {analysis.keywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">Mots-clés de l’offre</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords.map(k => (
                        <span key={k.word} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${k.present ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {k.present ? '✓' : '✕'} {k.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.missing.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-[11px] font-bold text-red-800 mb-1">Compétences / mots-clés manquants</p>
                    <p className="text-[11px] text-red-700">{analysis.missing.join(' · ')}</p>
                    <p className="text-[10px] text-red-600/70 mt-1.5">
                      Ajoutez ces termes dans vos descriptions s’ils correspondent réellement à votre expérience — n’inventez rien.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
