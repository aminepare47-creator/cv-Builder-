import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useInstallPrompt } from '../utils/pwa';

interface Props {
  /** 'icon' : bouton de l'en-tête · 'menu' : ligne du menu mobile. */
  variant?: 'icon' | 'menu';
  /** Appelé après l'action (pour refermer le menu mobile). */
  onDone?: () => void;
}

/**
 * Bouton « Installer l'application » (PWA).
 * Utilise l'invitation native du navigateur quand elle est disponible et
 * affiche la procédure à suivre sur iPhone / iPad.
 */
export default function InstallAppButton({ variant = 'icon', onDone }: Props) {
  const { canInstall, installed, isStandalone, isIOS, install } = useInstallPrompt();
  const [helpOpen, setHelpOpen] = useState(false);

  const visible = variant === 'icon' ? canInstall : canInstall || isIOS;
  if (!visible || installed || isStandalone) return null;

  const handleClick = async () => {
    onDone?.();
    if (canInstall) {
      await install();
      return;
    }
    setHelpOpen(true);
  };

  const steps = isIOS
    ? [
        'Touchez le bouton Partager (carré avec une flèche) dans Safari.',
        'Choisissez « Sur l\u2019écran d\u2019accueil ».',
        'Touchez « Ajouter » : l\u2019icône CV Builder apparaît sur votre écran.',
      ]
    : [
        'Ouvrez le menu du navigateur (\u22ee ou \u2630).',
        'Choisissez « Installer l\u2019application » ou « Ajouter à l\u2019écran d\u2019accueil ».',
        'Confirmez : CV Builder Pro s\u2019ouvre désormais comme une application.',
      ];

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={handleClick}
          title="Installer l'application"
          aria-label="Installer l'application"
          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="7" y="2.5" width="10" height="19" rx="2.5" strokeWidth={1.8} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 18.5h2" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="w-full text-left px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
        >
          📲 Installer l'application
        </button>
      )}

      {helpOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm"
            onMouseDown={(event) => { if (event.target === event.currentTarget) setHelpOpen(false); }}
          >
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-sheet">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Installer CV Builder Pro</h3>
                <button
                  onClick={() => setHelpOpen(false)}
                  aria-label="Fermer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ajoutez l'application à votre écran d'accueil : elle s'ouvre sans barre
                  d'adresse et reste utilisable <strong>hors ligne</strong>, avec votre CV
                  sauvegardé sur votre appareil.
                </p>

                <ol className="mt-4 space-y-2">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-[11px] text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <p className="mt-4 text-[10px] text-slate-400">
                  Sur ordinateur, l'icône d'installation apparaît aussi à droite de la barre d'adresse.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}