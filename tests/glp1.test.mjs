import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MEDICATIONS,
  INJECTION_SITES,
  SYMPTOM_CATALOG,
  FOOD_GUIDE,
  MEAL_PLANS_BY_PHASE,
  GLP1_ROUTINES,
  MUSCLE_LABELS,
  suggestNextInjectionSite,
  computeWellnessOverview,
  defaultState,
} from '../lib/glp1-data.mjs';
import { EXERCISES } from '../lib/exercise-catalog.mjs';
import { bodyBaseMain, muscleFills, femaleBaseMain, femaleFills } from '../lib/body-svg-data.mjs';

test('Catálogo de medicamentos incluye Mounjaro, Ozempic y modo natural', () => {
  const ids = MEDICATIONS.map((m) => m.id);
  assert.deepEqual(ids, ['mounjaro', 'ozempic', 'natural']);
  const mounjaro = MEDICATIONS.find((m) => m.id === 'mounjaro');
  assert.ok(mounjaro.doses.includes('2.5 mg'));
  assert.ok(mounjaro.doses.includes('5 mg'));
  const ozempic = MEDICATIONS.find((m) => m.id === 'ozempic');
  assert.ok(ozempic.doses.includes('0.25 mg'));
  assert.ok(ozempic.doses.includes('1.0 mg'));
});

test('Rotación sugerida de zonas de inyección evita repetir la última zona usada', () => {
  assert.equal(INJECTION_SITES.length, 6);
  const firstSite = suggestNextInjectionSite([]);
  assert.equal(firstSite.id, 'abdomen_izq');

  const nextAfterAbdIzq = suggestNextInjectionSite([{ site: 'abdomen_izq', date: '2025-05-01' }]);
  assert.equal(nextAfterAbdIzq.id, 'abdomen_der');
});

test('Guía de alimentos GLP-1 y planes semanales contienen opciones recomendadas, moderadas y a evitar', () => {
  const greenFoods = FOOD_GUIDE.filter((f) => f.category === 'green');
  const yellowFoods = FOOD_GUIDE.filter((f) => f.category === 'yellow');
  const redFoods = FOOD_GUIDE.filter((f) => f.category === 'red');
  assert.ok(greenFoods.length >= 6);
  assert.ok(yellowFoods.length >= 4);
  assert.ok(redFoods.length >= 5);
  assert.equal(MEAL_PLANS_BY_PHASE.length, 4);
});

test('Control de síntomas cubre efectos frecuentes de Mounjaro/Ozempic con consejos de alivio', () => {
  assert.ok(SYMPTOM_CATALOG.length >= 8);
  for (const symptom of SYMPTOM_CATALOG) {
    assert.ok(symptom.name.length > 0);
    assert.ok(Array.isArray(symptom.whatToEat) && symptom.whatToEat.length >= 2);
    assert.ok(Array.isArray(symptom.whatToAvoid) && symptom.whatToAvoid.length >= 1);
  }
});

test('Catálogo GymMane recreado contiene mapas anatómicos femenino/masculino y 115 ejercicios en español', () => {
  assert.equal(EXERCISES.length, 115);
  assert.equal(Object.keys(MUSCLE_LABELS).length, 14);
  assert.ok(femaleBaseMain.length > 0);
  assert.ok(femaleFills.glutes.length > 0);
  assert.ok(bodyBaseMain.length > 0);
  assert.ok(muscleFills.chest.length > 0);
  assert.ok(GLP1_ROUTINES.length >= 4);
});

test('computeWellnessOverview calcula el semáforo de la Ranita (Verde, Amarillo y Rojo)', () => {
  const base = defaultState();
  const today = Object.keys(base.nutritionByDate)[0];

  // Estado equilibrado -> Verde
  const greenState = {
    ...base,
    nutritionByDate: {
      [today]: {
        waterGlasses: 8,
        electrolytes: true,
        meals: [
          { id: '1', name: 'Pollo', protein: 50, kcal: 300, carbs: 10, fat: 5, fiber: 5, category: 'green' },
          { id: '2', name: 'Pescado', protein: 50, kcal: 300, carbs: 10, fat: 5, fiber: 5, category: 'green' },
        ],
      },
    },
  };

  const greenOverview = computeWellnessOverview(greenState, today);
  assert.equal(greenOverview.color, 'green');
  assert.equal(greenOverview.proteinPct, 100);
  assert.equal(greenOverview.waterPct, 100);

  // Baja hidratación y baja proteína -> Amarillo
  const yellowState = {
    ...base,
    nutritionByDate: {
      [today]: {
        waterGlasses: 1,
        electrolytes: false,
        meals: [],
      },
    },
  };
  const yellowOverview = computeWellnessOverview(yellowState, today);
  assert.equal(yellowOverview.color, 'yellow');

  // Síntoma fuerte hoy -> Rojo
  const redState = {
    ...greenState,
    symptomLogs: [
      {
        id: 'sym-1',
        date: today,
        symptomId: 'nauseas',
        severity: 'fuerte',
        note: 'Náusea fuerte hoy',
      },
    ],
  };

  const redOverview = computeWellnessOverview(redState, today);
  assert.equal(redOverview.color, 'red');
});
