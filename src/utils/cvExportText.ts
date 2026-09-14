import type { CVData } from '../types/cv';

/** Exports texte (Priorité 5) : TXT, Markdown et DOC (Word). */

const fmtDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return m ? `${months[parseInt(m, 10) - 1] ?? m} ${y}` : y;
};

const period = (s: string, e: string, current: boolean) => {
  const start = fmtDate(s);
  const end = current ? 'aujourd’hui' : fmtDate(e);
  return [start, end].filter(Boolean).join(' – ');
};

export function buildPlainText(data: CVData): string {
  const p = data.personal;
  const lines: string[] = [];
  lines.push(`${p.firstName} ${p.lastName}`.trim());
  if (p.title) lines.push(p.title);
  const contacts = [p.email, p.phone, [p.postalCode, p.city].filter(Boolean).join(' '), p.country, p.linkedIn, p.website].filter(Boolean);
  if (contacts.length) lines.push(contacts.join(' · '));
  if (p.summary) lines.push('', 'PROFIL', p.summary);
  if (data.experiences.length) {
    lines.push('', 'EXPÉRIENCES PROFESSIONNELLES');
    for (const e of data.experiences) {
      lines.push(`${e.position} — ${e.company}${e.location ? `, ${e.location}` : ''} (${period(e.startDate, e.endDate, e.current)})`);
      if (e.description) lines.push(e.description);
    }
  }
  if (data.education.length) {
    lines.push('', 'FORMATION');
    for (const e of data.education) {
      lines.push(`${e.degree} — ${e.school} (${period(e.startDate, e.endDate, false)})`);
      if (e.description) lines.push(e.description);
    }
  }
  if (data.skills.length) lines.push('', 'COMPÉTENCES', data.skills.map(s => s.name).join(', '));
  if (data.languages.length) lines.push('', 'LANGUES', data.languages.map(l => `${l.name} (${l.level})`).join(', '));
  if (data.projects.length) {
    lines.push('', 'PROJETS');
    for (const pr of data.projects) lines.push(`${pr.name} : ${pr.description}`);
  }
  if (data.certifications.length) {
    lines.push('', 'CERTIFICATIONS');
    for (const c of data.certifications) lines.push(`${c.name} — ${c.issuer} (${fmtDate(c.date)})`);
  }
  for (const s of data.customSections?.filter(s => s.visible) ?? []) {
    lines.push('', s.title.toUpperCase(), ...s.items.filter(Boolean));
  }
  return lines.join('\n');
}

export function buildMarkdown(data: CVData): string {
  const p = data.personal;
  const md: string[] = [];
  md.push(`# ${p.firstName} ${p.lastName}`.trim());
  if (p.title) md.push(`**${p.title}**`);
  const contacts = [p.email, p.phone, [p.postalCode, p.city].filter(Boolean).join(' '), p.linkedIn, p.website].filter(Boolean);
  if (contacts.length) md.push(contacts.join(' · '));
  if (p.summary) md.push('', '## Profil', p.summary);
  if (data.experiences.length) {
    md.push('', '## Expériences professionnelles');
    for (const e of data.experiences) {
      md.push(`### ${e.position} — ${e.company}`);
      md.push(`*${period(e.startDate, e.endDate, e.current)}${e.location ? ` · ${e.location}` : ''}*`);
      if (e.description) md.push(e.description.split('\n').map(l => l.trim()).filter(Boolean).map(l => (l.startsWith('•') ? `- ${l.slice(1).trim()}` : l)).join('\n'));
    }
  }
  if (data.education.length) {
    md.push('', '## Formation');
    for (const e of data.education) {
      md.push(`### ${e.degree} — ${e.school}`);
      md.push(`*${period(e.startDate, e.endDate, false)}*`);
      if (e.description) md.push(e.description);
    }
  }
  if (data.skills.length) md.push('', '## Compétences', data.skills.map(s => s.name).join(', '));
  if (data.languages.length) md.push('', '## Langues', data.languages.map(l => `- **${l.name}** : ${l.level}`).join('\n'));
  if (data.projects.length) {
    md.push('', '## Projets');
    for (const pr of data.projects) md.push(`- **${pr.name}** : ${pr.description}`);
  }
  if (data.certifications.length) {
    md.push('', '## Certifications');
    for (const c of data.certifications) md.push(`- **${c.name}** — ${c.issuer} (${fmtDate(c.date)})`);
  }
  for (const s of data.customSections?.filter(s => s.visible) ?? []) {
    md.push('', `## ${s.title}`, ...s.items.filter(Boolean).map(i => `- ${i}`));
  }
  return md.join('\n');
}

const download = (content: string | Blob, filename: string, mime: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
};

const baseName = (data: CVData) =>
  `CV_${data.personal.firstName}_${data.personal.lastName}`.replace(/\s+/g, '_');

export function exportTXT(data: CVData) {
  download(buildPlainText(data), `${baseName(data)}.txt`, 'text/plain;charset=utf-8');
}

export function exportMarkdown(data: CVData) {
  download(buildMarkdown(data), `${baseName(data)}.md`, 'text/markdown;charset=utf-8');
}

/** DOC lisible par Microsoft Word (HTML adapté). */
export function exportDOC(data: CVData) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const p = data.personal;
  const body: string[] = [];
  body.push(`<h1>${esc(p.firstName + ' ' + p.lastName)}</h1>`);
  if (p.title) body.push(`<p style="font-size:14px"><b>${esc(p.title)}</b></p>`);
  const contacts = [p.email, p.phone, [p.postalCode, p.city].filter(Boolean).join(' '), p.linkedIn, p.website].filter(Boolean);
  if (contacts.length) body.push(`<p>${esc(contacts.join(' · '))}</p>`);
  if (p.summary) body.push(`<h2>Profil</h2><p>${esc(p.summary)}</p>`);
  if (data.experiences.length) {
    body.push('<h2>Expériences professionnelles</h2>');
    for (const e of data.experiences) {
      body.push(`<p><b>${esc(e.position)} — ${esc(e.company)}</b><br/><i>${esc(period(e.startDate, e.endDate, e.current))}</i></p>`);
      if (e.description) body.push(`<p>${esc(e.description).replace(/\n/g, '<br/>')}</p>`);
    }
  }
  if (data.education.length) {
    body.push('<h2>Formation</h2>');
    for (const e of data.education) {
      body.push(`<p><b>${esc(e.degree)} — ${esc(e.school)}</b> <i>(${esc(period(e.startDate, e.endDate, false))})</i></p>`);
      if (e.description) body.push(`<p>${esc(e.description)}</p>`);
    }
  }
  if (data.skills.length) body.push(`<h2>Compétences</h2><p>${esc(data.skills.map(s => s.name).join(', '))}</p>`);
  if (data.languages.length) body.push(`<h2>Langues</h2><p>${esc(data.languages.map(l => `${l.name} (${l.level})`).join(', '))}</p>`);
  for (const s of data.customSections?.filter(s => s.visible) ?? []) {
    body.push(`<h2>${esc(s.title)}</h2><ul>${s.items.filter(Boolean).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`);
  }
  const html = `<html><head><meta charset="utf-8"><title>CV</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:12px">${body.join('\n')}</body></html>`;
  download(new Blob(['\ufeff', html], { type: 'application/msword' }), `${baseName(data)}.doc`, 'application/msword');
}

