import { useId } from 'react';

interface Props {
  /** Côté du carré (px). */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Logo de CV Builder Pro : document avec coin plié + badge de validation.
 * Géométrie identique à `public/logo.svg` et aux icônes PWA (favicon,
 * icônes d'app, écran d'installation), afin que le site, le favicon et
 * l'application installée affichent exactement la même marque.
 */
export default function Logo({ size = 36, className, title = 'CV Builder Pro' }: Props) {
  const gradientId = `cvbrand-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label={title}
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="104" fill={`url(#${gradientId})`} />

      {/* Document avec coin plié */}
      <path
        d="M156 100 H316 L364 148 V392 a24 24 0 0 1 -24 24 H156 a24 24 0 0 1 -24 -24 V124 a24 24 0 0 1 24 -24 Z"
        fill="#ffffff"
      />
      <path d="M316 100 L364 148 H336 a20 20 0 0 1 -20 -20 Z" fill="#c7d2fe" />

      {/* En-tête (nom) */}
      <rect x="188" y="180" width="130" height="22" rx="11" fill="#3730a3" />
      <rect x="188" y="214" width="92" height="14" rx="7" fill="#94a3b8" />

      {/* Lignes de contenu */}
      <rect x="188" y="256" width="146" height="14" rx="7" fill="#cbd5e1" />
      <rect x="188" y="282" width="118" height="14" rx="7" fill="#cbd5e1" />
      <rect x="188" y="308" width="146" height="14" rx="7" fill="#e2e8f0" />
      <rect x="188" y="334" width="100" height="14" rx="7" fill="#e2e8f0" />

      {/* Badge de validation */}
      <circle cx="372" cy="372" r="54" fill="#f59e0b" stroke="#1e1b4b" strokeWidth="10" />
      <path
        d="M348 372 L364 388 396 352"
        stroke="#ffffff"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
