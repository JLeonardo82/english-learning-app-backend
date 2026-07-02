// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usersRouter = require('./src/routes/users');
const diagnosticRouter = require('./src/routes/diagnostic');
const practiceRouter = require('./src/routes/practice');
const avatarRouter = require('./src/routes/avatar');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/users', usersRouter);
app.use('/api/diagnostic', diagnosticRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/avatar', avatarRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
