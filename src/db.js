// src/db.js
//
// Persistencia simple basada en archivo JSON. Es una decision de arquitectura
// deliberada: para el MVP, con pocos usuarios concurrentes, esto es suficiente
// y evita la complejidad de levantar Postgres desde el dia 1 (misma logica
// pragmatica que usamos para elegir SM-2 antes que Half-Life Regression:
// empezar simple, migrar cuando el volumen lo justifique).
//
// MIGRACION A PRODUCCION: cuando haya usuarios reales concurrentes, reemplazar
// este archivo por un cliente de Postgres (ej. `pg` o un ORM como Prisma) que
// implemente la misma interfaz (get, set, all, update). El resto del codigo
// (rutas, bkt.js, spacedRepetition.js) no deberia tener que cambiar si se
// respeta esta interfaz.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function ensureDb() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: {},
      diagnosticSessions: {},
      skillMastery: {},   // key: `${userId}:${skillId}` -> { pMastery, updatedAt }
      vocabState: {},     // key: `${userId}:${wordId}` -> { interval, ease, due, lastSeen }
      streaks: {}         // key: userId -> { count, lastActive, weeklyDays, weeklyTarget }
    }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb };
