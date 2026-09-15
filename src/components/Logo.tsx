import { useId } from 'react';

interface Props {
  /** Côté du carré (px). */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Logo de CV Builder Pro : feuille de CV + éclat (assistance IA).
 * Géométrie identique à `public/logo.svg` et aux icônes PWA générées par
 * `tools/generate-icons.ps1`, afin que le site, le favicon et l'application
 * installée affichent exactement la même marque.
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
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradientId})`} />
      <rect x="132" y="100" width="240" height="272" rx="30" fill="#ffffff" />
      <rect x="172" y="169" width="108" height="30" rx="15" fill="#6366f1" />
      <rect x="172" y="221" width="160" height="18" rx="9" fill="#cbd5e1" />
      <rect x="172" y="255" width="120" height="18" rx="9" fill="#cbd5e1" />
      <rect x="172" y="289" width="160" height="18" rx="9" fill="#e2e8f0" />
      <path
        d="M416 368 Q416 416 464 416 Q416 416 416 464 Q416 416 368 416 Q416 416 416 368 Z"
        fill="#ffffff"
      />
    </svg>
  );
}
