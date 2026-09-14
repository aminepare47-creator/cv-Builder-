import type { CVLanguage } from '../i18n/labels';
import type { CVData } from '../types/cv';

/**
 * Couche d'intégration IA réelle — Groq et Gemini.
 * Les clés API sont stockées UNIQUEMENT dans le localStorage du navigateur.
 * Si aucune clé n'est configurée, l'app retombe automatiquement
 * sur le générateur local (aiWriter.ts).
 */

export type AIProvider = 'groq' | 'gemini';
export type CVTone = 'classique' | 'dynamique' | 'elegant' | 'direct' | 'creatif';
export type WritingKind = 'summary' | 'experience' | 'education' | 'project';

export interface AISettings {
  provider: AIProvider;
  groqKey: string;
  geminiKey: string;
  model: string;
}

const STORAGE_KEY = 'cvbuilder.ai.settings';

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (recommandé)' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (rapide)' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
];

export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (recommandé)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'groq',
  groqKey: '',
  geminiKey: '',
  model: 'llama-3.3-70b-versatile',
};

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_SETTINGS };
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_AI_SETTINGS };
  }
}

export function saveAISettings(s: AISettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function hasActiveKey(s: AISettings): boolean {
  return s.provider === 'groq' ? !!s.groqKey.trim() : !!s.geminiKey.trim();
}

export const TONE_LABELS: Record<CVTone, string> = {
  classique: 'Classique',
  dynamique: 'Dynamique',
  elegant: 'Élégant',
  direct: 'Direct',
  creatif: 'Créatif',
};

const TONE_HINTS: Record<CVTone, string> = {
  classique: 'Sobre, formel et professionnel, style institutionnel.',
  dynamique: 'Énergique, orienté action et résultats, verbes forts.',
  elegant: 'Raffiné, vocabulaire soutenu, tournures fluides.',
  direct: 'Concis, factuel, sans détour, phrases courtes.',
  creatif: 'Original et engageant, tout en restant crédible pour un recruteur.',
};

export interface AIPromptContext {
  kind: WritingKind;
  language: CVLanguage;
  prompt: string;
  existing: string;
  tone: CVTone;
  role?: string;
  company?: string;
  school?: string;
  project?: string;
  technologies?: string;
  variants?: number;
  jobOffer?: string;
  profileContext?: string;
}

const LANG_NAMES: Record<CVLanguage, string> = {
  fr: 'français', en: 'anglais', es: 'espagnol', de: 'allemand',
  it: 'italien', nl: 'néerlandais', pt: 'portugais', ar: 'arabe',
};

const KIND_LABELS: Record<WritingKind, string> = {
  summary: 'le résumé / accroche de profil du CV',
  experience: 'la description d’une expérience professionnelle',
  education: 'la description d’une formation',
  project: 'la description d’un projet',
};

export function buildSystemPrompt(ctx: AIPromptContext): string {
  const n = ctx.variants && ctx.variants > 1 ? ctx.variants : 1;
  const parts = [
    `Tu es un expert en rédaction de CV. Rédige ${KIND_LABELS[ctx.kind]} en ${LANG_NAMES[ctx.language]}.`,
    `Ton demandé : ${TONE_LABELS[ctx.tone]} — ${TONE_HINTS[ctx.tone]}.`,
    'RÈGLES ABSOLUES :',
    '- N’invente JAMAIS d’informations : n’ajoute ni chiffres, ni dates, ni diplômes, ni entreprises absents des éléments fournis.',
    '- Reformule uniquement ce que l’utilisateur a donné, de façon professionnelle.',
    '- Pour une expérience : retourne des puces commençant par "• ", verbes d’action, sans exagération.',
    '- Longueur : résumé 2-3 phrases ; expérience 3-5 puces ; formation/projet 1-2 phrases.',
    n > 1
      ? `- Retourne exactement ${n} versions différentes, séparées par une ligne contenant uniquement "---".`
      : '- Retourne uniquement le texte du CV, sans commentaire ni titre.',
  ];
  if (ctx.jobOffer) {
    parts.push('L’utilisateur a fourni une offre d’emploi : intègre naturellement (sans inventer) les mots-clés et compétences pertinents qu’il couvre réellement.');
  }
  return parts.join('\n');
}

export function buildUserPrompt(ctx: AIPromptContext): string {
  const lines: string[] = [];
  if (ctx.role) lines.push(`Poste : ${ctx.role}`);
  if (ctx.company) lines.push(`Entreprise : ${ctx.company}`);
  if (ctx.school) lines.push(`École / organisme : ${ctx.school}`);
  if (ctx.project) lines.push(`Projet : ${ctx.project}`);
  if (ctx.technologies) lines.push(`Technologies / outils : ${ctx.technologies}`);
  if (ctx.prompt) lines.push(`Éléments fournis (mots-clés, missions, résultats) : ${ctx.prompt}`);
  if (ctx.existing) lines.push(`Texte actuel à améliorer : ${ctx.existing}`);
  if (ctx.profileContext) lines.push(`Contexte complet du CV (pour adapter le vocabulaire au secteur) :\n${ctx.profileContext}\n`);
  if (ctx.jobOffer) lines.push(`Offre d’emploi à cibler :\n${ctx.jobOffer}`);
  return lines.join('\n') || 'Aucun détail fourni, propose une formulation générique sobre.';
}

function extractVariants(text: string): string[] {
  return text.split(/\n-{3,}\n/).map(s => s.trim()).filter(Boolean);
}



export interface WritingContext {
  kind: WritingKind;
  language: CVLanguage;
  prompt: string;
  existing: string;
  role?: string;
  company?: string;
  school?: string;
  project?: string;
  technologies?: string;
}

const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
const cap = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
const list = (value: string) => clean(value).split(/[,;|]+/).map(x => x.trim()).filter(Boolean);

const labels: Record<CVLanguage, {
  and: string;
  current: string;
  summaryLead: string;
  summarySpecialized: string;
  summaryClose: string;
  experienceLead: string[];
  companyAt: string;
  experienceTail: string;
  experienceCollab: string;
  educationAt: string;
  educationClose: string;
  projectClose: string;
  projectBuiltWith: string;
}> = {
  fr: {
    and: 'et', current: 'actuellement',
    summaryLead: 'Professionnel', summarySpecialized: 'Spécialisé dans',
    summaryClose: 'Je combine expertise opérationnelle, sens du résultat et capacité à transformer les besoins en réalisations concrètes.',
    experienceLead: ['Pilotage de', 'Conception et mise en œuvre de', 'Coordination de', 'Optimisation de'],
    companyAt: 'au sein de',
    experienceTail: 'avec un suivi régulier des priorités, des délais et de la qualité.',
    experienceCollab: 'Collaboration avec les parties prenantes et proposition d’améliorations concrètes pour renforcer l’efficacité.',
    educationAt: 'au sein de', educationClose: 'Formation complétée par des projets appliqués et une approche orientée résultats.',
    projectClose: 'Une réalisation pensée pour apporter une réponse simple, utile et mesurable à un besoin concret.', projectBuiltWith: 'Réalisé avec',
  },
  en: {
    and: 'and', current: 'currently',
    summaryLead: 'Professional', summarySpecialized: 'Specialized in',
    summaryClose: 'I combine operational expertise, a strong results mindset and the ability to turn needs into measurable outcomes.',
    experienceLead: ['Led', 'Designed and delivered', 'Coordinated', 'Optimized'],
    companyAt: 'at',
    experienceTail: 'while tracking priorities, timelines and quality standards.',
    experienceCollab: 'Partnered with stakeholders and introduced practical improvements to strengthen efficiency.',
    educationAt: 'at', educationClose: 'Training supported by applied projects and a strong results-oriented approach.',
    projectClose: 'A practical solution designed to answer a concrete need with clear, measurable value.', projectBuiltWith: 'Built with',
  },
  es: {
    and: 'y', current: 'actualmente',
    summaryLead: 'Profesional', summarySpecialized: 'Especializado en',
    summaryClose: 'Combino experiencia operativa, orientación a resultados y capacidad para transformar necesidades en logros concretos.',
    experienceLead: ['Lideré', 'Diseñé e implementé', 'Coordiné', 'Optimicé'],
    companyAt: 'en',
    experienceTail: 'con un seguimiento regular de las prioridades, los plazos y la calidad.',
    experienceCollab: 'Colaboré con las partes interesadas y propuse mejoras concretas para reforzar la eficacia.',
    educationAt: 'en', educationClose: 'Formación reforzada por proyectos aplicados y una orientación clara a resultados.',
    projectClose: 'Una realización diseñada para responder a una necesidad concreta con un valor medible.', projectBuiltWith: 'Realizado con',
  },
  de: {
    and: 'und', current: 'aktuell',
    summaryLead: 'Fachkraft', summarySpecialized: 'Spezialisiert auf',
    summaryClose: 'Ich verbinde operative Expertise, Ergebnisorientierung und die Fähigkeit, Anforderungen in konkrete Lösungen zu übersetzen.',
    experienceLead: ['Leitung von', 'Konzeption und Umsetzung von', 'Koordination von', 'Optimierung von'],
    companyAt: 'bei',
    experienceTail: 'mit regelmäßiger Kontrolle von Prioritäten, Fristen und Qualität.',
    experienceCollab: 'Zusammenarbeit mit Stakeholdern und Umsetzung konkreter Verbesserungen zur Steigerung der Effizienz.',
    educationAt: 'an', educationClose: 'Ausbildung ergänzt durch angewandte Projekte und eine klare Ergebnisorientierung.',
    projectClose: 'Eine praktische Lösung für einen konkreten Bedarf mit messbarem Mehrwert.', projectBuiltWith: 'Erstellt mit',
  },
  it: {
    and: 'e', current: 'attualmente',
    summaryLead: 'Professionista', summarySpecialized: 'Specializzato in',
    summaryClose: 'Unisco competenza operativa, orientamento ai risultati e capacità di trasformare i bisogni in risultati concreti.',
    experienceLead: ['Gestione di', 'Progettazione e realizzazione di', 'Coordinamento di', 'Ottimizzazione di'],
    companyAt: 'presso',
    experienceTail: 'con monitoraggio costante di priorità, tempi e qualità.',
    experienceCollab: 'Collaborazione con gli stakeholder e proposta di miglioramenti concreti per aumentare l’efficienza.',
    educationAt: 'presso', educationClose: 'Formazione completata da progetti applicati e da un approccio orientato ai risultati.',
    projectClose: 'Una soluzione pensata per rispondere a un bisogno concreto con valore misurabile.', projectBuiltWith: 'Realizzato con',
  },
  pt: {
    and: 'e', current: 'atualmente',
    summaryLead: 'Profissional', summarySpecialized: 'Especializado em',
    summaryClose: 'Combino experiência operacional, foco em resultados e capacidade de transformar necessidades em realizações concretas.',
    experienceLead: ['Liderança de', 'Conceção e implementação de', 'Coordenação de', 'Otimização de'],
    companyAt: 'na',
    experienceTail: 'com acompanhamento regular de prioridades, prazos e qualidade.',
    experienceCollab: 'Colaboração com as partes interessadas e implementação de melhorias concretas para reforçar a eficiência.',
    educationAt: 'na', educationClose: 'Formação complementada por projetos aplicados e uma abordagem orientada para resultados.',
    projectClose: 'Uma solução criada para responder a uma necessidade concreta com valor mensurável.', projectBuiltWith: 'Realizado com',
  },
  nl: {
    and: 'en', current: 'momenteel',
    summaryLead: 'Professional', summarySpecialized: 'Gespecialiseerd in',
    summaryClose: 'Ik combineer operationele expertise, resultaatgerichtheid en het vermogen om behoeften om te zetten in concrete resultaten.',
    experienceLead: ['Aansturing van', 'Ontwerp en uitvoering van', 'Coördinatie van', 'Optimalisatie van'],
    companyAt: 'bij',
    experienceTail: 'met regelmatige opvolging van prioriteiten, deadlines en kwaliteit.',
    experienceCollab: 'Samenwerking met stakeholders en invoering van concrete verbeteringen voor meer efficiëntie.',
    educationAt: 'bij', educationClose: 'Opleiding aangevuld met toegepaste projecten en een resultaatgerichte aanpak.',
    projectClose: 'Een praktische oplossing voor een concrete behoefte met meetbare waarde.', projectBuiltWith: 'Gebouwd met',
  },
  ar: {
    and: 'و', current: 'حاليا',
    summaryLead: 'متخصص', summarySpecialized: 'متخصص في',
    summaryClose: 'أجمع بين الخبرة العملية والتركيز على النتائج والقدرة على تحويل الاحتياجات إلى إنجازات ملموسة.',
    experienceLead: ['إدارة', 'تصميم وتنفيذ', 'تنسيق', 'تحسين'],
    companyAt: 'في',
    experienceTail: 'مع متابعة منتظمة للأولويات والمواعيد والجودة.',
    experienceCollab: 'التعاون مع أصحاب المصلحة واقتراح تحسينات عملية لتعزيز الكفاءة.',
    educationAt: 'في', educationClose: 'تكوين مدعوم بمشاريع تطبيقية ومنهجية تركز على النتائج.',
    projectClose: 'حل عملي مصمم للاستجابة لحاجة واضحة بقيمة قابلة للقياس.', projectBuiltWith: 'تم إنجازه باستخدام',
  },
};

/**
 * Générateur local de rédaction professionnelle. Il fonctionne hors-ligne,
 * à partir des mots-clés fournis, et peut ensuite être remplacé par une API IA.
 */
export function generateProfessionalText(context: WritingContext): string {
  const t = labels[context.language] ?? labels.fr;
  const prompt = clean(context.prompt);
  const existing = clean(context.existing);
  const role = clean(context.role || '') || (context.language === 'fr' ? 'professionnel' : t.summaryLead.toLowerCase());
  const company = clean(context.company || '');
  const school = clean(context.school || '');
  const technologies = list(context.technologies || '');
  const techText = technologies.length ? technologies.join(', ') : '';
  const keywords = prompt || existing;

  if (context.kind === 'summary') {
    const details = keywords ? ` ${t.summarySpecialized} ${keywords}.` : '';
    return `${t.summaryLead} ${role}${details} Reconnu pour sa rigueur, son autonomie et sa capacité à collaborer efficacement avec des équipes pluridisciplinaires. ${t.summaryClose}`;
  }

  if (context.kind === 'experience') {
    const items = list(keywords);
    const focus = items.length ? items.slice(0, 4) : [
      context.language === 'fr' ? 'les missions principales et les priorités de l’équipe' : 'key priorities and team objectives',
    ];
    const verbs = t.experienceLead;
    const bullets = focus.map((item, index) => {
      const verb = verbs[index % verbs.length];
      const tail = company ? ` ${t.companyAt} ${company}` : '';
      return `• ${verb} ${item}${tail}, ${t.experienceTail}`;
    });
    bullets.push(`• ${t.experienceCollab}`);
    return bullets.join('\n');
  }

  if (context.kind === 'education') {
    const focus = keywords || (context.language === 'fr' ? 'une spécialisation dans le domaine étudié' : 'a specialization in the chosen field');
    return `${cap(focus)}${school ? ` ${t.educationAt} ${school}` : ''}. ${t.educationClose}`;
  }

  const projectName = clean(context.project || '') || (context.language === 'fr' ? 'Ce projet' : 'This project');
  const techSentence = techText
    ? ` ${t.projectBuiltWith} ${techText}.`
    : '';
  return `${projectName} : ${cap(keywords || (context.language === 'fr' ? 'réalisation professionnelle orientée résultats' : 'results-oriented professional achievement'))}.${techSentence} ${t.projectClose}`;
}

// ---------- Appels API réels (Groq / Gemini) ----------

async function callGroq(ctx: AIPromptContext, settings: AISettings): Promise<string[]> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.groqKey.trim()}` },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: buildSystemPrompt(ctx) },
        { role: 'user', content: buildUserPrompt(ctx) },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Groq (${res.status}) : ${detail.slice(0, 140)}`);
  }
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? '';
  if (!text.trim()) throw new Error('Réponse Groq vide.');
  return extractVariants(text);
}

async function callGemini(ctx: AIPromptContext, settings: AISettings): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${encodeURIComponent(settings.geminiKey.trim())}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(ctx) }] }],
        generationConfig: { temperature: 0.7 },
      }),
    },
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini (${res.status}) : ${detail.slice(0, 140)}`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text.trim()) throw new Error('Réponse Gemini vide.');
  return extractVariants(text);
}

/** Génère via l’IA choisie (Groq ou Gemini). Retourne une ou plusieurs variantes. */
export async function generateWithAI(ctx: AIPromptContext, settings: AISettings): Promise<string[]> {
  if (!hasActiveKey(settings)) throw new Error('Aucune clé API configurée.');
  return settings.provider === 'groq' ? callGroq(ctx, settings) : callGemini(ctx, settings);
}


/* ------------------------------------------------------------------ */
/* Analyse d'une offre d'emploi (Priorit� 1)                           */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set(['le','la','les','des','une','un','et','de','du','en','pour','avec','vous','notre','vos','sur','dans','au','aux','est','que','qui','nous','se','son','sa','ses','par','plus','tout','tous','the','and','for','with','our','your']);

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export interface JobKeywordMatch { word: string; count: number; present: boolean; }
export interface JobOfferAnalysis { keywords: JobKeywordMatch[]; missing: string[]; atsRate: number; }

/** Compare le CV (texte complet) � une offre coll�e : mots-cl�s, manques, taux ATS. */
export function analyzeJobOffer(cvText: string, offer: string): JobOfferAnalysis {
  const cvWords = new Set(normalize(cvText).split(/[^a-z0-9+#]+/).filter(w => w.length > 2));
  const offerWords = offer.split(/[^a-zA-Z�-�0-9+#]+/).map(normalize).filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of offerWords) freq.set(w, (freq.get(w) ?? 0) + 1);
  const keywords = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count, present: cvWords.has(word) }));
  const matched = keywords.filter(k => k.present).length;
  return {
    keywords,
    missing: keywords.filter(k => !k.present).map(k => k.word),
    atsRate: keywords.length ? Math.round((matched / keywords.length) * 100) : 0,
  };
}

/**
 * Résume le CV complet en quelques lignes : permet à l'IA d'adapter
 * le vocabulaire au secteur, au niveau d'expérience et aux compétences réelles.
 */
export function buildProfileContext(data: CVData): string {
  const p = data.personal;
  const parts: string[] = [];
  if (p.title) parts.push(`Titre professionnel : ${p.title}`);
  if (p.summary) parts.push(`Accroche actuelle : ${p.summary.slice(0, 200)}`);
  if (data.skills.length) parts.push(`Compétences : ${data.skills.map(s => s.name).join(', ')}`);
  if (data.experiences.length) {
    const exps = data.experiences.slice(0, 5).map(e =>
      `${e.position} chez ${e.company}${e.current ? ' (poste actuel)' : ''}`).join(' ; ');
    parts.push(`Parcours : ${exps}`);
  }
  if (data.education.length) parts.push(`Formation : ${data.education.slice(0, 3).map(e => e.degree).join(' ; ')}`);
  if (data.languages.length) parts.push(`Langues : ${data.languages.map(l => `${l.name} (${l.level})`).join(', ')}`);
  return parts.join('\n');
}

/** Charge le CV sauvegarde et construit le contexte profil pour l'IA. */
export function buildProfileContextFromStorage(): string | undefined {
  try {
    const raw = localStorage.getItem('cv_builder_data_universal_v1') ?? localStorage.getItem('cv_builder_data');
    if (!raw) return undefined;
    return buildProfileContext(JSON.parse(raw) as CVData) || undefined;
  } catch { return undefined; }
}
