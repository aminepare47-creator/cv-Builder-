import type { CVData } from '../types/cv';

/**
 * Score de qualité du CV (Priorité 6) — note sur 100 avec 12 critères,
 * recommandations concrètes et estimation de compatibilité ATS.
 */
export interface ScoreCriterion {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number;
  advice: string;
}

export interface CVScore {
  total: number;
  criteria: ScoreCriterion[];
  recommendations: string[];
  atsScore: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const norm = (words: number, ideal: number, tolerance: number) =>
  clamp(100 - (Math.abs(words - ideal) / tolerance) * 100);

export function computeCVScore(data: CVData): CVScore {
  const p = data.personal;
  const criteria: ScoreCriterion[] = [];

  // 1. Lisibilité — longueur totale du CV
  const totalWords = [
    p.summary, ...data.experiences.map(e => e.description), ...data.education.map(e => e.description),
  ].join(' ').split(/\s+/).filter(Boolean).length;
  criteria.push({
    key: 'readability', label: 'Lisibilité', weight: 8,
    score: norm(totalWords, 450, 400),
    advice: totalWords > 700 ? 'CV trop long : visez 1 à 2 pages, condensez les descriptions.' : totalWords < 200 ? 'CV trop court : développez vos expériences.' : 'Longueur bien maîtrisée.',
  });

  // 2. Structure — sections remplies
  const filledSections = [
    p.summary, data.experiences.length, data.education.length, data.skills.length, data.languages.length,
  ].filter(v => (typeof v === 'string' ? v.trim() : v > 0)).length;
  criteria.push({
    key: 'structure', label: 'Structure', weight: 10,
    score: (filledSections / 5) * 100,
    advice: filledSections < 4 ? 'Remplissez au minimum : accroche, expériences, formation et compétences.' : 'Structure complète et équilibrée.',
  });

  // 3. Soin de l'écriture — heuristique
  const texts = [p.summary, ...data.experiences.map(e => e.description)].filter(Boolean).join('\n');
  const sentences = texts.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 15);
  const badCaps = sentences.filter(s => /^[a-zà-ÿ]/.test(s)).length;
  const doubleSpaces = (texts.match(/ {2,}/g) || []).length;
  criteria.push({
    key: 'spelling', label: 'Soin de l’écriture', weight: 9,
    score: clamp(100 - badCaps * 12 - doubleSpaces * 8),
    advice: badCaps + doubleSpaces > 3 ? 'Vérifiez majuscules en début de phrase et espaces doubles.' : 'Écriture soignée.',
  });

  // 4. Clarté du titre
  const titleWords = p.title.trim().split(/\s+/).filter(Boolean).length;
  criteria.push({
    key: 'title', label: 'Clarté du titre', weight: 9,
    score: norm(titleWords, 4, 5),
    advice: titleWords < 3 ? 'Précisez votre titre (ex. : « Responsable de projet web »).' : titleWords > 8 ? 'Titre trop long : gardez le poste principal.' : 'Titre clair et professionnel.',
  });

  // 5. Quantité d'informations
  const itemCounts = data.experiences.length + data.education.length + data.skills.length + data.projects.length + data.certifications.length + (data.customSections?.length ?? 0);
  criteria.push({
    key: 'quantity', label: 'Quantité d’informations', weight: 7,
    score: clamp(itemCounts * 8),
    advice: itemCounts < 6 ? 'Ajoutez des expériences, formations ou projets pour enrichir le CV.' : 'Bonne densité d’informations.',
  });

  // 6. Expériences quantifiées
  const quantified = data.experiences.filter(e => /\d/.test(e.description)).length;
  criteria.push({
    key: 'quantified', label: 'Expériences quantifiées', weight: 10,
    score: data.experiences.length ? (quantified / data.experiences.length) * 100 : 0,
    advice: quantified < data.experiences.length ? 'Ajoutez des résultats chiffrés (%, montants, effectifs).' : 'Chaque expérience contient des résultats mesurables.',
  });

  // 7. Compatibilité ATS
  const atsFields = [p.firstName, p.lastName, p.email, p.phone, p.title, p.summary].filter(v => v.trim()).length;
  const atsSkills = Math.min(100, (data.skills.length / 10) * 100);
  criteria.push({
    key: 'ats', label: 'Compatibilité ATS', weight: 12,
    score: (atsFields / 6) * 60 + atsSkills * 0.4,
    advice: atsFields < 6 ? 'Complétez nom, email, téléphone, titre et accroche — les logiciels de recrutement lisent ces champs.' : data.skills.length < 8 ? 'Ajoutez des compétences avec des mots-clés de votre secteur.' : 'Bonne structure lisible par les logiciels de recrutement.',
  });

  // 8. Qualité des compétences
  criteria.push({
    key: 'skills', label: 'Qualité des compétences', weight: 8,
    score: clamp((data.skills.length / 12) * 100),
    advice: data.skills.length > 16 ? 'Trop de compétences : gardez 8 à 12 compétences maîtrisées.' : data.skills.length < 6 ? 'Listez davantage de compétences techniques et transversales.' : 'Sélection de compétences pertinente.',
  });

  // 9. Cohérence des dates
  let dateIssues = 0;
  for (const e of data.experiences) {
    if (!e.startDate) { dateIssues++; continue; }
    if (!e.current && e.endDate && e.endDate < e.startDate) dateIssues++;
  }
  criteria.push({
    key: 'dates', label: 'Cohérence des dates', weight: 8,
    score: data.experiences.length ? clamp(100 - (dateIssues / data.experiences.length) * 100) : 0,
    advice: dateIssues > 0 ? 'Certaines dates sont incohérentes (fin avant début, dates manquantes).' : 'Chronologie claire et cohérente.',
  });

  // 10. Longueur du résumé
  const summaryWords = p.summary.split(/\s+/).filter(Boolean).length;
  criteria.push({
    key: 'summaryLength', label: 'Longueur du résumé', weight: 7,
    score: norm(summaryWords, 45, 30),
    advice: summaryWords > 75 ? 'Votre résumé est trop long : visez 3 à 4 phrases.' : summaryWords < 20 ? 'Résumé trop court : ajoutez spécialisation et valeur ajoutée.' : 'Résumé à la bonne longueur.',
  });

  // 11. Présence des coordonnées
  const contacts = [p.email, p.phone, p.city].filter(v => v.trim()).length;
  criteria.push({
    key: 'contacts', label: 'Coordonnées', weight: 6,
    score: (contacts / 3) * 100,
    advice: contacts < 3 ? 'Indiquez au minimum email, téléphone et ville.' : 'Coordonnées complètes.',
  });

  // 12. Cohérence visuelle
  const visual = 50 + (data.color ? 25 : 0) + (data.options.showPhoto && !p.photo ? 0 : 25);
  criteria.push({
    key: 'visual', label: 'Cohérence visuelle', weight: 6,
    score: visual,
    advice: data.options.showPhoto && !p.photo ? 'Photo demandée mais absente : ajoutez-la via le studio photo.' : 'Mise en page homogène.',
  });

  const total = Math.round(criteria.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0));
  const ats = Math.round(criteria.find(c => c.key === 'ats')!.score);

  const recommendations: string[] = [];
  if (summaryWords > 75) recommendations.push('Votre résumé est trop long — condensez-le en 3 phrases.');
  if (quantified < data.experiences.length) recommendations.push('Ajoutez des résultats chiffrés dans vos expériences.');
  if (titleWords < 3) recommendations.push('Votre titre est trop vague par rapport à votre poste cible.');
  if (data.skills.length > 16) recommendations.push('Votre CV contient trop de compétences — gardez les plus pertinentes.');
  if (data.experiences.some(e => e.description && !/\d/.test(e.description))) recommendations.push('Certaines expériences ne contiennent aucune réalisation chiffrée.');
  if (dateIssues > 0) recommendations.push('Vérifiez la cohérence des dates de vos expériences.');
  if (contacts < 3) recommendations.push('Complétez vos coordonnées (email, téléphone, ville).');
  if (!recommendations.length) recommendations.push('Excellent CV ! Pensez simplement à l’adapter à chaque offre d’emploi.');

  return { total, criteria, recommendations, atsScore: ats };
}

export const scoreGrade = (s: number) =>
  s >= 85 ? 'Excellent' : s >= 70 ? 'Bon' : s >= 50 ? 'À améliorer' : 'Faible';
