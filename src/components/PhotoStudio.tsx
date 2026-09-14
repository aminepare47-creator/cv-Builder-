import { useCallback, useEffect, useRef, useState } from 'react';
import {
  analyzePhoto, renderPhoto, PhotoReport, RenderOptions,
  ACCEPTED_FORMATS, MAX_FILE_SIZE_MB, MIN_ACCEPTABLE_SCORE, scoreColor, scoreLabel,
} from '../utils/photo';

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}

const DEFAULT_OPTS: RenderOptions = {
  zoom: 1, offsetX: 0, offsetY: 0, enhance: true, grayscale: false,
  rotate: 0, shape: 'rect', aspect: 0.75,
};

const STATUS_ICON = { excellent: '✓', good: '✓', warning: '!', error: '✕' } as const;
const STATUS_CLS = {
  excellent: 'bg-emerald-100 text-emerald-700',
  good: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
} as const;

export default function PhotoStudio({ open, onClose, onApply }: Props) {
  const [source, setSource] = useState<string | null>(null);
  const [report, setReport] = useState<PhotoReport | null>(null);
  const [opts, setOpts] = useState<RenderOptions>(DEFAULT_OPTS);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setSource(null); setReport(null); setPreview(null);
    setOpts(DEFAULT_OPTS); setError(null);
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError('Format non pris en charge. Utilisez un fichier JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} Mo).`);
      return;
    }
    setLoading(true);
    try {
      const dataUrl: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target?.result as string);
        r.onerror = () => rej(new Error('Lecture impossible'));
        r.readAsDataURL(file);
      });
      const rep = await analyzePhoto(dataUrl, file.size, file.type);
      setSource(dataUrl);
      setReport(rep);
      // pré-cadrage intelligent centré sur le visage détecté
      let next = { ...DEFAULT_OPTS };
      if (rep.faceBox) {
        const cx = rep.faceBox.x + rep.faceBox.w / 2;
        const cy = rep.faceBox.y + rep.faceBox.h / 2;
        next = { ...next, offsetX: Math.max(-1, Math.min(1, (cx - 0.5) * 2)), offsetY: Math.max(-1, Math.min(1, (cy - 0.45) * 2)) };
      }
      const sharp = rep.criteria.find(c => c.key === 'sharpness')?.score ?? 100;
      const contrast = rep.criteria.find(c => c.key === 'contrast')?.score ?? 100;
      next.enhance = sharp < 90 || contrast < 90;
      setOpts(next);
    } catch (e) {
      setError('Impossible d\'analyser cette image.');
    } finally {
      setLoading(false);
    }
  }, []);

  // live preview
  useEffect(() => {
    let cancelled = false;
    if (!source) { setPreview(null); return; }
    renderPhoto(source, opts, 420).then(url => { if (!cancelled) setPreview(url); }).catch(() => {});
    return () => { cancelled = true; };
  }, [source, opts]);

  if (!open) return null;

  const apply = async () => {
    if (!source) return;
    setLoading(true);
    const finalUrl = await renderPhoto(source, opts, 900);
    setLoading(false);
    onApply(finalUrl);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-5xl h-[92dvh] sm:h-auto sm:max-h-[92vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-sheet">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">📷 Studio photo professionnel</h2>
            <p className="text-[11px] text-slate-500">Photo optionnelle — contrôle qualité exigeant : netteté, lumière, cadrage, fond et format.</p>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {!source ? (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl mb-3">📸</div>
                <p className="text-sm font-semibold text-slate-800">Glissez votre photo ici ou cliquez pour parcourir</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG ou WEBP — 600 px minimum, jusqu'à {MAX_FILE_SIZE_MB} Mo</p>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
              </div>
              {loading && <p className="text-center text-xs text-indigo-600 mt-4">Analyse de la photo en cours…</p>}
              {error && <p className="text-center text-xs text-red-600 mt-4 bg-red-50 py-2 rounded-lg">{error}</p>}

              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 mb-2">✓ Une bonne photo de CV</p>
                  <ul className="text-[11px] text-emerald-900/80 space-y-1">
                    <li>• Portrait net, cadré tête + épaules</li>
                    <li>• Lumière naturelle douce, de face</li>
                    <li>• Fond uni, clair et neutre</li>
                    <li>• Tenue professionnelle, regard vers l'objectif</li>
                    <li>• Format portrait 3:4, 600 px minimum</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs font-bold text-red-800 mb-2">✕ À éviter absolument</p>
                  <ul className="text-[11px] text-red-900/80 space-y-1">
                    <li>• Selfie flou, sombre ou en contre-jour</li>
                    <li>• Photo de groupe recadrée</li>
                    <li>• Arrière-plan chargé ou désordonné</li>
                    <li>• Lunettes de soleil, filtres, casquette</li>
                    <li>• Image pixelisée ou très compressée</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[300px_1fr] gap-4 lg:gap-5">
              {/* preview + controls */}
              <div>
                <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Aperçu" className={`max-h-64 shadow-lg ${opts.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} />
                  ) : <div className="h-52 sm:h-64 flex items-center justify-center text-xs text-slate-400">Rendu…</div>}
                </div>

                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[11px] font-medium text-slate-600">Cadre
                      <select value={opts.aspect} onChange={e => setOpts({ ...opts, aspect: parseFloat(e.target.value) })}
                        className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value={0.75}>Portrait 3:4 (recommandé)</option>
                        <option value={1}>Carré 1:1</option>
                        <option value={0.7}>Identité 7:10</option>
                      </select>
                    </label>
                    <label className="text-[11px] font-medium text-slate-600">Forme
                      <select value={opts.shape} onChange={e => setOpts({ ...opts, shape: e.target.value as 'rect' | 'circle' })}
                        className="mt-1 w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="rect">Rectangle</option>
                        <option value="circle">Cercle</option>
                      </select>
                    </label>
                  </div>

                  {[
                    { k: 'zoom' as const, label: 'Zoom', min: 1, max: 3, step: 0.01 },
                    { k: 'offsetX' as const, label: 'Position horizontale', min: -1, max: 1, step: 0.01 },
                    { k: 'offsetY' as const, label: 'Position verticale', min: -1, max: 1, step: 0.01 },
                    { k: 'rotate' as const, label: 'Rotation', min: -15, max: 15, step: 0.5 },
                  ].map(s => (
                    <label key={s.k} className="block">
                      <span className="text-[11px] font-medium text-slate-600">{s.label}</span>
                      <input type="range" min={s.min} max={s.max} step={s.step} value={opts[s.k]}
                        onChange={e => setOpts({ ...opts, [s.k]: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500" />
                    </label>
                  ))}

                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={opts.enhance} onChange={e => setOpts({ ...opts, enhance: e.target.checked })} className="rounded text-indigo-500" />
                      Amélioration auto
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={opts.grayscale} onChange={e => setOpts({ ...opts, grayscale: e.target.checked })} className="rounded text-indigo-500" />
                      Noir & blanc
                    </label>
                  </div>
                </div>
              </div>

              {/* report */}
              <div>
                {report && (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor(report.overall)} strokeWidth="3.2"
                            strokeDasharray={`${report.overall} 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold" style={{ color: scoreColor(report.overall) }}>{report.overall}</span>
                          <span className="text-[8px] text-slate-500">/ 100</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">Qualité {scoreLabel(report.overall)}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {report.overall >= MIN_ACCEPTABLE_SCORE
                            ? 'Cette photo respecte les standards d\'un CV professionnel.'
                            : `Score inférieur au seuil exigé (${MIN_ACCEPTABLE_SCORE}/100). Corrigez les points en rouge ou choisissez une autre photo.`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{report.width} × {report.height} px · {report.format.replace('image/', '').toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 lg:max-h-[320px] lg:overflow-y-auto scrollbar-thin pr-0 lg:pr-1">
                      {report.criteria.map(c => (
                        <div key={c.key} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${STATUS_CLS[c.status]}`}>
                            {STATUS_ICON[c.status]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold text-slate-800">{c.label}</p>
                              <span className="text-[10px] font-bold" style={{ color: scoreColor(c.score) }}>{c.score}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{c.value} — {c.advice}</p>
                            <div className="h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: scoreColor(c.score) }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        {source && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50">
            <button onClick={reset} className="px-3 h-10 text-xs text-slate-600 hover:bg-slate-200 rounded-lg whitespace-nowrap">← Changer</button>
            <div className="flex items-center gap-2">
              {report && report.overall < MIN_ACCEPTABLE_SCORE && (
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-1 rounded">Qualité insuffisante</span>
              )}
              <button onClick={apply} disabled={loading}
                className="px-4 h-10 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 whitespace-nowrap">
                {loading ? 'Traitement…' : report && report.overall < MIN_ACCEPTABLE_SCORE ? 'Utiliser quand même' : 'Appliquer au CV'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
