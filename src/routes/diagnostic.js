// src/routes/diagnostic.js
//
// Version simplificada del CAT documentado en diagnostico_inicial_CAT.md
// (solo el equivalente al Componente 2: gramatica adaptativa). El bucle
// de seleccion de item es un "staircase" de 2 niveles de dificultad, que
// aproxima el comportamiento de un CAT real (seleccionar el item cuya
// dificultad esta mas cerca de la habilidad estimada del usuario) sin
// requerir un banco de items calibrado con IRT/Elo desde el dia 1 --
// exactamente la ruta pragmatica que documentamos.

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../db');
const { DIAG_T1, DIAG_T2 } = require('../data/content');
const { updateMastery } = require('../bkt');

const router = express.Router();
const TOTAL_QUESTIONS = 8;

function buildSession() {
  return {
    pool1: shuffle([...DIAG_T1]),
    pool2: shuffle([...DIAG_T2]),
    difficulty: 1,
    answered: 0,
    score: 0,
    current: null
  };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickQuestion(session) {
  let pool = session.difficulty === 1 ? session.pool1 : session.pool2;
  if (pool.length === 0) pool = session.difficulty === 1 ? session.pool2 : session.pool1;
  const q = pool.shift();
  session.current = q;
  return q;
}

// POST /api/diagnostic/start  { userId }
router.post('/start', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  if (!db.users[userId]) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const sessionId = uuidv4();
  const session = buildSession();
  const q = pickQuestion(session);
  db.diagnosticSessions[sessionId] = { userId, ...session };
  writeDb(db);

  res.json({
    sessionId,
    questionNumber: 1,
    totalQuestions: TOTAL_QUESTIONS,
    question: { q: q.q, options: q.options }
  });
});

// POST /api/diagnostic/answer  { sessionId, answerIndex }
router.post('/answer', (req, res) => {
  const { sessionId, answerIndex } = req.body;
  const db = readDb();
  const session = db.diagnosticSessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Sesión de diagnóstico no encontrada.' });

  const q = session.current;
  const correct = answerIndex === q.answer;

  if (correct) {
    session.score += session.difficulty;
    session.difficulty = Math.min(2, session.difficulty + 1);
  } else {
    session.score -= 0.5;
    session.difficulty = 1;
  }

  const user = db.users[session.userId];
  const skillKey = `${session.userId}:${q.skill}`;
  db.skillMastery[skillKey] = {
    pMastery: updateMastery(db.skillMastery[skillKey]?.pMastery, correct),
    updatedAt: new Date().toISOString()
  };

  session.answered += 1;

  if (session.answered >= TOTAL_QUESTIONS) {
    const level = session.score >= 7 ? 'A2' : 'A1';
    user.level = level;
    user.diagnosticDone = true;
    delete db.diagnosticSessions[sessionId];
    writeDb(db);
    return res.json({ done: true, correct, level });
  }

  const nextQ = pickQuestion(session);
  db.diagnosticSessions[sessionId] = session;
  writeDb(db);

  res.json({
    done: false,
    correct,
    questionNumber: session.answered + 1,
    totalQuestions: TOTAL_QUESTIONS,
    question: { q: nextQ.q, options: nextQ.options }
  });
});

module.exports = router;
