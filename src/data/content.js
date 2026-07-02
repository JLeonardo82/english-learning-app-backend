// src/data/content.js
//
// Contenido pedagogico del MVP (subset A1-A2 de la taxonomia completa de 175
// micro-habilidades documentada en el proyecto). En produccion, esto migraria
// a tablas propias (skills, vocab_items, diagnostic_items, scenarios) para
// poder editarse sin desplegar codigo nuevo -- aqui vive como modulo JS para
// mantener el backend auto-contenido y facil de correr/probar.

const SKILLS = [
  { id: 'greetings', name: 'Saludos y presentación' },
  { id: 'family',    name: 'Familia y personas' },
  { id: 'routines',  name: 'Rutinas diarias' },
  { id: 'food',      name: 'Comida y bebida' },
  { id: 'past',      name: 'Pasado simple' }
];

const VOCAB = [
  { id: 'v1',  en: 'hello',     es: 'hola',              ex_en: 'Hello! Nice to meet you.',        skill: 'greetings' },
  { id: 'v2',  en: 'goodbye',   es: 'adiós',              ex_en: 'Goodbye, see you tomorrow.',       skill: 'greetings' },
  { id: 'v3',  en: 'friend',    es: 'amigo/a',            ex_en: 'She is my best friend.',           skill: 'greetings' },
  { id: 'v4',  en: 'name',      es: 'nombre',             ex_en: 'What is your name?',               skill: 'greetings' },
  { id: 'v5',  en: 'sister',    es: 'hermana',            ex_en: 'My sister lives in Bogotá.',       skill: 'family' },
  { id: 'v6',  en: 'brother',   es: 'hermano',            ex_en: 'My brother works at a bank.',      skill: 'family' },
  { id: 'v7',  en: 'mother',    es: 'madre',              ex_en: 'My mother cooks every Sunday.',    skill: 'family' },
  { id: 'v8',  en: 'father',    es: 'padre',              ex_en: 'My father likes football.',        skill: 'family' },
  { id: 'v9',  en: 'wake up',   es: 'despertarse',        ex_en: 'I wake up at seven.',               skill: 'routines' },
  { id: 'v10', en: 'breakfast', es: 'desayuno',           ex_en: 'I eat breakfast at home.',          skill: 'routines' },
  { id: 'v11', en: 'work',      es: 'trabajar',           ex_en: 'I work from Monday to Friday.',     skill: 'routines' },
  { id: 'v12', en: 'sleep',     es: 'dormir',             ex_en: 'I sleep eight hours a night.',      skill: 'routines' },
  { id: 'v13', en: 'apple',     es: 'manzana',            ex_en: 'I eat an apple every day.',         skill: 'food' },
  { id: 'v14', en: 'water',     es: 'agua',               ex_en: 'Can I have some water, please?',    skill: 'food' },
  { id: 'v15', en: 'coffee',    es: 'café',               ex_en: 'I drink coffee every morning.',     skill: 'food' },
  { id: 'v16', en: 'bread',     es: 'pan',                ex_en: 'She buys fresh bread daily.',       skill: 'food' },
  { id: 'v17', en: 'went',      es: 'fui/fue (ir)',       ex_en: 'I went to the park yesterday.',     skill: 'past' },
  { id: 'v18', en: 'saw',       es: 'vi/vio (ver)',       ex_en: 'I saw a great movie last week.',    skill: 'past' },
  { id: 'v19', en: 'ate',       es: 'comí/comió',         ex_en: 'We ate dinner together.',           skill: 'past' },
  { id: 'v20', en: 'had',       es: 'tuve/tuvo',          ex_en: 'I had a great weekend.',            skill: 'past' }
];

const DIAG_T1 = [
  { q: "Choose the correct greeting response to 'Hello!'", options: ["Hi!", "Table", "Yesterday", "Fifteen"], answer: 0, skill: 'greetings' },
  { q: "'Mother' means...", options: ["Padre", "Madre", "Hermano", "Amigo"], answer: 1, skill: 'family' },
  { q: "I ___ breakfast every morning.", options: ["eat", "eats", "ate", "eating"], answer: 0, skill: 'routines' },
  { q: "'Water' in Spanish is...", options: ["Café", "Pan", "Agua", "Manzana"], answer: 2, skill: 'food' },
  { q: "Yesterday, I ___ to the park.", options: ["go", "goes", "went", "going"], answer: 2, skill: 'past' }
];

const DIAG_T2 = [
  { q: "Complete: 'By the time I arrived, she ___ already left.'", options: ["has", "had", "have", "having"], answer: 1, skill: 'past' },
  { q: "'I've been living here ___ 2019.'", options: ["for", "since", "during", "at"], answer: 1, skill: 'routines' },
  { q: "'My brother is ___ than me.'", options: ["tall", "taller", "tallest", "more tall"], answer: 1, skill: 'family' },
  { q: "'It was nice ___ you.'", options: ["meet", "meeting", "met", "meets"], answer: 1, skill: 'greetings' },
  { q: "'What ___ you usually have for breakfast?'", options: ["do", "does", "are", "is"], answer: 0, skill: 'food' }
];

const SCENARIOS = [
  { id: 'cafe',    title: 'Pedir en un café',            skill: 'food',      prompt: "You are a friendly barista. The student just walked into your café and wants to order something." },
  { id: 'intro',   title: 'Presentarte a alguien nuevo',  skill: 'greetings', prompt: "You just met the student at a party. Introduce yourself and get to know them." },
  { id: 'family',  title: 'Hablar de tu familia',         skill: 'family',    prompt: "You are chatting with the student and ask them about their family." },
  { id: 'routine', title: 'Tu rutina diaria',             skill: 'routines',  prompt: "You are curious about the student's daily routine and ask them about it." },
  { id: 'weekend', title: 'Tu último fin de semana',      skill: 'past',      prompt: "You ask the student what they did last weekend and react naturally to their story." }
];

module.exports = { SKILLS, VOCAB, DIAG_T1, DIAG_T2, SCENARIOS };
