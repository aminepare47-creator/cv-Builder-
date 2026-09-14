import type { TemplateType } from '../types/cv';

/**
 * Profils métiers prêts à l'emploi (Priorité 3).
 * Chaque secteur propose : compétences adaptées, mots-clés ATS,
 * exemples de formulations, sections recommandées et modèle visuel conseillé.
 */
export interface JobProfile {
  id: string;
  name: string;
  icon: string;
  titleExample: string;
  skills: string[];
  keywords: string[];
  phrases: string[];
  suggestedSections: string[];
  template: TemplateType;
  color: 'blue' | 'emerald' | 'purple' | 'red' | 'amber' | 'slate' | 'rose' | 'indigo';
}

export const JOB_PROFILES: JobProfile[] = [
  {
    id: 'commerce', name: 'Commerce et vente', icon: '🛍️',
    titleExample: 'Vendeur / Responsable de secteur',
    skills: ['Technique de vente', 'Relation client', 'Négociation', 'Merchandising', 'Gestion des stocks', 'CRM'],
    keywords: ['chiffre d’affaires', 'portefeuille clients', 'fidélisation', 'prospection', 'marge'],
    phrases: ['Développement d’un portefeuille de 80 clients fidèles', 'Progression du chiffre d’affaires de 15% sur l’exercice'],
    suggestedSections: ['Réalisations principales', 'Réseaux sociaux'],
    template: 'modern', color: 'blue',
  },
  {
    id: 'sante', name: 'Santé', icon: '🏥',
    titleExample: 'Infirmier / Aide-soignant',
    skills: ['Soins cliniques', 'Suivi des patients', 'Protocoles d’hygiène', 'Urgences', 'Dossier patient informatisé', 'Équipe pluridisciplinaire'],
    keywords: ['soins', 'patients', 'protocoles', 'hygiène', 'coordination médicale', 'urgence'],
    phrases: ['Prise en charge quotidienne de 25 patients en service de médecine', 'Application rigoureuse des protocoles d’hygiène et de sécurité'],
    suggestedSections: ['Disponibilité', 'Permis de conduire'],
    template: 'classic', color: 'emerald',
  },
  {
    id: 'enseignement', name: 'Enseignement', icon: '🎓',
    titleExample: 'Enseignant / Formateur',
    skills: ['Conception de séquences pédagogiques', 'Différenciation', 'Évaluation', 'Gestion de classe', 'Pédagogie active'],
    keywords: ['pédagogie', 'programme', 'évaluation', 'remédiation', 'projet d’école'],
    phrases: ['Conception et animation de séquences pédagogiques pour 3 classes', 'Progression mesurée des résultats de la classe (+12%)'],
    suggestedSections: ['Réalisations principales', 'Publications'],
    template: 'elegant', color: 'indigo',
  },
  {
    id: 'administration', name: 'Administration', icon: '🗂️',
    titleExample: 'Assistant(e) administratif(ve)',
    skills: ['Gestion administrative', 'Rédaction de courriers', 'Classement et archivage', 'Gestion d’agenda', 'Outils bureautiques', 'Accueil client'],
    keywords: ['classement', 'agenda', 'bureautique', 'réclamation', 'dossiers', 'réglementaire'],
    phrases: ['Gestion administrative de 150 dossiers clients avec zéro retard', 'Organisation complète de l’agenda de la direction'],
    suggestedSections: ['Informations complémentaires', 'Disponibilité'],
    template: 'classic', color: 'slate',
  },
  {
    id: 'droit', name: 'Droit', icon: '⚖️',
    titleExample: 'Juriste / Assistant juridique',
    skills: ['Rédaction d’actes', 'Veille juridique', 'Droit des contrats', 'Contentieux', 'Analyse de risques', 'Recherche jurisprudentielle'],
    keywords: ['contrats', 'contentieux', 'jurisprudence', 'conformité', 'RGPD', 'mise en deme'],
    phrases: ['Rédaction et négociation de 40 contrats commerciaux par an', 'Veille juridique et conformité RGPD pour l’ensemble des services'],
    suggestedSections: ['Publications', 'Références professionnelles'],
    template: 'elegant', color: 'slate',
  },
  {
    id: 'finance', name: 'Finance et comptabilité', icon: '📊',
    titleExample: 'Comptable / Contrôleur de gestion',
    skills: ['Comptabilité générale', 'États financiers', 'Rapprochements bancaires', 'Analyse des écarts', 'Budget prévisionnel', 'Sage / SAP'],
    keywords: ['clôture', 'bilan', 'trésorerie', 'budget', 'audit', 'reporting financier'],
    phrases: ['Fiabilisation des clôtures mensuelles en 3 jours ouvrés', 'Réduction de 20% des écarts d’inventaire'],
    suggestedSections: ['Certifications professionnelles', 'Réalisations principales'],
    template: 'classic', color: 'blue',
  },
  {
    id: 'marketing', name: 'Marketing et communication', icon: '📣',
    titleExample: 'Chargé(e) de marketing digital',
    skills: ['Stratégie de contenu', 'SEO / SEA', 'Community management', 'Emailing', 'Analytics', 'Événementiel'],
    keywords: ['campagne', 'conversion', 'engagement', 'trafic', 'leads', 'notoriété', 'KPI'],
    phrases: ['Gestion de campagnes générant +35% de trafic qualifié', 'Animation de 4 réseaux sociaux avec +8 000 abonnés gagnés'],
    suggestedSections: ['Portfolio', 'Réseaux sociaux', 'Centres d’expertise'],
    template: 'creative', color: 'rose',
  },
  {
    id: 'rh', name: 'Ressources humaines', icon: '🤝',
    titleExample: 'Chargé(e) de recrutement / RH',
    skills: ['Recrutement', 'Sourcing', 'Entretiens structurés', 'Onboarding', 'Gestion de la paie', 'Droit du travail'],
    keywords: ['sourcing', 'onboarding', 'rétention', 'entretien annuel', 'formation', 'SIRH'],
    phrases: ['Recrutement de 45 collaborateurs avec un taux de rétention de 92%', 'Refonte du parcours d’onboarding sur 30 jours'],
    suggestedSections: ['Réalisations principales', 'Activités associatives'],
    template: 'modern', color: 'indigo',
  },
  {
    id: 'hotellerie', name: 'Hôtellerie et restauration', icon: '🍽️',
    titleExample: 'Chef de rang / Réceptionniste',
    skills: ['Service en salle', 'Accueil client', 'Réservations', 'HACCP', 'Gestion des stocks', 'Caisse'],
    keywords: ['accueil', 'service', 'HACCP', 'réservation', 'satisfaction client'],
    phrases: ['Service quotidien de 80 couverts', 'Note de satisfaction client maintenue à 4,7/5'],
    suggestedSections: ['Disponibilité', 'Mobilité géographique'],
    template: 'elegant', color: 'amber',
  },
  {
    id: 'artisanat', name: 'Artisanat', icon: '🔨',
    titleExample: 'Artisan / Chef d’équipe artisanale',
    skills: ['Savoir-faire technique', 'Lecture de plans', 'Finitions', 'Relation client', 'Devis', 'Sécurité chantier'],
    keywords: ['fabrication', 'finition', 'devis', 'matériaux', 'normes', 'chantier'],
    phrases: ['Réalisation de pièces sur mesure pour 60 clients particuliers', 'Respect systématique des délais et des normes de sécurité'],
    suggestedSections: ['Portfolio', 'Permis de conduire'],
    template: 'minimal', color: 'amber',
  },
  {
    id: 'industrie', name: 'Industrie', icon: '🏭',
    titleExample: 'Technicien de production',
    skills: ['Conduite de ligne', 'Maintenance préventive', 'Qualité', 'Lean manufacturing', '5S', 'Sécurité machine'],
    keywords: ['productivité', 'taux de rebut', 'GPAO', 'préventif', 'norme ISO', '5S'],
    phrases: ['Amélioration du taux de rendement synthétique de +6 points', 'Formation de 10 opérateurs aux bonnes pratiques 5S'],
    suggestedSections: ['Certifications professionnelles', 'Disponibilité'],
    template: 'tech', color: 'slate',
  },
  {
    id: 'logistique', name: 'Logistique', icon: '🚚',
    titleExample: 'Responsable logistique / Préparateur',
    skills: ['Gestion de stock', 'WMS', 'Préparation de commandes', 'Transport', 'Inventaires', 'Optimisation des flux'],
    keywords: ['flux', 'préparation', 'inventaire', 'litige transporteur', 'taux de service'],
    phrases: ['Gestion de 2 500 références avec un taux de service de 98%', 'Réduction de 15% des litiges transport'],
    suggestedSections: ['Permis de conduire', 'Mobilité géographique', 'Disponibilité'],
    template: 'timeline', color: 'blue',
  },
  {
    id: 'batiment', name: 'Bâtiment', icon: '🏗️',
    titleExample: 'Chef de chantier / Maçon',
    skills: ['Lecture de plans', 'Gros œuvre', 'Coordination de chantier', 'Sécurité', 'Devis et métrés', 'Réception de travaux'],
    keywords: ['chantier', 'plans', 'coordonnateur', 'sécurité', 'livraison'],
    phrases: ['Coordination de chantiers jusqu’à 25 intervenants', 'Livraison de 12 chantiers sans retard ni réserve majeure'],
    suggestedSections: ['Permis de conduire', 'Portfolio', 'Mobilité géographique'],
    template: 'modern', color: 'amber',
  },
  {
    id: 'culture', name: 'Culture et art', icon: '🎭',
    titleExample: 'Chargé(e) de projets culturels',
    skills: ['Commissariat', 'Médiation culturelle', 'Montage d’exposition', 'Communication', 'Partenariats', 'Budget culturel'],
    keywords: ['exposition', 'publics', 'mécénat', 'médiation', 'programmation', 'patrimoine'],
    phrases: ['Conception d’une exposition accueillant 12 000 visiteurs', 'Montage de 8 partenariats institutionnels et privés'],
    suggestedSections: ['Portfolio', 'Prix et distinctions', 'Publications'],
    template: 'magazine', color: 'purple',
  },
  {
    id: 'sport', name: 'Sport', icon: '🏅',
    titleExample: 'Éducateur sportif / Coach',
    skills: ['Encadrement sportif', 'Plan d’entraînement', 'Sécurité des pratiquants', 'Animation de groupes', 'Préparation physique'],
    keywords: ['encadrement', 'séance', 'plan d’entraînement', 'licence', 'compétition', 'prévention'],
    phrases: ['Encadrement de 150 licenciés sur la saison', 'Organisation de 6 compétitions régionales'],
    suggestedSections: ['Prix et distinctions', 'Disponibilité', 'Permis de conduire'],
    template: 'infographic', color: 'emerald',
  },
  {
    id: 'recherche', name: 'Recherche', icon: '🔬',
    titleExample: 'Chercheur / Doctorant',
    skills: ['Méthodologie expérimentale', 'Analyse de données', 'Rédaction scientifique', 'Valorisation', 'Financement', 'Encadrement de stages'],
    keywords: ['publication', 'protocole', 'peer review', 'financement', 'dataset', 'méthodologie'],
    phrases: ['Publication de 5 articles en revue à comité de lecture', 'Obtention d’un financement de thèse sur projet compétitif'],
    suggestedSections: ['Publications', 'Conférences', 'Prix et distinctions'],
    template: 'minimal', color: 'indigo',
  },
  {
    id: 'informatique', name: 'Informatique', icon: '💻',
    titleExample: 'Développeur / Ingénieur logiciel',
    skills: ['JavaScript / TypeScript', 'React', 'Node.js', 'API REST', 'Git', 'Tests unitaires', 'Cloud (AWS/Azure)'],
    keywords: ['agile', 'sprint', 'code review', 'CI/CD', 'architecture', 'performance', 'tests'],
    phrases: ['Développement d’une application utilisée par 10 000 utilisateurs', 'Automatisation du pipeline CI/CD réduisant les déploiements de 2 h à 10 min'],
    suggestedSections: ['Portfolio', 'Centres d’expertise', 'Certifications professionnelles'],
    template: 'tech', color: 'indigo',
  },
];

