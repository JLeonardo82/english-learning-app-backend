// src/bkt.js
//
// Bayesian Knowledge Tracing simplificado -- misma formula documentada en
// motor_personalizacion_irt_bkt.md, seccion 1.3. Parametros fijos por ahora
// (P_TRANSIT, P_SLIP, P_GUESS); en produccion se calibran por habilidad via
// EM sobre datos reales de uso (pyBKT o equivalente), como esta documentado
// en la ruta de implementacion pragmatica del proyecto.

const P_SLIP = 0.1;
const P_GUESS = 0.2;
const P_TRANSIT = 0.3;
const DEFAULT_P0 = 0.3;

function updateMastery(currentP, correct) {
  const p = currentP ?? DEFAULT_P0;
  let pEvidence;
  if (correct) {
    pEvidence = (p * (1 - P_SLIP)) / (p * (1 - P_SLIP) + (1 - p) * P_GUESS);
  } else {
    pEvidence = (p * P_SLIP) / (p * P_SLIP + (1 - p) * (1 - P_GUESS));
  }
  const pNew = pEvidence + (1 - pEvidence) * P_TRANSIT;
  return Math.min(0.97, Math.max(0.03, pNew));
}

module.exports = { updateMastery, DEFAULT_P0 };
