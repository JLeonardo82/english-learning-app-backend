# Backend — English Learning App (MVP)

Backend real del proyecto: diagnóstico adaptativo, motor de personalización
(BKT + repetición espaciada tipo SM-2), y proxy seguro al avatar conversacional
(Claude API). Corresponde a la Épica 1, 2, 3 y 5 del backlog (`backlog_historias_usuario.md`).

## Cómo correrlo en tu computadora

Requisitos: Node.js 18 o superior.

```bash
cd backend
npm install
cp .env.example .env
# Edita .env y pon tu ANTHROPIC_API_KEY real (la necesitas para el endpoint del avatar)
npm start
```

El servidor queda en `http://localhost:3000`. Prueba que esté vivo:

```bash
curl http://localhost:3000/health
```

## Cómo conseguir una API key de Anthropic

1. Entra a [console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta / inicia sesión
3. Ve a "API Keys" y genera una nueva
4. Pégala en tu archivo `.env` como `ANTHROPIC_API_KEY=sk-ant-...`

Sin esto, todo el backend funciona **excepto** el endpoint `/api/avatar/chat`
(que devolverá un error claro explicando qué falta, no un fallo silencioso).

## Endpoints disponibles

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | Verifica que el servidor está vivo |
| POST | `/api/users` | Crea un usuario `{name, motivation, birthdate}` |
| GET | `/api/users/:id` | Trae los datos de un usuario |
| POST | `/api/diagnostic/start` | Empieza el diagnóstico adaptativo `{userId}` |
| POST | `/api/diagnostic/answer` | Responde una pregunta `{sessionId, answerIndex}` |
| GET | `/api/practice/route?userId=` | Ruta diaria (vocabulario pendiente + habilidad más débil) |
| GET | `/api/practice/vocab/due?userId=&limit=` | Palabras que tocan repasar hoy |
| POST | `/api/practice/vocab/answer` | Registra respuesta `{userId, wordId, correct}` |
| POST | `/api/practice/session-complete` | Marca sesión completa (actualiza racha) `{userId}` |
| GET | `/api/practice/progress?userId=` | Progreso por habilidad (nivel BKT) |
| GET | `/api/avatar/scenarios` | Lista de escenarios de conversación disponibles |
| POST | `/api/avatar/chat` | Envía un mensaje al avatar `{userId, scenarioId, message, apiHistory}` |
| POST | `/api/avatar/finish` | Cierra la conversación y aplica el feedback al BKT |

## Arquitectura de datos (decisión deliberada)

Este MVP usa un archivo JSON (`data/db.json`, se crea solo al arrancar) en vez
de una base de datos real. Es intencional — misma lógica pragmática que
usamos para elegir SM-2 antes que Half-Life Regression completo: **empezar
simple, migrar cuando el volumen de usuarios lo justifique.**

Cuando llegue ese momento, todo el acceso a datos pasa por `src/db.js`
(`readDb()` / `writeDb()`). Migrar a Postgres implica reemplazar solo ese
archivo por un cliente real (`pg`, o un ORM como Prisma) que implemente
consultas equivalentes — las rutas (`src/routes/*.js`) no deberían necesitar
cambios si se respeta la misma forma de los datos.

## Desplegarlo a producción (opciones simples para empezar)

Cualquiera de estas funciona bien para un MVP con tráfico moderado, sin
necesidad de gestionar servidores:

- **Render** (render.com) — conecta tu repo de GitHub, detecta Node automáticamente, variables de entorno en el panel.
- **Railway** (railway.app) — similar, muy simple para prototipos que van a producción real.
- **Fly.io** — un poco más de configuración, pero más control y buen tier gratuito.

Pasos generales (aplican a los tres):
1. Sube este código a un repositorio de GitHub.
2. Conecta el repo en la plataforma elegida.
3. Configura la variable de entorno `ANTHROPIC_API_KEY` en el panel de la plataforma (nunca la subas al repositorio).
4. La plataforma detecta `npm start` automáticamente gracias al `package.json`.
5. Cuando el volumen de usuarios crezca, reemplaza `src/db.js` por una conexión a la base de datos administrada que ofrezca la misma plataforma (todas ofrecen Postgres administrado).

## Siguiente paso natural

Conectar el frontend (el prototipo `prototipo_app.html` que ya construimos)
a este backend real, reemplazando las llamadas a `window.storage` y a la API
de Claude directamente desde el cliente por llamadas `fetch` a estos
endpoints. Ver `plan_construccion_real.md` para el plan completo.
