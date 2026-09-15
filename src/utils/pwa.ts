import { useCallback, useEffect, useState } from 'react';

/**
 * Application installable (PWA) :
 * - enregistrement du service worker (`public/sw.js`) en production ;
 * - détection d'une nouvelle version + rechargement à la demande ;
 * - invitation à l'installation native (`beforeinstallprompt`) et cas iOS.
 *
 * Le site fonctionne aussi hors ligne : le service worker précache la coquille
 * applicative et sert le CV sauvegardé dans le localStorage.
 */

const SW_URL = '/sw.js';
const UPDATE_EVENT = 'cvpwa:update';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Enregistre le service worker (ignoré en développement pour ne pas gêner le HMR). */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SW_URL, { scope: '/' })
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            // Un contrôleur existe déjà : c'est une mise à jour, pas le 1er chargement
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new Event(UPDATE_EVENT));
            }
          });
        });
      })
      .catch(() => { /* navigation privée ou navigateur sans support */ });
  });
}

/** Signale qu'une nouvelle version est prête et permet de l'activer. */
export function useServiceWorkerUpdate() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const onUpdate = () => setUpdateReady(true);
    window.addEventListener(UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, onUpdate);
  }, []);

  const applyUpdate = useCallback(() => {
    if (!('serviceWorker' in navigator)) {
      window.location.reload();
      return;
    }
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (registration?.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        else window.location.reload();
      })
      .catch(() => window.location.reload());
  }, []);

  return { updateReady, applyUpdate };
}

/** L'application tourne-t-elle déjà en mode installé (sans navigateur) ? */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const installed = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: window-controls-overlay)').matches
    || installed.standalone === true
  );
}

/** iPhone / iPad : pas d'invitation native, l'installation passe par Partager. */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iPadOS = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return (/iPad|iPhone|iPod/.test(ua) || iPadOS) && !('MSStream' in window);
}

/** Invitation d'installation du navigateur (Chrome, Edge, Samsung Internet…). */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(isRunningStandalone);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setIsStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === 'accepted') setInstalled(true);
    return choice.outcome === 'accepted';
  }, [promptEvent]);

  return {
    /** Le navigateur propose une installation en un clic. */
    canInstall: Boolean(promptEvent),
    installed,
    isStandalone,
    isIOS: isIOSDevice(),
    install,
  };
}
