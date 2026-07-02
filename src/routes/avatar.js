// src/routes/avatar.js
//
// El punto mas importante de este archivo: la API key de Anthropic vive SOLO
// en el servidor (process.env.ANTHROPIC_API_KEY), nunca se envia al cliente.
// En el prototipo de artifact esto no era un problema porque el entorno lo
// gestiona; en produccion real, un frontend que llame directo a la API con
// la key embebida expondria la key a cualquiera que inspeccione el trafico.

const express = require('express');
const { readDb, writeDb } = require('../db');
const { SCENARIOS, SKILLS } = require('../data/content');
const { updateMastery, DEFAULT_P0 } = require('../bkt');

const router = express.Router();

function getWeakestSkill(db, userId) {
  let worst = SKILLS[0];
  let worstVal = db.skillMastery[`${userId}:${SKILLS[0].id}`]?.pMastery ?? DEFAULT_P0;
  for (const s of SKILLS) {
    const val = db.skillMastery[`${userId}:${s.id}`]?.pMastery ?? DEFAULT_P0;
    if (val < worstVal) { worst = s; worstVal = val; }
  }
  return worst;
}

function buildSystemPrompt(scenario, level, weakSkillName) {
  return `Eres Emma, a warm, friendly conversation partner from Manchester helping a Spanish-speaking student practice English through natural spoken conversation.

STUDENT PROFILE:
- CEFR level: ${level}
- Currently reinforcing: ${weakSkillName}
- Correction mode: immersion (do NOT interrupt the flow with explicit corrections; use natural implicit recasts only)

LANGUAGE RULES:
- Use vocabulary and grammar appropriate for ${level}, with occasional slightly higher-level structures.
- Keep your "response" SHORT (1-3 sentences), warm and conversational, like a real chat message.

CONVERSATION RULES:
- Ask genuine follow-up questions that push the student to elaborate (avoid yes/no questions when possible).
- If something is ambiguous, ask for clarification naturally.
- Use implicit recasts: repeat back the corrected form naturally inside your reply, never announce the correction.

SCENARIO: ${scenario.prompt}

RESPOND WITH ONLY VALID JSON, no markdown fences, no extra text, exactly this shape:
{"response": "your natural conversational reply in English", "analysis": {"errors_detected": [{"original":"...","corrected":"...","error_type":"...","severity":"minor|moderate|major"}], "notable_good_usage": ["..."]}}`;
}

// POST /api/avatar/chat
// { userId, scenarioId, message, apiHistory: [{role, content}, ...] }
router.post('/chat', async (req, res) => {
  const { userId, scenarioId, message, apiHistory } = req.body;
  const db = readDb();
  const user = db.users[userId];
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!user || !scenario) return res.status(404).json({ error: 'Usuario o escenario no encontrado.' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY no está configurada en el servidor. Ver README para instrucciones de despliegue.'
    });
  }

  const weak = getWeakestSkill(db, userId);
  const systemPrompt = buildSystemPrompt(scenario, user.level || 'A1', weak.name);
  const history = [...(apiHistory || []), { role: 'user', content: message }];

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: history
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(502).json({ error: 'Error llamando a la API de Claude.', detail: errText });
    }

    const data = await apiRes.json();
    const raw = (data.content || []).map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({
      response: parsed.response,
      analysis: parsed.analysis || { errors_detected: [], notable_good_usage: [] },
      apiHistory: [...history, { role: 'assistant', content: raw }]
    });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo procesar la respuesta del avatar.', detail: String(err) });
  }
});

// POST /api/avatar/finish
// { userId, scenarioId, errorsBySkill: [...], goodUsageBySkill: [...] }
// Aplica el feedback acumulado de la conversacion al motor BKT.
router.post('/finish', (req, res) => {
  const { userId, scenarioId, errorCount, goodUsageCount } = req.body;
  const db = readDb();
  const user = db.users[userId];
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!user || !scenario) return res.status(404).json({ error: 'Usuario o escenario no encontrado.' });

  const skillKey = `${userId}:${scenario.skill}`;
  let p = db.skillMastery[skillKey]?.pMastery ?? DEFAULT_P0;

  for (let i = 0; i < (errorCount || 0); i++) p = updateMastery(p, false);
  for (let i = 0; i < (goodUsageCount || 0); i++) p = updateMastery(p, true);
  if (!errorCount && !goodUsageCount) p = updateMastery(p, true);

  db.skillMastery[skillKey] = { pMastery: p, updatedAt: new Date().toISOString() };
  writeDb(db);

  res.json({ skillMastery: db.skillMastery[skillKey] });
});

router.get('/scenarios', (_req, res) => {
  res.json({ scenarios: SCENARIOS.map(s => ({ id: s.id, title: s.title })) });
});

module.exports = router;
