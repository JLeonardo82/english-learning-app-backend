// src/routes/users.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../db');
const { today } = require('../spacedRepetition');

const router = express.Router();

// POST /api/users  { name, motivation, birthdate }
router.post('/', (req, res) => {
  const { name, motivation, birthdate } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }

  const db = readDb();
  const userId = uuidv4();

  db.users[userId] = {
    id: userId,
    name: name.trim(),
    motivation: motivation || null,
    birthdate: birthdate || null,
    level: null,
    diagnosticDone: false,
    createdAt: new Date().toISOString()
  };
  db.streaks[userId] = { count: 0, lastActive: null, weeklyDays: 0, weeklyTarget: 5 };

  writeDb(db);
  res.status(201).json(db.users[userId]);
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  const db = readDb();
  const user = db.users[req.params.id];
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ ...user, streak: db.streaks[req.params.id] });
});

module.exports = router;
