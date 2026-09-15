/**
 * Proxy IA serverless (Vercel) avec BASCULEMENT AUTOMATIQUE.
 *
 * La clÃ© API reste SECRÃˆTE cÃ´tÃ© serveur (variables d'environnement).
 * Les utilisateurs de l'application n'ont RIEN Ã  configurer.
 *
 * Variables d'environnement : GROQ_API_KEY et/ou GEMINI_API_KEY
 *
 * POST /api/ai { provider, model, system, user, temperature? }
 *   â†’ essaie le modÃ¨le demandÃ©, puis les autres modÃ¨les gratuits disponibles
 *     (Groq puis Gemini) dÃ¨s qu'un modÃ¨le atteint sa limite ou est saturÃ©.
 *   â†’ { text, provider, model, fallback }
 */
const GROQ_CHAIN = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'groq/compound',
  'allam-2-7b',
];
const GEMINI_CHAIN = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

const cooldown = new Map();
const COOLDOWN_MS = 60000;
const inCooldown = (id) => (cooldown.get(id) ?? 0) > Date.now();
const setCooldown = (id) => cooldown.set(id, Date.now() + COOLDOWN_MS);

function shouldTryNext(status, detail) {
  if ([404, 429, 500, 502, 503, 504].includes(status)) return true;
  const d = (detail || '').toLowerCase();
  return ['rate limit', 'rate_limit', 'quota', 'overloaded', 'capacity', 'not exist', 'too many requests', 'unavailable']
    .some((k) => d.includes(k));
}

async function callGroq(key, model, system, user, temperature) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  return {
    ok: r.ok,
    status: r.status,
    text: j?.choices?.[0]?.message?.content ?? '',
    detail: j?.error?.message ?? JSON.stringify(j).slice(0, 200),
  };
}

async function callGemini(key, model, system, user, temperature) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model)
    + ':generateContent?key=' + encodeURIComponent(key);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature },
    }),
  });
  const j = await r.json().catch(() => ({}));
  return {
    ok: r.ok,
    status: r.status,
    text: j?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '',
    detail: j?.error?.message ?? JSON.stringify(j).slice(0, 200),
  };
}
/** Ordre des tentatives : modÃ¨le demandÃ©, puis les autres modÃ¨les gratuits. */
function buildAttempts(provider, model) {
  const attempts = [];
  const push = (p, m) => {
    if (m && !attempts.some((a) => a.provider === p && a.model === m)) attempts.push({ provider: p, model: m });
  };
  const groqOk = !!process.env.GROQ_API_KEY;
  const geminiOk = !!process.env.GEMINI_API_KEY;

  if (provider === 'gemini' && geminiOk) {
    if (model && model.startsWith('gemini')) push('gemini', model);
    GEMINI_CHAIN.forEach((m) => push('gemini', m));
    if (groqOk) GROQ_CHAIN.forEach((m) => push('groq', m));
  } else if (groqOk) {
    if (model && !model.startsWith('gemini')) push('groq', model);
    GROQ_CHAIN.forEach((m) => push('groq', m));
    if (geminiOk) GEMINI_CHAIN.forEach((m) => push('gemini', m));
  } else if (geminiOk) {
    if (model && model.startsWith('gemini')) push('gemini', model);
    GEMINI_CHAIN.forEach((m) => push('gemini', m));
  }
  return attempts;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      groq: !!process.env.GROQ_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      groqModels: GROQ_CHAIN,
      geminiModels: GEMINI_CHAIN,
    });
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { model, system, user, temperature = 0.7 } = req.body ?? {};
    if (!system || !user) return res.status(400).json({ error: 'system et user requis' });
    if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Aucune clÃ© IA configurÃ©e sur le serveur' });
    }

    const provider = req.body?.provider ?? 'groq';
    const attempts = buildAttempts(provider, model);
    const errors = [];
    let authError = false;

    // Passe 1 : on Ã©vite les modÃ¨les en limite rÃ©cente. Passe 2 : on les retente.
    outer:
    for (const pass of [0, 1]) {
      for (const a of attempts) {
        const id = a.provider + ':' + a.model;
        if (pass === 0 && inCooldown(id) && attempts.length > 1) continue;

        const out = a.provider === 'groq'
          ? await callGroq(process.env.GROQ_API_KEY, a.model, system, user, temperature)
          : await callGemini(process.env.GEMINI_API_KEY, a.model, system, user, temperature);

        if (out.ok && out.text.trim()) {
          return res.status(200).json({
            text: out.text,
            provider: a.provider,
            model: a.model,
            fallback: id !== provider + ':' + model,
          });
        }

        const retry = shouldTryNext(out.status, out.detail);
        if (retry) setCooldown(id);
        if (out.status === 401 || out.status === 403) authError = true;
        errors.push(id + ' -> ' + out.status + ' ' + String(out.detail).slice(0, 80));
        if (!retry) break outer;
      }
    }

    if (authError) {
      return res.status(401).json({
        error: 'La clé IA configurée sur le serveur est invalide ou a été révoquée.',
        attempts: errors.slice(0, 8),
      });
    }

    return res.status(429).json({
      error: 'Tous les modÃ¨les gratuits sont momentanÃ©ment indisponibles (limites atteintes). RÃ©essayez dans une minute.',
      attempts: errors.slice(0, 8),
    });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}