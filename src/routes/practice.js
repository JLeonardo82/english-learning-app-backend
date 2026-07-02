// src/routes/practice.js
const express = require('express');
const { readDb, writeDb } = require('../db');
const { SKILLS, VOCAB } = require('../data/content');
const { updateMastery, DEFAULT_P0 } = require('../bkt');
const { updateVocabState, today, addDays } = require('../spacedRepetition');

const router = express.Router();

function getDueVocab(db, userId, limit) {
  const t = today();
  const due = VOCAB.filter(w => {
    const state = db.vocabState[`${userId}:${w.id}`];
    return !state || state.due <= t;
  });
  if (due.length >= limit) return due.slice(0, limit);

  const rest = VOCAB.filter(w => !due.includes(w)).sort((a, b) => {
    const la = db.vocabState[`${userId}:${a.id}`]?.lastSeen || '0';
    const lb = db.vocabState[`${userId}:${b.id}`]?.lastSeen || '0';
    return la.localeCompare(lb);
  });
  return due.concat(rest).slice(0, limit);
}

function getWeakestSkill(db, userId) {
  let worst = SKILLS[0];
  let worstVal = db.skillMastery[`${userId}:${SKILLS[0].id}`]?.pMastery ?? DEFAULT_P0;
  for (const s of SKILLS) {
    const val = db.skillMastery[`${userId}:${s.id}`]?.pMastery ?? DEFAULT_P0;
    if (val < worstVal) { worst = s; worstVal = val; }
  }
  return worst;
}

function registerSession(db, userId) {
  const streak = db.streaks[userId] || { count: 0, lastActive: null, weeklyDays: 0, weeklyTarget: 5 };
  const t = today();
  if (streak.lastActive === t) {
    // ya contaba hoy, no cambia
  } else if (streak.lastActive === addDays(t, -1)) {
    streak.count += 1;
    streak.lastActive = t;
    streak.weeklyDays = Math.min(streak.weeklyTarget, streak.weeklyDays + 1);
  } else {
    streak.count = 1;
    streak.lastActive = t;
    streak.weeklyDays = 1;
  }
  db.streaks[userId] = streak;
}

// GET /api/practice/route?userId=...
// La "ruta del dia": vocabulario que toca repasar + habilidad mas debil.
router.get('/route', (req, res) => {
  const { userId } = req.query;
  const db = readDb();
  if (!db.users[userId]) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const due = getDueVocab(db, userId, 5);
  const weak = getWeakestSkill(db, userId);

  res.json({
    dueVocabCount: due.length,
    weakestSkill: weak,
    streak: db.streaks[userId]
  });
});

// GET /api/practice/vocab/due?userId=...&limit=5
router.get('/vocab/due', (req, res) => {
  const { userId, limit } = req.query;
  const db = readDb();
  if (!db.users[userId]) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const words = getDueVocab(db, userId, parseInt(limit) || 5);
  res.json({ words });
});

// POST /api/practice/vocab/answer  { userId, wordId, correct }
router.post('/vocab/answer', (req, res) => {
  const { userId, wordId, correct } = req.body;
  const db = readDb();
  const word = VOCAB.find(w => w.id === wordId);
  if (!db.users[userId] || !word) return res.status(404).json({ error: 'Usuario o palabra no encontrada.' });

  const vocabKey = `${userId}:${wordId}`;
  db.vocabState[vocabKey] = updateVocabState(db.vocabState[vocabKey], !!correct);

  const skillKey = `${userId}:${word.skill}`;
  db.skillMastery[skillKey] = {
    pMastery: updateMastery(db.skillMastery[skillKey]?.pMastery, !!correct),
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  res.json({ vocabState: db.vocabState[vocabKey], skillMastery: db.skillMastery[skillKey] });
});

// POST /api/practice/session-complete  { userId }
// Marca la sesion como completada (actualiza racha y meta semanal).
router.post('/session-complete', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  if (!db.users[userId]) return res.status(404).json({ error: 'Usuario no encontrado.' });

  registerSession(db, userId);
  writeDb(db);
  res.json({ streak: db.streaks[userId] });
});

// GET /api/practice/progress?userId=...
router.get('/progress', (req, res) => {
  const { userId } = req.params ? req.query.userId : null;
  const db = readDb();
  const uid = req.query.userId;
  if (!db.users[uid]) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const skills = SKILLS.map(s => ({
    ...s,
    pMastery: db.skillMastery[`${uid}:${s.id}`]?.pMastery ?? DEFAULT_P0
  }));

  res.json({
    level: db.users[uid].level,
    streak: db.streaks[uid],
    skills
  });
});

module.exports = router;
