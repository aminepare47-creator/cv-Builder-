import { useState, useRef, useEffect } from 'react';
import { CVData, createEmptyCV, createExampleCV, TEMPLATES } from './types/cv';
import ModernTemplate from './components/templates/ModernTemplate';
import ClassicTemplate from './components/templates/ClassicTemplate';
import CreativeTemplate from './components/templates/CreativeTemplate';
import MinimalTemplate from './components/templates/MinimalTemplate';
import ElegantTemplate from './components/templates/ElegantTemplate';
import TimelineTemplate from './components/templates/TimelineTemplate';
import TechTemplate from './components/templates/TechTemplate';
import MagazineTemplate from './components/templates/MagazineTemplate';
import InfographicTemplate from './components/templates/InfographicTemplate';
import MosaicTemplate from './components/templates/MosaicTemplate';
import PersonalSection from './components/editor/PersonalSection';
import ExperienceSection from './components/editor/ExperienceSection';
import EducationSection from './components/editor/EducationSection';
import SkillsSection from './components/editor/SkillsSection';
import OtherSections from './components/editor/OtherSections';
import DesignSection from './components/editor/DesignSection';
import QualityPanel from './components/editor/QualityPanel';
import JobProfilesSection from './components/editor/JobProfilesSection';
import CustomSections from './components/editor/CustomSections';
import ExportPanel from './components/ExportPanel';
import ImportCVModal from './components/ImportCVModal';
import CVPreview from './components/CVPreview';
import Logo from './components/Logo';
import InstallAppButton from './components/InstallAppButton';
import { getLabels, LANGUAGES } from './i18n/labels';
import { useDarkMode, useHistory, useShortcuts, cvProgress } from './utils/useUX';
import { useServiceWorkerUpdate } from './utils/pwa';

type TabKey = 'personal' | 'experience' | 'education' | 'skills' | 'other' | 'design' | 'quality' | 'profiles' | 'sections';

const STORAGE_KEY = 'cv_builder_data_universal_v1';
const LEGACY_STORAGE_KEY = 'cv_builder_data';

function loadCV(): CVData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<CVData>;
      // L'ancien exemple était uniquement informatique : on ne le laisse pas
      // réapparaître après la mise à niveau universelle.
      const oldDemo = (parsed.personal?.firstName === 'Jean' && /développeur|developer/i.test(parsed.personal?.title || ''))
        // L'exemple « Sophie Martin » prérempli ne doit pas se recharger :
        // le site démarre désormais avec tous les champs vides.
        || (parsed.personal?.firstName === 'Sophie' && parsed.personal?.lastName === 'Martin'
          && parsed.personal?.email === 'sophie.martin@email.com');
      if (oldDemo) return createEmptyCV();
      return { ...createEmptyCV(), ...parsed };
    }
  } catch { /* ignore */ }
  return createEmptyCV();
}

const TABS: { key: TabKey; label: string; short: string; icon: string }[] = [
  { key: 'personal', label: 'Profil', short: 'Profil', icon: 'user' },
  { key: 'experience', label: 'Expériences', short: 'Exp.', icon: 'briefcase' },
  { key: 'education', label: 'Formation', short: 'Études', icon: 'book' },
  { key: 'skills', label: 'Compétences', short: 'Compét.', icon: 'bolt' },
  { key: 'other', label: 'Autres', short: 'Autres', icon: 'layers' },
  { key: 'sections', label: 'Sections +', short: 'Sect.+', icon: 'puzzle' },
  { key: 'profiles', label: 'Métiers', short: 'Métier', icon: 'target' },
  { key: 'quality', label: 'Analyse', short: 'Score', icon: 'chart' },
  { key: 'design', label: 'Design', short: 'Design', icon: 'palette' },
];

function TabIcon({ name, active = false }: { name: string; active?: boolean }) {
  const common = {
    className: 'w-[17px] h-[17px]',
    fill: active ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
  };
  const paths: Record<string, React.ReactNode> = {
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7z" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    palette: <><path d="M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.1-3.2 1.8 1.8 0 0 1 1.1-3.2H18a3 3 0 0 0 3-3A8.6 8.6 0 0 0 12 3Z" /><circle cx="7.5" cy="10" r=".8" fill="currentColor" /><circle cx="10" cy="7" r=".8" fill="currentColor" /><circle cx="14" cy="7" r=".8" fill="currentColor" /><circle cx="17" cy="10" r=".8" fill="currentColor" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 15 4-6 3 4 5-8" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
    puzzle: <><path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v6h-3a2 2 0 1 0 0 4h3v8h-8v-3a2 2 0 1 0-4 0v3H3v-8h3a2 2 0 1 0 0-4H3V3h4v3a2 2 0 1 0 3 1.5z" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function App() {
  const [data, setData] = useState<CVData>(loadCV);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [importOpen, setImportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  /* Priorité 7 : mode sombre, historique undo/redo, raccourcis clavier */
  const { dark, toggleDark } = useDarkMode();
  const { undo, redo, canUndo, canRedo } = useHistory(data);
  const progress = cvProgress(data);

  /* PWA : nouvelles versions de l'application installée */
  const { updateReady, applyUpdate } = useServiceWorkerUpdate();

  useShortcuts({
    undo: () => { const prev = undo(); if (prev) setData(prev); },
    redo: () => { const next = redo(); if (next) setData(next); },
    dark: toggleDark,
    help: () => setActiveTab('quality'),
  }, dark);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ }
  }, [data]);

  /* Raccourci de l'application installée : « /?action=import » ouvre l'import de CV */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'import') {
      setImportOpen(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const updateInlineEdit = (path: string, value: string) => {
    setData(previous => {
      const next = JSON.parse(JSON.stringify(previous)) as CVData;
      const parts = path.split('.');
      let target: any = next;

      for (let index = 0; index < parts.length - 1; index += 1) {
        const part = parts[index];
        if (Array.isArray(target)) {
          const itemIndex = target.findIndex(item => item.id === part);
          if (itemIndex < 0) return previous;
          target = target[itemIndex];
        } else {
          target = target[part];
        }
        if (!target) return previous;
      }

      const last = parts[parts.length - 1];
      if (Array.isArray(target)) {
        const itemIndex = target.findIndex(item => item.id === last);
        if (itemIndex < 0) return previous;
        target[itemIndex] = value;
      } else {
        target[last] = value;
      }
      return next;
    });
  };

  const resetCV = () => {
    if (confirm('Charger le CV d\'exemple ? Votre travail en cours sera remplacé.')) {
      setData(createExampleCV());
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    setMenuOpen(false);
  };

  const clearCV = () => {
    if (confirm('Vider tous les champs du CV ?')) {
      const e = createEmptyCV();
      setData({
        ...e,
        personal: {
          firstName: '', lastName: '', title: '', email: '', phone: '', address: '',
          city: '', postalCode: '', country: '', linkedIn: '', website: '', photo: '', summary: '',
        },
        experiences: [], education: [], skills: [], languages: [],
        hobbies: [], projects: [], certifications: [], references: [],
      });
    }
    setMenuOpen(false);
  };

  const renderTemplate = () => {
    const p = { data };
    switch (data.template) {
      case 'modern': return <ModernTemplate {...p} />;
      case 'classic': return <ClassicTemplate {...p} />;
      case 'creative': return <CreativeTemplate {...p} />;
      case 'minimal': return <MinimalTemplate {...p} />;
      case 'elegant': return <ElegantTemplate {...p} />;
      case 'timeline': return <TimelineTemplate {...p} />;
      case 'tech': return <TechTemplate {...p} />;
      case 'magazine': return <MagazineTemplate {...p} />;
      case 'infographic': return <InfographicTemplate {...p} />;
      case 'mosaic': return <MosaicTemplate {...p} />;
      default: return <ModernTemplate {...p} />;
    }
  };

  const templateName = TEMPLATES.find(x => x.id === data.template)?.name;
  const langNative = LANGUAGES.find(l => l.code === data.language)?.native;

  const editorBody = (
    <div className="animate-fadeIn">
      {activeTab === 'personal' && <PersonalSection data={data} onChange={setData} />}
      {activeTab === 'experience' && <ExperienceSection data={data} onChange={setData} />}
      {activeTab === 'education' && <EducationSection data={data} onChange={setData} />}
      {activeTab === 'skills' && <SkillsSection data={data} onChange={setData} />}
      {activeTab === 'other' && <OtherSections data={data} onChange={setData} />}
      {activeTab === 'sections' && <CustomSections data={data} onChange={setData} />}
      {activeTab === 'profiles' && <JobProfilesSection data={data} onChange={setData} />}
      {activeTab === 'quality' && <QualityPanel data={data} />}
      {activeTab === 'design' && <DesignSection data={data} onChange={setData} />}
    </div>
  );

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: '100dvh' }}>
      {/* ══════════ HEADER ══════════ */}
      <header className="no-print relative flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-2 px-3 sm:px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <Logo size={36} className="flex-shrink-0 rounded-xl drop-shadow-md" />
            <div className="hidden xs:block min-w-0">
              <h1 className="text-[15px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight whitespace-nowrap">
                CV Builder Pro
              </h1>
              <p className="hidden md:block text-[9.5px] text-slate-400 leading-tight">{templateName} · {langNative}</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button onClick={() => { const prev = undo(); if (prev) setData(prev); }} disabled={!canUndo} title="Annuler (Ctrl+Z)"
              className="w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30">↶</button>
            <button onClick={() => { const next = redo(); if (next) setData(next); }} disabled={!canRedo} title="Rétablir (Ctrl+Y)"
              className="w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30">↷</button>
            <button onClick={toggleDark} title="Mode sombre (D)"
              className="w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm">{dark ? '☀️' : '🌙'}</button>
            <InstallAppButton />
            <button onClick={() => setImportOpen(true)}
              className="px-3 h-9 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Importer un CV
            </button>
            <button onClick={clearCV} className="px-3 h-9 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Vider</button>
            <button onClick={resetCV} className="px-3 h-9 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Exemple</button>
          </div>

          {/* Sélecteur langue */}
          <select
            value={data.language}
            onChange={e => setData({ ...data, language: e.target.value as typeof data.language })}
            title="Langue du CV"
            className="h-9 px-1.5 sm:px-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[70px] sm:max-w-none"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.native}</option>)}
          </select>

          <ExportPanel cvRef={cvRef} data={data} />

          {/* Menu mobile */}
          <div className="relative lg:hidden">
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-1.5 animate-fadeIn">
                  <button onClick={() => { setImportOpen(true); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2">
                    📄 Importer un CV
                  </button>
                  <button onClick={clearCV} className="w-full text-left px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">🧹 Vider les champs</button>
                  <button onClick={resetCV} className="w-full text-left px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">↺ Données d'exemple</button>
                  <div className="border-t border-slate-100 my-1" />
                  <InstallAppButton variant="menu" onDone={() => setMenuOpen(false)} />
                  <p className="px-3 py-1.5 text-[10px] text-slate-400">{templateName} · {langNative}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Barre de progression du CV (Priorité 7) */}
        <div className="no-print h-1 bg-slate-100 cursor-help" title={`CV complété à ${progress.percent}%`}>
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress.percent}%` }} />
        </div>
      </header>

      {/* ══════════ CORPS ══════════ */}
      <div className="flex-1 flex min-h-0">
        {/* Rail vertical de navigation — desktop */}
        <nav className="no-print hidden lg:flex flex-col items-center gap-1 py-3 w-[64px] flex-shrink-0 bg-white border-r border-slate-100">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} title={tab.label}
              className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-300/40'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}>
              <TabIcon name={tab.icon} active={activeTab === tab.key} />
              <span className="pointer-events-none absolute left-[54px] px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Éditeur */}
        <aside className={`no-print bg-white lg:border-r border-slate-200 flex-col min-h-0 lg:pl-[64px]
          w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] flex-shrink-0
          ${mobileView === 'edit' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Titre d'onglet mobile */}
          <div className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
            <span className="text-indigo-600"><TabIcon name={TABS.find(t => t.key === activeTab)?.icon || 'user'} /></span>
            <h2 className="text-sm font-bold text-slate-800">{TABS.find(t => t.key === activeTab)?.label}</h2>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin px-4 sm:px-5 py-4 pb-6">
            {editorBody}
          </div>
        </aside>

        {/* Aperçu */}
        <main className={`flex-1 min-w-0 bg-gradient-to-br from-slate-100 to-slate-200/70
          ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          <CVPreview
            innerRef={cvRef}
            dir={getLabels(data.language).dir}
            data={data}
            onEdit={updateInlineEdit}
            footer={
              <p className="text-[10px] text-slate-400">
                A4 · {templateName} · {langNative} · {data.experiences.length} exp. · {data.skills.length} comp.
              </p>
            }
          >
            {renderTemplate()}
          </CVPreview>
        </main>
      </div>

      {/* ══════════ NAV MOBILE (bas) ══════════ */}
      <nav className="no-print lg:hidden flex-shrink-0 px-2 pt-2 bg-transparent z-30"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-1.5 p-1.5 rounded-[22px] bg-white/95 border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.14)] backdrop-blur-md overflow-x-auto scrollbar-thin">
          {TABS.map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMobileView('edit'); }}
              className={`relative flex-shrink-0 w-[58px] flex flex-col items-center justify-center gap-1 py-1.5 min-h-[52px] rounded-[16px] transition-all active:scale-95 ${
                activeTab === tab.key && mobileView === 'edit'
                  ? 'text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-300/40'
                  : 'text-slate-400 hover:text-slate-700 active:bg-slate-50'
              }`}>
              <TabIcon name={tab.icon} active={activeTab === tab.key && mobileView === 'edit'} />
              <span className="text-[8.5px] font-bold leading-none tracking-tight">{tab.short}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ══════════ BOUTON FLOTTANT Aperçu / Éditer (mobile) ══════════ */}
      <button
        onClick={() => setMobileView(v => (v === 'edit' ? 'preview' : 'edit'))}
        className="no-print lg:hidden fixed right-4 z-40 h-12 px-5 rounded-full shadow-xl shadow-indigo-500/30
          bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold
          flex items-center gap-2 active:scale-95 transition-transform"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 68px)' }}
      >
        {mobileView === 'edit' ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Aperçu
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Éditer
          </>
        )}
      </button>

      <ImportCVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(imported) => setData(imported)}
        current={data}
      />

      {/* PWA : nouvelle version disponible */}
      {updateReady && (
        <div className="no-print fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 pl-4 pr-2 py-2 bg-slate-900 text-white rounded-2xl shadow-2xl animate-fadeIn max-w-[calc(100vw-2rem)]">
          <p className="text-xs font-medium whitespace-nowrap">Nouvelle version disponible</p>
          <button
            onClick={applyUpdate}
            className="px-3 h-8 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Mettre à jour
          </button>
        </div>
      )}
    </div>
  );
}
