// src/spacedRepetition.js
//
// SM-2 simplificado. Es la ruta pragmatica documentada en el motor de
// personalizacion (seccion 9): empezar con repeticion espaciada simple,
// migrar a Half-Life Regression cuando haya volumen de datos suficiente
// para entrenar el modelo de regresion (Settles & Meeder, 2016).

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function updateVocabState(current, correct) {
  const v = current || { interval: 1, ease: 2.3, due: today() };
  if (correct) {
    v.interval = Math.max(1, Math.round(v.interval * v.ease));
    v.ease = Math.min(3, v.ease + 0.1);
  } else {
    v.interval = 1;
    v.ease = Math.max(1.3, v.ease - 0.2);
  }
  v.due = addDays(today(), v.interval);
  v.lastSeen = today();
  return v;
}

module.exports = { updateVocabState, today, addDays };
