export type CVLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'nl' | 'ar';

export interface CVLabels {
  dir: 'ltr' | 'rtl';
  contact: string;
  profile: string;
  about: string;
  experience: string;
  experienceLong: string;
  education: string;
  skills: string;
  skillsTech: string;
  languages: string;
  hobbies: string;
  interests: string;
  projects: string;
  projectsPersonal: string;
  certifications: string;
  references: string;
  present: string;
  tech: string;
  technologies: string;
}

export const LANGUAGES: { code: CVLanguage; name: string; native: string; flag: string }[] = [
  { code: 'fr', name: 'Français', native: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'Anglais', native: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Espagnol', native: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Allemand', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italien', native: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugais', native: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Néerlandais', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'ar', name: 'Arabe', native: 'العربية', flag: '🇸🇦' },
];

export const CV_LABELS: Record<CVLanguage, CVLabels> = {
  fr: {
    dir: 'ltr', contact: 'Contact', profile: 'Profil', about: 'À propos',
    experience: 'Expérience', experienceLong: 'Expérience professionnelle', education: 'Formation',
    skills: 'Compétences', skillsTech: 'Compétences', languages: 'Langues',
    hobbies: "Centres d'intérêt", interests: 'Intérêts', projects: 'Projets',
    projectsPersonal: 'Projets personnels', certifications: 'Certifications',
    references: 'Références', present: 'Présent', tech: 'Outils', technologies: 'Outils / méthodes',
  },
  en: {
    dir: 'ltr', contact: 'Contact', profile: 'Profile', about: 'About',
    experience: 'Experience', experienceLong: 'Work Experience', education: 'Education',
    skills: 'Skills', skillsTech: 'Skills', languages: 'Languages',
    hobbies: 'Interests', interests: 'Interests', projects: 'Projects',
    projectsPersonal: 'Personal Projects', certifications: 'Certifications',
    references: 'References', present: 'Present', tech: 'Tools', technologies: 'Tools / methods',
  },
  es: {
    dir: 'ltr', contact: 'Contacto', profile: 'Perfil', about: 'Sobre mí',
    experience: 'Experiencia', experienceLong: 'Experiencia profesional', education: 'Formación',
    skills: 'Competencias', skillsTech: 'Competencias', languages: 'Idiomas',
    hobbies: 'Intereses', interests: 'Intereses', projects: 'Proyectos',
    projectsPersonal: 'Proyectos personales', certifications: 'Certificaciones',
    references: 'Referencias', present: 'Actual', tech: 'Herramientas', technologies: 'Herramientas / métodos',
  },
  de: {
    dir: 'ltr', contact: 'Kontakt', profile: 'Profil', about: 'Über mich',
    experience: 'Erfahrung', experienceLong: 'Berufserfahrung', education: 'Ausbildung',
    skills: 'Kenntnisse', skillsTech: 'Kenntnisse', languages: 'Sprachen',
    hobbies: 'Interessen', interests: 'Interessen', projects: 'Projekte',
    projectsPersonal: 'Eigene Projekte', certifications: 'Zertifikate',
    references: 'Referenzen', present: 'Heute', tech: 'Werkzeuge', technologies: 'Werkzeuge / Methoden',
  },
  it: {
    dir: 'ltr', contact: 'Contatti', profile: 'Profilo', about: 'Chi sono',
    experience: 'Esperienza', experienceLong: 'Esperienza professionale', education: 'Formazione',
    skills: 'Competenze', skillsTech: 'Competenze', languages: 'Lingue',
    hobbies: 'Interessi', interests: 'Interessi', projects: 'Progetti',
    projectsPersonal: 'Progetti personali', certifications: 'Certificazioni',
    references: 'Referenze', present: 'Attuale', tech: 'Strumenti', technologies: 'Strumenti / metodi',
  },
  pt: {
    dir: 'ltr', contact: 'Contacto', profile: 'Perfil', about: 'Sobre mim',
    experience: 'Experiência', experienceLong: 'Experiência profissional', education: 'Formação',
    skills: 'Competências', skillsTech: 'Competências', languages: 'Idiomas',
    hobbies: 'Interesses', interests: 'Interesses', projects: 'Projetos',
    projectsPersonal: 'Projetos pessoais', certifications: 'Certificações',
    references: 'Referências', present: 'Atual', tech: 'Ferramentas', technologies: 'Ferramentas / métodos',
  },
  nl: {
    dir: 'ltr', contact: 'Contact', profile: 'Profiel', about: 'Over mij',
    experience: 'Ervaring', experienceLong: 'Werkervaring', education: 'Opleiding',
    skills: 'Vaardigheden', skillsTech: 'Vaardigheden', languages: 'Talen',
    hobbies: 'Interesses', interests: 'Interesses', projects: 'Projecten',
    projectsPersonal: 'Eigen projecten', certifications: 'Certificeringen',
    references: 'Referenties', present: 'Heden', tech: 'Hulpmiddelen', technologies: 'Hulpmiddelen / methodes',
  },
  ar: {
    dir: 'rtl', contact: 'معلومات الاتصال', profile: 'الملف الشخصي', about: 'نبذة عني',
    experience: 'الخبرة', experienceLong: 'الخبرة المهنية', education: 'التعليم',
    skills: 'المهارات', skillsTech: 'المهارات', languages: 'اللغات',
    hobbies: 'الاهتمامات', interests: 'الاهتمامات', projects: 'المشاريع',
    projectsPersonal: 'مشاريع شخصية', certifications: 'الشهادات',
    references: 'المراجع', present: 'حتى الآن', tech: 'الأدوات', technologies: 'الأدوات / الأساليب',
  },
};

const MONTHS_SHORT: Record<CVLanguage, string[]> = {
  fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  it: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  nl: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

const MONTHS_LONG: Record<CVLanguage, string[]> = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  nl: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
  ar: MONTHS_SHORT.ar,
};

export function getLabels(lang: CVLanguage = 'fr'): CVLabels {
  return CV_LABELS[lang] ?? CV_LABELS.fr;
}

export function formatCVDate(date: string, lang: CVLanguage = 'fr', style: 'short' | 'long' = 'short'): string {
  if (!date) return '';
  const [year, month] = date.split('-');
  const idx = parseInt(month, 10) - 1;
  const table = style === 'long' ? MONTHS_LONG[lang] ?? MONTHS_LONG.fr : MONTHS_SHORT[lang] ?? MONTHS_SHORT.fr;
  if (isNaN(idx) || !table[idx]) return year || date;
  return `${table[idx]} ${year}`;
}
