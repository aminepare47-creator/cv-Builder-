export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  linkedIn: string;
  website: string;
  photo: string;
  summary: string;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
}

export interface Language {
  id: string;
  name: string;
  level: string; // A1, A2, B1, B2, C1, C2, Native
}

export interface Hobby {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  /** Outils, méthodes, disciplines ou supports utilisés pour la réalisation. */
  technologies: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  contact: string;
}

import type { CVLanguage } from '../i18n/labels';
export type { CVLanguage };

export type TemplateType =
  | 'modern' | 'classic' | 'creative' | 'minimal' | 'elegant'
  | 'timeline' | 'tech' | 'magazine' | 'infographic' | 'mosaic';
export type ColorScheme = 'blue' | 'emerald' | 'purple' | 'red' | 'amber' | 'slate' | 'rose' | 'indigo';

export interface CustomSection {
  id: string;
  title: string;
  icon: string;
  items: string[];
  visible: boolean;
}

export interface CVOptions {
  showPhoto: boolean;
  showSummary: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showSkills: boolean;
  showLanguages: boolean;
  showHobbies: boolean;
  showProjects: boolean;
  showCertifications: boolean;
  showReferences: boolean;
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'sm' | 'md' | 'lg';
  spacing: 'compact' | 'normal' | 'relaxed';
}

export interface CVData {
  personal: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  hobbies: Hobby[];
  projects: Project[];
  certifications: Certification[];
  references: Reference[];
  customSections: CustomSection[];
  template: TemplateType;
  color: ColorScheme;
  language: CVLanguage;
  options: CVOptions;
}

export const COLOR_MAP: Record<ColorScheme, { primary: string; secondary: string; accent: string; name: string; hex: string }> = {
  blue: { primary: '#2563eb', secondary: '#dbeafe', accent: '#1e40af', name: 'Bleu', hex: '#2563eb' },
  emerald: { primary: '#059669', secondary: '#d1fae5', accent: '#065f46', name: 'Émeraude', hex: '#059669' },
  purple: { primary: '#7c3aed', secondary: '#ede9fe', accent: '#5b21b6', name: 'Violet', hex: '#7c3aed' },
  red: { primary: '#dc2626', secondary: '#fee2e2', accent: '#991b1b', name: 'Rouge', hex: '#dc2626' },
  amber: { primary: '#d97706', secondary: '#fef3c7', accent: '#92400e', name: 'Ambre', hex: '#d97706' },
  slate: { primary: '#475569', secondary: '#f1f5f9', accent: '#1e293b', name: 'Ardoise', hex: '#475569' },
  rose: { primary: '#e11d48', secondary: '#ffe4e6', accent: '#9f1239', name: 'Rose', hex: '#e11d48' },
  indigo: { primary: '#4f46e5', secondary: '#e0e7ff', accent: '#3730a3', name: 'Indigo', hex: '#4f46e5' },
};

export const TEMPLATES: { id: TemplateType; name: string; description: string; preview: string; badge?: string }[] = [
  { id: 'modern', name: 'Moderne', description: 'Sidebar colorée, valeur sûre', preview: 'Mo' },
  { id: 'classic', name: 'Classique', description: 'Sobre, intemporel, ATS-friendly', preview: 'Cl' },
  { id: 'creative', name: 'Créatif', description: 'Badges colorés et pastilles', preview: 'Cr' },
  { id: 'minimal', name: 'Minimaliste', description: 'Épuré, aéré, typographique', preview: 'Mi' },
  { id: 'elegant', name: 'Élégant', description: 'Centré, serif raffiné', preview: 'El' },
  { id: 'timeline', name: 'Frise', description: 'Chronologie verticale numérotée', preview: 'Fr', badge: 'Nouveau' },
  { id: 'tech', name: 'Nocturne', description: 'Fond sombre et accents lumineux', preview: 'No', badge: 'Nouveau' },
  { id: 'magazine', name: 'Magazine', description: 'Éditorial, lettrine, colonnes', preview: 'Ma', badge: 'Nouveau' },
  { id: 'infographic', name: 'Infographie', description: 'Anneaux, stats et jauges', preview: 'In', badge: 'Nouveau' },
  { id: 'mosaic', name: 'Mosaïque', description: 'Blocs géométriques asymétriques', preview: 'Mos', badge: 'Nouveau' },
];

export const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'];

export const createExampleCV = (): CVData => ({
  personal: {
    firstName: 'Sophie',
    lastName: 'Martin',
    title: 'Responsable de projet et opérations',
    email: 'sophie.martin@email.com',
    phone: '+33 6 12 34 56 78',
    address: '15 rue de la République',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    linkedIn: 'linkedin.com/in/sophiemartin',
    website: 'sophiemartin.fr',
    photo: '',
    summary: 'Responsable de projet avec plus de 7 ans d’expérience dans la coordination d’équipes, le suivi budgétaire et l’amélioration des parcours clients. J’aime transformer des objectifs en plans d’action clairs et faire avancer les projets avec méthode, écoute et sens du résultat.',
  },
  experiences: [
    {
      id: '1',
      position: 'Responsable de projet',
      company: 'Maison Horizon',
      location: 'Paris, France',
      startDate: '2021-01',
      endDate: '',
      current: true,
      description: '• Pilotage de 12 projets simultanés, de la définition du besoin au bilan final\n• Coordination d’une équipe de 8 personnes et animation des points d’avancement\n• Suivi des budgets, des délais et de la qualité de service\n• Réduction de 25% des retards grâce à une nouvelle méthode de planification',
    },
    {
      id: '2',
      position: 'Coordinatrice des opérations',
      company: 'Atelier des Possibles',
      location: 'Lyon, France',
      startDate: '2018-09',
      endDate: '2020-12',
      current: false,
      description: '• Organisation quotidienne de l’activité et coordination de 4 équipes\n• Mise en place de tableaux de suivi et d’indicateurs de performance\n• Gestion de la relation avec les partenaires et prestataires\n• Amélioration de 30% du délai moyen de traitement des demandes',
    },
    {
      id: '3',
      position: 'Assistante de coordination',
      company: 'Collectif Central',
      location: 'Bordeaux, France',
      startDate: '2016-09',
      endDate: '2018-07',
      current: false,
      description: '• Préparation des réunions, comptes rendus et documents de décision\n• Accueil et accompagnement des interlocuteurs\n• Organisation des agendas et suivi administratif des dossiers',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'Master Management de projet',
      school: 'Université Paris Dauphine',
      location: 'Paris',
      startDate: '2014-09',
      endDate: '2016-06',
      description: 'Spécialisation en organisation, conduite du changement et pilotage d’équipe. Mention Bien.',
    },
    {
      id: '2',
      degree: 'Licence Administration et gestion',
      school: 'Université de Bordeaux',
      location: 'Bordeaux',
      startDate: '2011-09',
      endDate: '2014-06',
      description: 'Gestion, communication professionnelle, économie et droit des organisations.',
    },
  ],
  skills: [
    { id: '1', name: 'Gestion de projet', level: 5, category: 'Savoir-faire' },
    { id: '2', name: 'Organisation', level: 5, category: 'Savoir-faire' },
    { id: '3', name: 'Communication', level: 5, category: 'Relationnel' },
    { id: '4', name: 'Relation client', level: 4, category: 'Relationnel' },
    { id: '5', name: 'Négociation', level: 4, category: 'Savoir-faire' },
    { id: '6', name: 'Management d’équipe', level: 4, category: 'Relationnel' },
    { id: '7', name: 'Suivi budgétaire', level: 4, category: 'Savoir-faire' },
    { id: '8', name: 'Planification', level: 5, category: 'Savoir-faire' },
    { id: '9', name: 'Excel', level: 4, category: 'Outils' },
    { id: '10', name: 'Prise de parole', level: 4, category: 'Relationnel' },
  ],
  languages: [
    { id: '1', name: 'Français', level: 'Natif' },
    { id: '2', name: 'Anglais', level: 'C1' },
    { id: '3', name: 'Espagnol', level: 'B2' },
  ],
  hobbies: [
    { id: '1', name: 'Photographie' },
    { id: '2', name: 'Voyages' },
    { id: '3', name: 'Course à pied' },
    { id: '4', name: 'Lecture' },
  ],
  projects: [
    {
      id: '1',
      name: 'Forum des métiers locaux',
      description: 'Organisation d’un événement réunissant 35 structures et 600 visiteurs. Coordination des partenaires, du programme et de la communication.',
      link: '',
      technologies: 'Coordination, budget, partenaires',
    },
    {
      id: '2',
      name: 'Parcours d’accueil client',
      description: 'Refonte du parcours d’accueil et création de supports communs, avec une progression mesurée de la satisfaction de 18%.',
      link: '',
      technologies: 'Écoute client, procédures, formation',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Certification conduite de projet',
      issuer: 'Centre de formation professionnelle',
      date: '2022-06',
      link: '',
    },
    {
      id: '2',
      name: 'Formation communication managériale',
      issuer: 'Institut des pratiques professionnelles',
      date: '2020-11',
      link: '',
    },
  ],
  references: [
    {
      id: '1',
      name: 'Claire Bernard',
      position: 'Directrice des opérations',
      company: 'Maison Horizon',
      contact: 'claire.bernard@email.com',
    },
  ],
  template: 'modern',
  color: 'blue',
  language: 'fr',
  customSections: [],
  options: {
    showPhoto: true,
    showSummary: true,
    showExperience: true,
    showEducation: true,
    showSkills: true,
    showLanguages: true,
    showHobbies: true,
    showProjects: true,
    showCertifications: true,
    showReferences: true,
    fontFamily: 'sans',
    fontSize: 'md',
    spacing: 'normal',
  },
});

/** CV réellement vide : aucun champ prérempli à l'ouverture du site. */
export const createEmptyCV = (): CVData => ({
  personal: {
    firstName: '', lastName: '', title: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: '', linkedIn: '',
    website: '', photo: '', summary: '',
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  hobbies: [],
  projects: [],
  certifications: [],
  references: [],
  customSections: [],
  template: 'modern',
  color: 'blue',
  language: 'fr',
  options: {
    showPhoto: true,
    showSummary: true,
    showExperience: true,
    showEducation: true,
    showSkills: true,
    showLanguages: true,
    showHobbies: true,
    showProjects: true,
    showCertifications: true,
    showReferences: true,
    fontFamily: 'sans',
    fontSize: 'md',
    spacing: 'normal',
  },
});
