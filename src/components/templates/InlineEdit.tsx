import { createContext, useContext, useMemo } from 'react';
import type { CVData } from '../../types/cv';

interface InlineEditContextValue {
  enabled: boolean;
  edit: (path: string, value: string) => void;
  resolve: (item: unknown, field: string) => string | null;
}

const InlineEditContext = createContext<InlineEditContextValue>({
  enabled: false,
  edit: () => undefined,
  resolve: () => null,
});

interface ProviderProps {
  data: CVData;
  enabled: boolean;
  onEdit: (path: string, value: string) => void;
  children: React.ReactNode;
}

export function InlineEditProvider({ data, enabled, onEdit, children }: ProviderProps) {
  const value = useMemo<InlineEditContextValue>(() => ({
    enabled,
    edit: onEdit,
    resolve: (item, field) => {
      if (item === data.personal) return `personal.${field}`;
      const collections = ['experiences', 'education', 'skills', 'languages', 'hobbies', 'projects', 'certifications', 'references'] as const;
      for (const collection of collections) {
        const found = data[collection].find(candidate => candidate === item);
        if (found) return `${collection}.${found.id}.${field}`;
      }
      return null;
    },
  }), [data, enabled, onEdit]);

  return <InlineEditContext.Provider value={value}>{children}</InlineEditContext.Provider>;
}

interface InlineTextProps {
  value: string;
  path?: string;
  item?: unknown;
  field?: string;
  multiline?: boolean;
  className?: string;
}

/** Text displayed normally, or edited directly in the A4 preview. */
export function InlineText({ value, path, item, field, multiline = false, className }: InlineTextProps) {
  const { enabled, edit, resolve } = useContext(InlineEditContext);
  const resolvedPath = path ?? (item && field ? resolve(item, field) : null);

  if (!enabled || !resolvedPath) return <>{value}</>;

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Modifier ce texte"
      spellCheck
      className={`${className ?? ''} inline-editable-text`}
      onBlur={event => edit(resolvedPath, event.currentTarget.innerText.replace(/\u00a0/g, ' '))}
      onKeyDown={event => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          event.currentTarget.innerText = value;
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </span>
  );
}
