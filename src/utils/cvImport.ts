import { CVData, createEmptyCV, Experience, Education, Skill } from '../types/cv';

const uid = () => Math.random().toString(36).slice(2, 11);

/* ------------------------------------------------------------------ */
/* 1. Extraction du texte selon le type de fichier                     */
/* ------------------------------------------------------------------ */

export async function extractTextFromFile(file: File): Promise<{ text: string; json?: Partial<CVData> }> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.json')) {
    const raw = await file.text();
    return { text: '', json: JSON.parse(raw) };
  }

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const pdfjs: any = await import('pdfjs-dist');
    const WorkerCtor: any = (await import('pdfjs-dist/build/pdf.worker.min.mjs?worker&inline')).default;
    pdfjs.GlobalWorkerOptions.workerPort = new WorkerCtor();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let lastY: number | null = null;
      let line = '';
      for (const item of content.items as any[]) {
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 3) { out += line.trim() + '\n'; line = ''; }
        line += item.str + (item.hasEOL ? '\n' : ' ');
        lastY = y;
      }
      out += line.trim() + '\n\n';
    }
    return { text: out };
  }

  if (name.endsWith('.txt') || name.endsWith('.md') || file.type.startsWith('text/')) {
    return { text: await file.text() };
  }

  if (name.endsWith('.docx')) {
    // extraction basique du XML interne (sans dépendance externe)
    const buf = new Uint8Array(await file.arrayBuffer());
    const asStr = new TextDecoder('latin1').decode(buf);
    const matches = asStr.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (matches && matches.length) {
      return { text: matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ') };
    }
    throw new Error('DOCX compressé non lisible : exportez votre CV en PDF ou copiez-collez le texte.');
  }

  throw new Error('Format non pris en charge. Utilisez un PDF, TXT, DOCX ou JSON, ou collez le texte.');
}

/* ------------------------------------------------------------------ */
/* 2. Analyse du texte → données structurées                           */
/* ------------------------------------------------------------------ */

const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^(profil|profile|à propos|a propos|about|résumé|resume|summary|objectif|presentation|présentation)\b/i,
  experience: /^(exp[ée]riences?|work experience|professional experience|parcours|emplois?|career|experiencia)\b/i,
  education: /^(formations?|education|dipl[ôo]mes?|[ée]tudes|academic|scolarit[ée]|formaci[óo]n)\b/i,
  skills: /^(comp[ée]tences?|skills|technical skills|savoir[- ]faire|aptitudes?|qualifications?|expertise|technologies|competencias|habilidades)\b/i,
  languages: /^(langues?|languages|idiomas|sprachen)\b/i,
  hobbies: /^(centres? d.int[ée]r[êe]ts?|loisirs|hobbies|interests|activit[ée]s)\b/i,
  projects: /^(projets?|projects|r[ée]alisations?|portfolio)\b/i,
  certifications: /^(certifications?|certificats?|dipl[ôo]mes compl[ée]mentaires|licences?|accr[ée]ditations)\b/i,
  references: /^(r[ée]f[ée]rences?|references)\b/i,
};

const MONTHS: Record<string, number> = {
  jan: 1, janv: 1, january: 1, janvier: 1, feb: 2, fev: 2, fév: 2, février: 2, fevrier: 2, february: 2,
  mar: 3, mars: 3, march: 3, apr: 4, avr: 4, avril: 4, april: 4, mai: 5, may: 5,
  jun: 6, juin: 6, june: 6, jul: 7, juil: 7, juillet: 7, july: 7,
  aug: 8, aou: 8, aoû: 8, août: 8, aout: 8, august: 8, sep: 9, sept: 9, septembre: 9, september: 9,
  oct: 10, octobre: 10, october: 10, nov: 11, novembre: 11, november: 11,
  dec: 12, déc: 12, décembre: 12, decembre: 12, december: 12,
};

const CURRENT_WORDS = /(pr[ée]sent|aujourd.hui|actuel|en cours|current|now|today|ongoing|heute|actualidad)/i;

const DATE_RANGE = new RegExp(
  String.raw`((?:[A-Za-zÀ-ÿ]{3,10}\.?\s*)?\d{4}|\d{1,2}[\/\.]\d{4})\s*(?:-|–|—|to|à|au|jusqu'?[àa]|bis)\s*((?:[A-Za-zÀ-ÿ]{3,10}\.?\s*)?\d{4}|\d{1,2}[\/\.]\d{4}|` +
  String.raw`pr[ée]sent|aujourd'hui|actuel|en cours|current|now|today|ongoing)`, 'i');

function toISO(token: string): string {
  if (!token) return '';
  const t = token.trim().toLowerCase();
  let m = t.match(/^(\d{1,2})[\/\.](\d{4})$/);
  if (m) return `${m[2]}-${m[1].padStart(2, '0')}`;
  m = t.match(/^([a-zà-ÿ]{3,10})\.?\s*(\d{4})$/);
  if (m) {
    const mon = MONTHS[m[1].replace('.', '')] ?? MONTHS[m[1].slice(0, 4)] ?? MONTHS[m[1].slice(0, 3)];
    if (mon) return `${m[2]}-${String(mon).padStart(2, '0')}`;
    return `${m[2]}-01`;
  }
  m = t.match(/(\d{4})/);
  return m ? `${m[1]}-01` : '';
}

const KNOWN_LANGUAGES = ['français', 'francais', 'french', 'anglais', 'english', 'espagnol', 'spanish', 'español',
  'allemand', 'german', 'deutsch', 'italien', 'italian', 'portugais', 'portuguese', 'arabe', 'arabic',
  'chinois', 'chinese', 'mandarin', 'russe', 'russian', 'japonais', 'japanese', 'néerlandais', 'dutch'];

const LEVEL_MAP: { re: RegExp; level: string }[] = [
  { re: /(natif|native|maternelle|mother ?tongue|langue maternelle|bilingue|bilingual)/i, level: 'Natif' },
  { re: /\bC2\b|courant sup/i, level: 'C2' },
  { re: /\bC1\b|courant|fluent|avanc[ée]/i, level: 'C1' },
  { re: /\bB2\b|interm[ée]diaire sup|upper/i, level: 'B2' },
  { re: /\bB1\b|interm[ée]diaire|intermediate/i, level: 'B1' },
  { re: /\bA2\b|[ée]l[ée]mentaire|basic/i, level: 'A2' },
  { re: /\bA1\b|d[ée]butant|beginner|notions/i, level: 'A1' },
];

export interface ParseResult {
  data: CVData;
  stats: Record<string, number>;
  improvements: string[];
}

export function parseCVText(text: string, base?: CVData): ParseResult {
  const cv: CVData = base ? { ...base } : createEmptyCV();
  const empty = createEmptyCV();
  cv.personal = { ...empty.personal, firstName: '', lastName: '', title: '', email: '', phone: '', address: '', city: '', postalCode: '', country: '', linkedIn: '', website: '', photo: cv.personal?.photo ?? '', summary: '' };
  cv.experiences = []; cv.education = []; cv.skills = []; cv.languages = [];
  cv.hobbies = []; cv.projects = []; cv.certifications = []; cv.references = [];

  const lines = text.replace(/\r/g, '').split('\n').map(l => l.replace(/[•▪●·]\s*/g, '• ').trim()).filter(Boolean);
  const joined = lines.join('\n');

  /* --- Contact --- */
  const email = joined.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/);
  if (email) cv.personal.email = email[0];
  const phone = joined.match(/(\+?\d{1,3}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?){2,5}\d{2,4}/g)?.find(p => p.replace(/\D/g, '').length >= 9);
  if (phone) cv.personal.phone = phone.trim();
  const li = joined.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[\w\-\/%.]+/i);
  if (li) cv.personal.linkedIn = li[0].replace(/^https?:\/\//, '');
  const site = joined.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin)[\w-]+\.(?:com|fr|dev|io|net|org|me|co)(?:\/[\w\-\/%.]*)?/i);
  if (site && !site[0].includes('@')) cv.personal.website = site[0].replace(/^https?:\/\//, '');
  const cp = joined.match(/\b(\d{5})\s+([A-ZÀ-Ÿ][\wÀ-ÿ'’\- ]{2,30})\b/);
  if (cp) { cv.personal.postalCode = cp[1]; cv.personal.city = cp[2].trim(); }
  if (/france/i.test(joined)) cv.personal.country = 'France';

  /* --- Nom & titre (en-tête) --- */
  const header = lines.slice(0, 8);
  const nameLine = header.find(l =>
    /^[A-ZÀ-Ÿ][\p{L}'’-]+(\s+[A-ZÀ-Ÿ][\p{L}'’.-]+){1,3}$/u.test(l) &&
    !/@|\d|curriculum|vitae|resume/i.test(l) && l.length < 45);
  if (nameLine) {
    const parts = nameLine.split(/\s+/);
    cv.personal.firstName = parts[0];
    cv.personal.lastName = parts.slice(1).join(' ');
  }
  const titleKeywords = /(agricul|architect|artiste|assistant|avocat|boulanger|charg[ée]|chef|comptable|commercial|consultant|coordinateur|cuisin|data|dentiste|designer|directeur|[ée]ducateur|enseignant|engineer|expert|formateur|graphiste|infirmier|ing[ée]nieur|journaliste|juriste|manager|marketing|m[ée]decin|notaire|photographe|plombier|professeur|psychologue|qualit[ée]|responsable|rh|ressources humaines|secr[ée]taire|sp[ée]cialiste|technicien|vendeur|web|developer|d[ée]veloppeur)/i;
  const titleLine = header.find(l =>
    l !== nameLine && l.length > 5 && l.length < 70 && !/@|\d{4}|https?:\/\//.test(l) && titleKeywords.test(l))
    ?? header.find(l => l !== nameLine && l.length > 5 && l.length < 70 && !/@|\d|https?:\/\//.test(l) && !SECTION_PATTERNS.summary.test(l));
  if (titleLine) cv.personal.title = titleLine.replace(/^[-•|]\s*/, '');

  /* --- Découpage par sections --- */
  type Sec = { key: string; lines: string[] };
  const sections: Sec[] = [];
  let current: Sec = { key: 'header', lines: [] };
  for (const line of lines) {
    const clean = line.replace(/^[•\-–—\s]+/, '').replace(/[:：]\s*$/, '').trim();
    const hit = Object.entries(SECTION_PATTERNS).find(([, re]) => re.test(clean) && clean.length < 45);
    if (hit) { sections.push(current); current = { key: hit[0], lines: [] }; }
    else current.lines.push(line);
  }
  sections.push(current);
  const get = (k: string) => sections.filter(s => s.key === k).flatMap(s => s.lines);

  /* --- Résumé --- */
  const sum = get('summary').join(' ').trim();
  if (sum.length > 30) cv.personal.summary = sum.slice(0, 900);

  /* --- Expériences --- */
  const parseEntries = (src: string[]) => {
    const entries: { start: string; end: string; current: boolean; head: string[]; body: string[] }[] = [];
    let cur: typeof entries[number] | null = null;
    for (const raw of src) {
      const m = raw.match(DATE_RANGE);
      if (m) {
        const isCurrent = CURRENT_WORDS.test(m[2]);
        cur = { start: toISO(m[1]), end: isCurrent ? '' : toISO(m[2]), current: isCurrent, head: [], body: [] };
        const rest = raw.replace(m[0], ' ').replace(/^[\s|•\-–—,:]+|[\s|•\-–—,:]+$/g, '').trim();
        if (rest) cur.head.push(rest);
        entries.push(cur);
      } else if (cur) {
        if (cur.head.length < 2 && !/^•/.test(raw) && raw.length < 80) cur.head.push(raw);
        else cur.body.push(raw);
      }
    }
    return entries;
  };

  for (const e of parseEntries(get('experience'))) {
    const headTxt = e.head.join(' — ');
    const parts = headTxt.split(/\s*(?:—|–|-|\||,|chez|at|@)\s*/).filter(Boolean);
    const exp: Experience = {
      id: uid(),
      position: (parts[0] || 'Poste').trim(),
      company: (parts[1] || '').trim(),
      location: (parts.find(p => /^[A-ZÀ-Ÿ][\wÀ-ÿ'’\- ]{2,25}$/.test(p.trim()) && p !== parts[0] && p !== parts[1]) || '').trim(),
      startDate: e.start, endDate: e.end, current: e.current,
      description: e.body.join('\n'),
    };
    if (exp.position.length > 1) cv.experiences.push(exp);
  }

  for (const e of parseEntries(get('education'))) {
    const headTxt = e.head.join(' — ');
    const parts = headTxt.split(/\s*(?:—|–|-|\||,)\s*/).filter(Boolean);
    const edu: Education = {
      id: uid(),
      degree: (parts[0] || 'Diplôme').trim(),
      school: (parts[1] || '').trim(),
      location: (parts[2] || '').trim(),
      startDate: e.start, endDate: e.end,
      description: e.body.join(' ').slice(0, 300),
    };
    if (edu.degree.length > 1) cv.education.push(edu);
  }

  /* --- Compétences --- */
  const skillTokens = get('skills')
    .flatMap(l => l.split(/[,;|•·\/]+|\s{3,}/))
    .map(s => s.replace(/^[\s\-–—•]+|[\s.:]+$/g, '').trim())
    .filter(s => s.length > 1 && s.length < 32 && !/^\d+$/.test(s));
  const seen = new Set<string>();
  for (const s of skillTokens) {
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const lvlMatch = s.match(/(\d)\s*\/\s*5/);
    const sk: Skill = {
      id: uid(),
      name: s.replace(/\(?\d\s*\/\s*5\)?/, '').trim(),
      level: lvlMatch ? parseInt(lvlMatch[1]) : 4,
      category: 'Savoir-faire',
    };
    if (sk.name) cv.skills.push(sk);
    if (cv.skills.length >= 24) break;
  }

  /* --- Langues --- */
  for (const l of get('languages')) {
    for (const chunk of l.split(/[,;|•·]+/)) {
      const low = chunk.toLowerCase();
      const found = KNOWN_LANGUAGES.find(k => low.includes(k));
      if (!found) continue;
      if (cv.languages.some(x => x.name.toLowerCase().includes(found.slice(0, 5)))) continue;
      const lvl = LEVEL_MAP.find(x => x.re.test(chunk))?.level ?? 'B2';
      cv.languages.push({ id: uid(), name: found.charAt(0).toUpperCase() + found.slice(1), level: lvl });
    }
  }

  /* --- Loisirs --- */
  for (const h of get('hobbies').flatMap(l => l.split(/[,;|•·]+/))) {
    const v = h.replace(/^[\s\-–—]+/, '').trim();
    if (v.length > 2 && v.length < 30 && cv.hobbies.length < 8) cv.hobbies.push({ id: uid(), name: v });
  }

  /* --- Projets --- */
  const projLines = get('projects');
  for (let i = 0; i < projLines.length; i++) {
    const l = projLines[i];
    if (l.length < 4) continue;
    if (/^•/.test(l) && cv.projects.length) {
      cv.projects[cv.projects.length - 1].description += ' ' + l.replace(/^•\s*/, '');
    } else if (cv.projects.length < 6) {
      cv.projects.push({ id: uid(), name: l.replace(/^[•\-–—\s]+/, '').slice(0, 80), description: projLines[i + 1] && !/^•/.test(projLines[i + 1]) ? '' : '', link: '', technologies: '' });
    }
  }

  /* --- Certifications --- */
  for (const c of get('certifications')) {
    if (c.length < 4 || cv.certifications.length >= 8) continue;
    const y = c.match(/(\d{4})/);
    cv.certifications.push({
      id: uid(),
      name: c.replace(/^[•\-–—\s]+/, '').replace(/[,–—-]?\s*\d{4}\s*$/, '').slice(0, 90),
      issuer: '', date: y ? `${y[1]}-01` : '', link: '',
    });
  }

  const stats = {
    experiences: cv.experiences.length,
    education: cv.education.length,
    skills: cv.skills.length,
    languages: cv.languages.length,
    projects: cv.projects.length,
    certifications: cv.certifications.length,
  };

  const { data, improvements } = improveCV(cv);
  return { data, stats, improvements };
}

/* ------------------------------------------------------------------ */
/* 3. Amélioration automatique                                         */
/* ------------------------------------------------------------------ */

const ACTION_VERBS = [
  'piloté', 'conçu', 'développé', 'optimisé', 'géré', 'coordonné', 'déployé', 'automatisé', 'analysé', 'encadré',
  'organisé', 'accompagné', 'formé', 'animé', 'négocié', 'vendu', 'créé', 'rédigé', 'préparé', 'assuré',
  'led', 'managed', 'designed', 'created', 'organized', 'trained', 'coordinated', 'delivered', 'improved',
];

const titleCase = (s: string) =>
  s.replace(/\S+/g, w => (w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()));

const cleanText = (s: string) => s.replace(/\s{2,}/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();

const sentenceCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function improveCV(input: CVData): { data: CVData; improvements: string[] } {
  const cv: CVData = JSON.parse(JSON.stringify(input));
  const imp: string[] = [];

  // Identité
  if (cv.personal.firstName) {
    const before = cv.personal.firstName + ' ' + cv.personal.lastName;
    cv.personal.firstName = titleCase(cv.personal.firstName.trim());
    cv.personal.lastName = cv.personal.lastName.trim().toUpperCase();
    if (before !== `${cv.personal.firstName} ${cv.personal.lastName}`) imp.push('Nom et prénom normalisés (typographie professionnelle)');
  }
  if (cv.personal.title) {
    const t = sentenceCase(cleanText(cv.personal.title));
    if (t !== cv.personal.title) imp.push('Titre professionnel nettoyé');
    cv.personal.title = t;
  }
  if (cv.personal.email) cv.personal.email = cv.personal.email.toLowerCase();
  if (cv.personal.phone) {
    const digits = cv.personal.phone.replace(/[^\d+]/g, '');
    if (/^0\d{9}$/.test(digits)) {
      cv.personal.phone = digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
      imp.push('Numéro de téléphone reformaté');
    }
  }

  // Expériences
  cv.experiences = cv.experiences.map(e => {
    const desc = e.description
      .split('\n')
      .map(l => l.replace(/^[\s\-–—*·]+/, '').trim())
      .filter(l => l.length > 2)
      .map(l => (l.startsWith('•') ? l : '• ' + sentenceCase(cleanText(l))))
      .join('\n');
    return {
      ...e,
      position: sentenceCase(cleanText(e.position)),
      company: cleanText(e.company),
      description: desc,
    };
  });
  if (cv.experiences.some(e => e.description.includes('•'))) imp.push('Descriptions converties en puces lisibles et homogènes');

  // Tri antéchronologique
  const key = (d: string) => (d ? parseInt(d.replace('-', ''), 10) : 0);
  const sorted = [...cv.experiences].sort((a, b) =>
    (b.current ? 999999 : key(b.endDate || b.startDate)) - (a.current ? 999999 : key(a.endDate || a.startDate)));
  if (JSON.stringify(sorted.map(e => e.id)) !== JSON.stringify(cv.experiences.map(e => e.id))) {
    cv.experiences = sorted;
    imp.push('Expériences triées de la plus récente à la plus ancienne');
  }
  cv.education = [...cv.education].sort((a, b) => key(b.endDate || b.startDate) - key(a.endDate || a.startDate));

  // Compétences : dédoublonnage + casse + catégories
  const seen = new Set<string>();
  const before = cv.skills.length;
  cv.skills = cv.skills.filter(s => {
    const k = s.name.toLowerCase().trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).map(s => {
    const n = s.name.trim();
    const known: Record<string, string> = {
      'react': 'React', 'javascript': 'JavaScript', 'typescript': 'TypeScript', 'node': 'Node.js',
      'nodejs': 'Node.js', 'node.js': 'Node.js', 'python': 'Python', 'java': 'Java', 'sql': 'SQL',
      'html': 'HTML', 'css': 'CSS', 'php': 'PHP', 'docker': 'Docker', 'aws': 'AWS', 'git': 'Git',
      'excel': 'Excel', 'photoshop': 'Photoshop', 'figma': 'Figma', 'vue': 'Vue.js', 'angular': 'Angular',
    };
    const name = known[n.toLowerCase()] ?? (n === n.toLowerCase() ? sentenceCase(n) : n);
    const cat = /\b(react|vue\.?js|angular|html5?|css3?|tailwind|svelte|next\.?js|bootstrap)\b/i.test(name) ? 'Framework'
      : /\b(python|java|php|typescript|javascript|sql|c\+\+|c#|golang|go|rust|ruby|swift|kotlin|scala)\b/i.test(name) ? 'Langage'
      : /\b(docker|aws|azure|gcp|git|github|gitlab|figma|excel|word|powerpoint|photoshop|illustrator|jira|trello|notion|linux|kubernetes|analytics|salesforce|sap)\b/i.test(name) ? 'Outils'
      : /\b(communication|[ée]quipe|leadership|autonomie|rigueur|organisation|cr[ée]ativit[ée]|adaptabilit[ée]|n[ée]gociation|gestion du temps)\b/i.test(name) ? 'Relationnel'
      : 'Savoir-faire';
    return { ...s, name, category: cat, level: Math.min(5, Math.max(1, s.level || 4)) };
  });
  if (cv.skills.length !== before) imp.push(`${before - cv.skills.length} compétence(s) en doublon supprimée(s)`);
  if (cv.skills.length) imp.push('Compétences catégorisées et harmonisées');

  // Résumé
  const s = cv.personal.summary.trim();
  if (s.length < 60) {
    const years = cv.experiences.reduce((acc, e) => {
      const a = parseInt((e.startDate || '').slice(0, 4)) || 0;
      const b = e.current ? new Date().getFullYear() : parseInt((e.endDate || '').slice(0, 4)) || a;
      return acc + Math.max(0, b - a);
    }, 0);
    const top = cv.skills.slice(0, 4).map(x => x.name).join(', ');
    const role = cv.personal.title || cv.experiences[0]?.position || 'Professionnel';
    cv.personal.summary = cleanText(
      `${role}${years ? ` avec ${years} an${years > 1 ? 's' : ''} d'expérience` : ''}` +
      `${top ? `, spécialisé en ${top}` : ''}. ` +
      `Reconnu pour ma rigueur, mon autonomie et ma capacité à mener des projets de bout en bout. ` +
      `À la recherche d'un nouveau défi où apporter une valeur concrète et mesurable.`
    );
    imp.push('Accroche professionnelle générée automatiquement');
  } else {
    cv.personal.summary = sentenceCase(cleanText(s));
  }

  // Conseils qualitatifs
  if (!cv.experiences.some(e => /\d+\s*(%|k€|€|clients?|utilisateurs?|personnes?)/i.test(e.description))) {
    imp.push('Conseil : ajoutez des résultats chiffrés (%, €, volumes) à vos expériences');
  }
  if (cv.experiences.some(e => e.description && !ACTION_VERBS.some(v => e.description.toLowerCase().includes(v)))) {
    imp.push('Conseil : démarrez vos puces par un verbe d’action adapté à votre métier (Piloté, Organisé, Créé, Accompagné…)');
  }
  if (!cv.personal.linkedIn) imp.push('Conseil : ajoutez votre profil LinkedIn pour renforcer votre crédibilité');

  return { data: cv, improvements: imp };
}
