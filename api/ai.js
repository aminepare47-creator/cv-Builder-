/**
 * Proxy IA serverless (Vercel / Netlify Functions).
 * La clé API reste SECRÈTE côté serveur (variables d'environnement).
 * Les utilisateurs de l'application n'ont RIEN à configurer.
 *
 * Variables d'environnement requises :
 *   - GROQ_API_KEY    (au moins une des deux)
 *   - GEMINI_API_KEY
 *
 * POST /api/ai  { provider: 'groq'|'gemini', model, system, user, temperature? }
 * → { text: string }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // GET : indique au client quelles IA sont disponibles côté serveur.
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      groq: !!process.env.GROQ_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
    });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, system, user, temperature = 0.7 } = req.body ?? {};
    if (!system || !user) return res.status(400).json({ error: 'system et user requis' });

    // Si le fournisseur demandé n'est pas configuré, on bascule sur celui qui l'est.
    let provider = req.body?.provider ?? 'groq';
    if (provider === 'groq' && !process.env.GROQ_API_KEY && process.env.GEMINI_API_KEY) provider = 'gemini';
    if (provider === 'gemini' && !process.env.GEMINI_API_KEY && process.env.GROQ_API_KEY) provider = 'groq';

    let text = '';

    if (provider === 'gemini') {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY non configurée sur le serveur' });
      const m = model && model.startsWith('gemini') ? model : 'gemini-2.0-flash';
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature },
          }),
        },
      );
      if (!r.ok) return res.status(r.status).json({ error: (await r.text()).slice(0, 300) });
      const j = await r.json();
      text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    } else {
      const key = process.env.GROQ_API_KEY;
      if (!key) return res.status(500).json({ error: 'GROQ_API_KEY non configurée sur le serveur' });
      const m = model && !model.startsWith('gemini') ? model : 'openai/gpt-oss-120b';
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: m,
          temperature,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!r.ok) return res.status(r.status).json({ error: (await r.text()).slice(0, 300) });
      const j = await r.json();
      text = j?.choices?.[0]?.message?.content ?? '';
    }

    if (!text.trim()) return res.status(502).json({ error: 'Réponse IA vide' });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
