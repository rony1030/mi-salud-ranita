import { EXERCISES } from "./exercise-catalog.mjs";

export const STORAGE_KEY = "gymmane-glp1:v1";
export const LEGACY_STORAGE_KEY = "mi-salud-ranita:v1";

export const MUSCLE_LABELS = {
  glutes: { name: "Glúteos", side: "back", priorityGlp1: true },
  quads: { name: "Cuádriceps", side: "front", priorityGlp1: true },
  hamstrings: { name: "Isquiotibiales", side: "back", priorityGlp1: true },
  abdomen: { name: "Abdomen y Core", side: "front", priorityGlp1: true },
  obliques: { name: "Oblicuos", side: "front", priorityGlp1: false },
  back: { name: "Espalda Dorsal", side: "back", priorityGlp1: true },
  shoulders: { name: "Hombros", side: "both", priorityGlp1: true },
  chest: { name: "Pectorales", side: "front", priorityGlp1: false },
  biceps: { name: "Bíceps", side: "front", priorityGlp1: false },
  triceps: { name: "Tríceps", side: "back", priorityGlp1: true },
  calves: { name: "Pantorrillas", side: "both", priorityGlp1: false },
  trapezius: { name: "Trapecio", side: "both", priorityGlp1: false },
  lowerback: { name: "Espalda Baja", side: "back", priorityGlp1: false },
  forearm: { name: "Antebrazos", side: "both", priorityGlp1: false },
};

export const EQUIPMENT_LABELS = {
  Bodyweight: "Peso corporal",
  Dumbbell: "Mancuernas",
  Band: "Bandas elásticas",
  Machine: "Máquina",
  Cable: "Polea",
  Barbell: "Barra",
  Kettlebell: "Pesa rusa",
  Other: "Otro",
};

export const DIFFICULTY_LABELS = {
  Beginner: "Principiante",
  Intermediate: "Intermedio",
  Advanced: "Avanzado",
};

export const MEDICATIONS = [
  {
    id: "mounjaro",
    name: "Mounjaro (Tirzepatida)",
    brand: "Mounjaro / Zepbound",
    activeIngredient: "Tirzepatida (GIP + GLP-1)",
    frequencyDays: 7,
    doses: ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "12.5 mg", "15 mg"],
    summary:
      "Doble agonista (GIP y GLP-1). Reduce apetito, retrasa vaciamiento gástrico y regula la insulina.",
  },
  {
    id: "ozempic",
    name: "Ozempic (Semaglutida)",
    brand: "Ozempic / Wegovy",
    activeIngredient: "Semaglutida (GLP-1)",
    frequencyDays: 7,
    doses: ["0.25 mg", "0.5 mg", "1.0 mg", "1.7 mg", "2.0 mg", "2.4 mg"],
    summary:
      "Agonista GLP-1 semanal que prolonga la saciedad, frena antojos y mejora el metabolismo glucémico.",
  },
  {
    id: "natural",
    name: "Solo Dieta y Ejercicio (Sin fármaco)",
    brand: "Plan Natural",
    activeIngredient: "Entrenamiento de fuerza + Nutrición proteica",
    frequencyDays: 7,
    doses: ["Control semanal"],
    summary:
      "Seguimiento de peso, medidas, macros y entrenamientos de fuerza sin medicación inyectable.",
  },
];

export const INJECTION_SITES = [
  {
    id: "abdomen_izq",
    label: "Abdomen Izquierdo",
    short: "Abdomen Izq.",
    zone: "Abdomen",
    tip: "Aplica al menos a 5 cm de distancia del ombligo en tejido celular subcutáneo.",
    coords: { x: 62, y: 48 },
  },
  {
    id: "abdomen_der",
    label: "Abdomen Derecho",
    short: "Abdomen Der.",
    zone: "Abdomen",
    tip: "Alterna de lado cada semana. Evita aplicar sobre tejido cicatricial o estrías.",
    coords: { x: 38, y: 48 },
  },
  {
    id: "muslo_izq",
    label: "Muslo Frontal Izquierdo",
    short: "Muslo Izq.",
    zone: "Muslo",
    tip: "Tercio medio frontal de la pierna sentado. Suele reducir la incidencia de náuseas tempranas.",
    coords: { x: 60, y: 68 },
  },
  {
    id: "muslo_der",
    label: "Muslo Frontal Derecho",
    short: "Muslo Der.",
    zone: "Muslo",
    tip: "Tercio medio frontal. Excelente opción para rotar cuando el área abdominal presenta sensibilidad.",
    coords: { x: 40, y: 68 },
  },
  {
    id: "brazo_izq",
    label: "Brazo Superior Izquierdo",
    short: "Brazo Izq.",
    zone: "Brazo",
    tip: "Zona posterior del brazo superior (área del tríceps con tejido graso).",
    coords: { x: 76, y: 34 },
  },
  {
    id: "brazo_der",
    label: "Brazo Superior Derecho",
    short: "Brazo Der.",
    zone: "Brazo",
    tip: "Zona posterior carnosa del brazo superior derecho. Aplica con el brazo relajado.",
    coords: { x: 24, y: 34 },
  },
];

export function suggestNextInjectionSite(injections = []) {
  if (!injections.length) return INJECTION_SITES[0];
  const lastSiteId = injections[0]?.site;
  const idx = INJECTION_SITES.findIndex((s) => s.id === lastSiteId);
  if (idx === -1) return INJECTION_SITES[0];
  return INJECTION_SITES[(idx + 1) % INJECTION_SITES.length];
}

export const SYMPTOM_CATALOG = [
  {
    id: "nauseas",
    name: "Náuseas o dispepsia gástrica",
    category: "Digestivo",
    whatToEat: [
      "Infusión suave de jengibre fresco o agua fría a sorbos pequeños",
      "Caldo claro de pollo desgrasado con trozos de pechuga",
      "Galletas saladas o tostada seca en porción mínima",
      "Puré de manzana cocido sin azúcar añadida",
      "Alimentos a temperatura ambiente (evitar vapores calientes)",
    ],
    whatToAvoid: [
      "Frituras, carnes grasas, lácteos enteros y salsas densas",
      "Recostarse antes de 2 horas posteriores a la comida",
      "Líquidos abundantes durante la masticación",
    ],
    whyItHappens:
      "Tanto Mounjaro como Ozempic retardan el vaciamiento gástrico fisiológico. Si ingresa volumen excesivo o grasa, el estómago se sobrecarga.",
  },
  {
    id: "reflujo",
    name: "Reflujo gastroesofágico o acidez",
    category: "Digestivo",
    whatToEat: [
      "Avena suave cocida en agua o bebida vegetal sin azúcar",
      "Papaya madura o melón en trozos pequeños",
      "Pechuga de pollo o merluza a la plancha con condimentos neutros",
      "Cenas tempranas (al menos 3 horas antes del descanso)",
    ],
    whatToAvoid: [
      "Café en ayunas, chocolate, picante, salsas de tomate concentradas",
      "Bebidas carbonatadas o agua con gas",
      "Comidas abundantes en horario nocturno",
    ],
    whyItHappens:
      "Al permanecer el quimo más tiempo en la cavidad gástrica, el ácido estomacal puede refluir al esófago por relajación del esfínter inferior.",
  },
  {
    id: "eructos",
    name: "Eructos de azufre o meteorismo",
    category: "Digestivo",
    whatToEat: [
      "Infusión tibia de menta o manzanilla tras comer",
      "Pescado blanco, pavo magro o claras de huevo cocidas",
      "Arroz blanco suave en porción pequeña y pepino sin piel",
      "Masticación pausada y completa de cada bocado",
    ],
    whatToAvoid: [
      "Carnes rojas grasas por la noche (lenta degradación)",
      "Brócoli, coliflor, cebolla cruda y exceso de ajo por 48 horas",
      "Comidas ultraprocesadas con azúcares añadidos",
    ],
    whyItHappens:
      "La microbiota gástrica fermenta alimentos retenidos por el vaciamiento retardado, generando sulfuro de hidrógeno gaseoso.",
  },
  {
    id: "estrenimiento",
    name: "Tránsito intestinal lento",
    category: "Digestivo",
    whatToEat: [
      "Papaya, kiwi maduro o 1 cucharadita de semillas de chía hidratadas",
      "Vegetales cocidos al vapor con 1 cucharadita de aceite de oliva crudo",
      "Asegurar 2.5 litros de agua diaria con electrolitos sin azúcar",
      "Caminata ligera de 15 a 20 minutos tras las comidas principales",
    ],
    whatToAvoid: [
      "Descuidar la ingesta hídrica por falta de sensación de sed",
      "Exceso de harinas refinadas y quesos curados maduros",
    ],
    whyItHappens:
      "La motilidad intestinal desciende y el fármaco reduce el estímulo de sed central, resecando las heces si no hay hidratación suficiente.",
  },
  {
    id: "llenura",
    name: "Saciedad precoz o plenitud temprana",
    category: "Apetito",
    whatToEat: [
      "Fraccionar la comida en 4 o 5 tomas de volumen reducido",
      "Iniciar siempre por 4-5 bocados de proteína magra",
      "Batidos de proteína whey isolate si hay intolerancia a sólidos",
    ],
    whatToAvoid: [
      "Forzarse a terminar raciones grandes si hay saciedad",
      "Consumir líquidos voluminosos antes de la proteína",
    ],
    whyItHappens:
      "Respuesta terapéutica central sobre los receptores hipotalámicos de saciedad y mecanorreceptores gástricos.",
  },
  {
    id: "fatiga",
    name: "Letargia o déficit de energía",
    category: "Energía",
    whatToEat: [
      "Electrolitos completos (sodio, potasio y magnesio) sin azúcar al despertar",
      "Huevos revueltos o yogur griego con fruta fresca suave",
      "Consomé claro con sal mineral para mantener volumen plasmático",
    ],
    whatToAvoid: [
      "Periodos prolongados de ayuno sin aporte de aminoácidos",
      "Entrenamientos extenuantes en los días 1 y 2 post-aplicación",
    ],
    whyItHappens:
      "La disminución calórica drástica inicial unida a la reducción de glucógeno y balance hidroelectrolítico reduce el tono muscular basal.",
  },
  {
    id: "mareo",
    name: "Hipotensión ortostática leve",
    category: "Circulatorio",
    whatToEat: [
      "Hidratación con electrolitos y una pizca de sal marina",
      "Colación proteica ligera con carbohidrato noble (medio plátano con yogur)",
    ],
    whatToAvoid: [
      "Transiciones bruscas de posición supina a bípeda",
      "Ejercicios con inversión rápida de la cabeza",
    ],
    whyItHappens:
      "Menor volumen vascular circulante o descenso adaptativo de la presión arterial. Si tomas antihipertensivos, consulta con tu médico tratante.",
  },
  {
    id: "diarrea",
    name: "Evacuaciones líquidas o heces sueltas",
    category: "Digestivo",
    whatToEat: [
      "Solución de rehidratación oral y caldo suave de pollo",
      "Arroz blanco suave, compota de manzana cocida y pechuga hervida",
    ],
    whatToAvoid: [
      "Lácteos con lactosa, grasas añadidas, condimentos fuertes y edulcorantes polialcoholes",
    ],
    whyItHappens:
      "Reacción común tras ajuste de escalado de dosis o ingesta inadvertida de alimentos con alto contenido lipídico.",
  },
];

export const FOOD_GUIDE = [
  // 🟢 PRIORIZAR (Proteínas de alta biodisponibilidad y fácil vaciamiento gástrico)
  {
    id: "pechuga_plancha",
    name: "Pechuga de pollo a la plancha",
    category: "green",
    group: "Proteína Magra",
    portion: "120 g",
    kcal: 195,
    protein: 36,
    carbs: 0,
    fat: 4,
    fiber: 0,
    reason:
      "Aporte de aminoácidos esenciales de fácil asimilación para blindar la masa muscular magra en déficit calórico pronunciado.",
    bestFor: "Almuerzo o cena · Consumir como primer elemento del plato",
  },
  {
    id: "pescado_blanco",
    name: "Filete de pescado blanco o salmón magro",
    category: "green",
    group: "Proteína Magra",
    portion: "130 g",
    kcal: 180,
    protein: 30,
    carbs: 0,
    fat: 6,
    fiber: 0,
    reason:
      "Tejido conectivo reducido que facilita una digestión rápida sin generar pesadez en los días 1 a 3 post-inyección.",
    bestFor: "Cena ligera o días de apetito reducido",
  },
  {
    id: "huevos_suaves",
    name: "Huevos pochados o revueltos tiernos",
    category: "green",
    group: "Proteína Completa",
    portion: "2 unidades (o 1 huevo + 2 claras)",
    kcal: 155,
    protein: 14,
    carbs: 1,
    fat: 10,
    fiber: 0,
    reason:
      "Alta densidad de colina y leucina en volumen compacto. Sostiene la integridad cutánea y muscular.",
    bestFor: "Desayuno o cena suave",
  },
  {
    id: "yogur_griego",
    name: "Yogur griego 0% natural sin endulzantes",
    category: "green",
    group: "Proteína & Probióticos",
    portion: "170 g (1 taza)",
    kcal: 110,
    protein: 17,
    carbs: 6,
    fat: 2,
    fiber: 0,
    reason:
      "Textura fresca y palatable ante náuseas. Los cultivos activos apoyan la diversidad de la microbiota intestinal.",
    bestFor: "Desayuno, merienda o post-entrenamiento",
  },
  {
    id: "batido_whey",
    name: "Batido de proteína Whey Isolate",
    category: "green",
    group: "Proteína Líquida",
    portion: "1 porción (30 g) en agua",
    kcal: 125,
    protein: 25,
    carbs: 2,
    fat: 1,
    fiber: 0,
    reason:
      "Garantiza el cumplimiento del objetivo proteico diario cuando el apetito por sólidos está transitoriamente inhibido.",
    bestFor: "Días 1 y 2 post-inyección",
  },
  {
    id: "caldo_pollo",
    name: "Caldo claro desgrasado de pollo y vegetales",
    category: "green",
    group: "Hidratación & Electrolitos",
    portion: "300 ml con pollo desmenuzado",
    kcal: 140,
    protein: 18,
    carbs: 8,
    fat: 3,
    fiber: 2,
    reason:
      "Restablece volumen hídrico y sodio bioasimilable sin estimular acidez gástrica.",
    bestFor: "Día de aplicación de la dosis y día posterior",
  },
  {
    id: "lechosa_papaya",
    name: "Papaya fresca o kiwi maduro",
    category: "green",
    group: "Fibra Soluble & Enzimas",
    portion: "1 taza en cubos",
    kcal: 62,
    protein: 1,
    carbs: 15,
    fat: 0,
    fiber: 3,
    reason:
      "Contiene papaína y fibra hidrosoluble que mitiga la acidez y favorece la regularidad intestinal.",
    bestFor: "Primeras horas de la mañana",
  },
  {
    id: "avena_chia",
    name: "Avena cocida con semillas de chía",
    category: "green",
    group: "Fibra Soluble",
    portion: "1/2 taza cocida",
    kcal: 140,
    protein: 5,
    carbs: 23,
    fat: 3,
    fiber: 5,
    reason:
      "Los mucílagos protegen la mucosa gástrica y modulan la liberación sostenida de energía.",
    bestFor: "Desayuno saciante",
  },

  // 🟡 MODERAR (Porción controlada)
  {
    id: "aguacate",
    name: "Aguacate en rodajas",
    category: "yellow",
    group: "Lípidos Monoinsaturados",
    portion: "30-40 g",
    kcal: 65,
    protein: 1,
    carbs: 3,
    fat: 6,
    fiber: 2,
    reason:
      "Grasa monoinsaturada beneficiosa, pero los lípidos retardan aún más la motilidad gástrica. Consumir con moderación.",
    bestFor: "Almuerzo en días 3 a 7 del ciclo",
  },
  {
    id: "viveres_suaves",
    name: "Batata o puré de patata al vapor",
    category: "yellow",
    group: "Carbohidrato Complejo",
    portion: "1/2 taza pequeña",
    kcal: 95,
    protein: 2,
    carbs: 22,
    fat: 0,
    fiber: 3,
    reason:
      "Excelente recarga de glucógeno para las sesiones de fuerza. Mantener la porción acotada para priorizar la carne o pescado.",
    bestFor: "Almuerzo en días de entrenamiento",
  },
  {
    id: "arroz_blanco",
    name: "Arroz blanco al vapor",
    category: "yellow",
    group: "Carbohidrato Simple",
    portion: "1/3 taza cocida (70 g)",
    kcal: 85,
    protein: 2,
    carbs: 18,
    fat: 0,
    fiber: 0.5,
    reason:
      "Digestión suave pero con bajo volumen proteico. Consumir tras finalizar la porción proteica del plato.",
    bestFor: "Acompañamiento medido",
  },
  {
    id: "habichuelas_suaves",
    name: "Lentejas o habichuelas coladas",
    category: "yellow",
    group: "Legumbres",
    portion: "1/3 taza",
    kcal: 90,
    protein: 6,
    carbs: 16,
    fat: 0.5,
    fiber: 5,
    reason:
      "Ricas en hierro y fibra, pero el exceso de oligosacáridos puede provocar distensión en vaciamiento lento.",
    bestFor: "Almuerzos tolerados",
  },

  // 🔴 EVITAR (Detonantes de reflujo, dispepsia y vómitos con GLP-1)
  {
    id: "frituras",
    name: "Frituras y alimentos empanizados",
    category: "red",
    group: "Grasas Térmicamente Alteradas",
    portion: "Evitar de forma estricta",
    kcal: 380,
    protein: 10,
    carbs: 18,
    fat: 30,
    fiber: 0,
    reason:
      "Detonante principal de náuseas agudas y reflujo severo. La grasa excesiva permanece estancada en el antro gástrico.",
    bestFor: "No recomendado en tratamiento GLP-1",
  },
  {
    id: "bebidas_gas",
    name: "Bebidas carbonatadas o refrescos",
    category: "red",
    group: "Gases y Endulzantes",
    portion: "Evitar",
    kcal: 140,
    protein: 0,
    carbs: 35,
    fat: 0,
    fiber: 0,
    reason:
      "El gas expande mecánicamente las paredes del estómago ya enlentecido, provocando dolor por distensión y reflujo ácido.",
    bestFor: "Sustituir por agua con gotas de limón o infusiones",
  },
  {
    id: "alcohol",
    name: "Bebidas alcohólicas",
    category: "red",
    group: "Toxina Hepática",
    portion: "Evitar",
    kcal: 160,
    protein: 0,
    carbs: 12,
    fat: 0,
    fiber: 0,
    reason:
      "Eleva el riesgo de hipoglucemia severa, inflama la barrera gástrica y dificulta la depuración metabólica del fármaco.",
    bestFor: "Contraindicado en fase activa de pérdida de peso",
  },
  {
    id: "carnes_grasosas",
    name: "Embutidos grasos y cortes de cerdo con grasa",
    category: "red",
    group: "Lípidos Saturados",
    portion: "Evitar",
    kcal: 320,
    protein: 16,
    carbs: 2,
    fat: 28,
    fiber: 0,
    reason:
      "Tiempo de vaciamiento superior a 8 horas, provocando fermentación anaeróbica y eructos con olor a azufre.",
    bestFor: "Sustituir por cortes magros de pavo o vacuno magro",
  },
  {
    id: "postres_azucar",
    name: "Repostería densa y helados industriales",
    category: "red",
    group: "Sacarosa & Grasas Hidrogenadas",
    portion: "Evitar",
    kcal: 290,
    protein: 3,
    carbs: 45,
    fat: 12,
    fiber: 0.5,
    reason:
      "La carga osmótica de azúcares rápidos en el duodeno puede desencadenar síntomas de vaciamiento rápido o mareos.",
    bestFor: "Reemplazar por fruta fresca con canela",
  },
];

export const MEAL_PLANS_BY_PHASE = [
  {
    id: "day_0",
    title: "Día 0 · Día de Inyección (Tolerancia Digestiva)",
    badge: "Día de Dosis",
    description:
      "Prepara el organismo con hidratación de electrolitos y alimentos livianos. Evita grasas pesadas para asegurar una absorción asintomática.",
    meals: [
      {
        slot: "Desayuno",
        idea: "Avena cocida en agua con semillas de chía y 2 claras de huevo revueltas tiernas.",
        macros: "20 g proteína · Digestión ligera",
      },
      {
        slot: "Almuerzo",
        idea: "Filete de pechuga a la plancha con puré de batata suave y zanahoria al vapor.",
        macros: "32 g proteína · Libre de grasa saturada",
      },
      {
        slot: "Tarde",
        idea: "Tazón de caldo claro de pollo desgrasado con electrolitos 1 hora antes de la inyección.",
        macros: "15 g proteína · Hidratación celular",
      },
      {
        slot: "Cena",
        idea: "Sopa suave o batido ligero de proteína whey isolate. Nada de comida grasosa nocturna.",
        macros: "25 g proteína · Prevención de reflujo",
      },
    ],
  },
  {
    id: "peak_days",
    title: "Días 1 y 2 · Pico Farmacológico (Máxima Saciedad)",
    badge: "Pico de Saciedad",
    description:
      "El efecto anorexígeno y el retardo del vaciamiento gástrico son máximos. Si el apetito cae drásticamente, consume tomas pequeñas y frías.",
    meals: [
      {
        slot: "Mañana",
        idea: "1 taza de yogur griego 0% con papaya o infusión de jengibre con 2 galletas saladas.",
        macros: "18 g proteína · Muy suave al estómago",
      },
      {
        slot: "Mediodía",
        idea: "Filete de pescado blanco a la plancha (120 g) con 2 cucharadas de arroz al vapor.",
        macros: "28 g proteína · Digestión ultrarrápida",
      },
      {
        slot: "Tarde",
        idea: "Batido de proteína isolate en agua fría tomado en pequeños sorbos espaciados.",
        macros: "25 g proteína · Preservación muscular",
      },
      {
        slot: "Noche",
        idea: "Caldo claro de pollo con trocitos de pechuga o 2 claras revueltas tiernas.",
        macros: "20 g proteína · Cero pesadez al dormir",
      },
    ],
  },
  {
    id: "active_days",
    title: "Días 3, 4 y 5 · Ventana de Fuerza (Síntesis Proteica)",
    badge: "Ventana de Fuerza",
    description:
      "El tracto digestivo está completamente adaptado y cuentas con buen nivel energético. Es la ventana idónea para levantar peso y proteger masa magra.",
    meals: [
      {
        slot: "Desayuno",
        idea: "2 huevos enteros revueltos con espinacas y 1/2 plátano verde o batata cocida.",
        macros: "22 g proteína · Energía sostenida",
      },
      {
        slot: "Almuerzo",
        idea: "140 g de pechuga o ternera magra con ensalada fresca, 1/3 taza de arroz y aguacate medido.",
        macros: "38 g proteína · Aporte completo de aminoácidos",
      },
      {
        slot: "Tarde",
        idea: "Yogur griego con semillas de chía o batido proteico post-entrenamiento.",
        macros: "25 g proteína · Recuperación de fibras",
      },
      {
        slot: "Cena",
        idea: "Salmón o filete de pescado al horno con vegetales cocidos al vapor.",
        macros: "32 g proteína · Saciante y limpia",
      },
    ],
  },
  {
    id: "appetite_return",
    title: "Días 6 y 7 · Cierre Semanal (Control de Apetito)",
    badge: "Volumen y Fibra",
    description:
      "Hacia el final de los 7 días la concentración sérica disminuye levemente y es natural sentir más ganas de comer. Aplica vegetales y fibra soluble para mantener saciedad.",
    meals: [
      {
        slot: "Desayuno",
        idea: "Omelette de 2 huevos con champiñones y tomate + avena cocida con chía.",
        macros: "22 g proteína · 6 g fibra saciante",
      },
      {
        slot: "Almuerzo",
        idea: "Bowl de 140 g de pollo sobre cama abundante de vegetales verdes, pepino y batata al horno.",
        macros: "36 g proteína · 8 g fibra",
      },
      {
        slot: "Tarde",
        idea: "Gelatina sin azúcar con yogur griego y fresas frescas picadas.",
        macros: "18 g proteína · Regulación de apetito dulce",
      },
      {
        slot: "Cena",
        idea: "Atún al agua o pechuga desmenuzada sobre crema de calabaza o vegetales al vapor.",
        macros: "30 g proteína · Ligera y nutritiva",
      },
    ],
  },
];

export const GLP1_ROUTINES = [
  // 1. Programas Especializados GLP-1 (Anti-Flacidez y Preservación Muscular)
  {
    id: "glp1_gluteos_piernas",
    category: "glp1",
    name: "Glúteos y Piernas Firmes",
    badge: "GLP-1 Anti-Flacidez · 3 días/sem",
    level: "Todos los niveles",
    durationMin: 32,
    focus: "Preservación del volumen muscular glúteo e isquiotibial durante el déficit calórico rápido.",
    glp1Tip: "Consume tu comida proteica en las 2 horas posteriores para nutrir el tejido muscular del glúteo.",
    days: [
      {
        dayName: "Sesión A · Glúteos y Cadera",
        exercises: [
          { id: "qKBpF7I", sets: 4, reps: "12", restSec: 75, note: "Hip thrust con mancuerna o barra: contracción isométrica de 2 segundos arriba" },
          { id: "qx4fgX7", sets: 3, reps: "10 por pierna", restSec: 60, note: "Sentadilla búlgara: ligera inclinación anterior de tronco" },
          { id: "nUwVh7b", sets: 3, reps: "12", restSec: 60, note: "Peso muerto rumano estirando isquiotibiales con espalda recta" },
          { id: "c8f5cSY", sets: 3, reps: "15 por lado", restSec: 45, note: "Abducción lateral de cadera para activar glúteo medio" },
          { id: "8ozhUIZ", sets: 3, reps: "15-20", restSec: 45, note: "Elevación de talones para favorecer el retorno venoso" },
        ],
      },
      {
        dayName: "Sesión B · Cuádriceps y Cadena Posterior",
        exercises: [
          { id: "yn8yg1r", sets: 3, reps: "12", restSec: 60, note: "Sentadilla goblet controlada en fase excéntrica" },
          { id: "7zdxRTl", sets: 3, reps: "12", restSec: 75, note: "Prensa de piernas segura sin redondear la zona lumbar" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral en máquina o con mancuerna" },
          { id: "RRWFUcw", sets: 3, reps: "10 por pierna", restSec: 60, note: "Zancadas controladas" },
        ],
      },
    ],
  },
  {
    id: "glp1_femenina_completa",
    category: "glp1",
    name: "Preservación Muscular Femenina",
    badge: "GLP-1 Cuerpo Completo · 3 días/sem",
    level: "Intermedio",
    durationMin: 35,
    focus: "Estímulo de los grupos musculares mayores (espalda, hombros, piernas, brazos) para estilizar la figura y evitar flacidez cutánea.",
    glp1Tip: "Descansar de 60 a 90 segundos entre series optimiza la recuperación neural en déficit.",
    days: [
      {
        dayName: "Sesión A · Espalda, Glúteos y Brazos",
        exercises: [
          { id: "RVwzP10", sets: 3, reps: "10-12", restSec: 60, note: "Jalón al pecho en polea para dar forma estilizada a la espalda" },
          { id: "qKBpF7I", sets: 3, reps: "12", restSec: 75, note: "Puente de glúteos con peso" },
          { id: "BJ0Hz5L", sets: 3, reps: "10 por lado", restSec: 60, note: "Remo unilateral con mancuerna" },
          { id: "PAgTVaK", sets: 3, reps: "12", restSec: 45, note: "Extensión de tríceps para firmeza del brazo posterior" },
          { id: "TFqbd8t", sets: 3, reps: "15", restSec: 45, note: "Flexión abdominal controlada" },
        ],
      },
      {
        dayName: "Sesión B · Hombros, Piernas y Core",
        exercises: [
          { id: "DsgkuIt", sets: 3, reps: "12-15", restSec: 45, note: "Elevaciones laterales con peso ligero y técnica estricta" },
          { id: "yn8yg1r", sets: 3, reps: "12", restSec: 60, note: "Sentadilla goblet" },
          { id: "SpYC0Kp", sets: 3, reps: "10-12", restSec: 60, note: "Press de banca plano con mancuernas" },
          { id: "NbVPDMW", sets: 3, reps: "12", restSec: 45, note: "Curl de bíceps con mancuernas" },
          { id: "XVDdcoj", sets: 3, reps: "20 giros", restSec: 45, note: "Giro ruso para tonificar oblicuos" },
        ],
      },
    ],
  },
  {
    id: "glp1_post_inyeccion_suave",
    category: "glp1",
    name: "Movilidad Post-Inyección",
    badge: "GLP-1 Días 1-2 · Suave",
    level: "Principiante / Recuperación",
    durationMin: 20,
    focus: "Movilización corporal suave para activar la circulación y evacuar gases sin ejercicios de cabeza abajo que provoquen reflujo.",
    glp1Tip: "Sin saltos ni cambios bruscos de postura. Hidratarse a sorbos pequeños de agua templada.",
    days: [
      {
        dayName: "Circuito de Movilidad Suave",
        exercises: [
          { id: "6YUfHPL", sets: 2, reps: "10 suaves", restSec: 60, note: "Sentadilla a silla a ritmo pausado" },
          { id: "DsgkuIt", sets: 2, reps: "10", restSec: 45, note: "Elevación lateral con carga mínima" },
          { id: "c8f5cSY", sets: 2, reps: "12 por lado", restSec: 45, note: "Abducción lateral de cadera en colchoneta" },
          { id: "LNE3wfo", sets: 2, reps: "30 seg", restSec: 30, note: "Descarga de tensión y estiramiento" },
        ],
      },
    ],
  },
  {
    id: "glp1_tonificacion_casa",
    category: "glp1",
    name: "Fuerza en Casa 25 min",
    badge: "GLP-1 En Casa · 3 días/sem",
    level: "Principiante / Intermedio",
    durationMin: 25,
    focus: "Mantenimiento funcional del tono muscular en el hogar sin requerir equipamiento pesado.",
    glp1Tip: "Mantener 3 sesiones semanales en casa previene la degradación de tejido contráctil.",
    days: [
      {
        dayName: "Circuito de Fuerza Funcional",
        exercises: [
          { id: "6YUfHPL", sets: 3, reps: "15", restSec: 45, note: "Sentadillas profundas con peso corporal" },
          { id: "I4hDWkc", sets: 3, reps: "8-10", restSec: 60, note: "Flexiones de pecho apoyando rodillas si es necesario" },
          { id: "u27Kcdz", sets: 3, reps: "15", restSec: 45, note: "Puente de glúteos en el suelo" },
          { id: "BbfB8Gb", sets: 3, reps: "15", restSec: 45, note: "Abdominales controlados" },
        ],
      },
    ],
  },

  // 2. Programas Clásicos de GymMane
  {
    id: "gymmane_ppl",
    category: "classic",
    name: "Push / Pull / Legs (PPL)",
    badge: "GymMane Clásico · 6 días/sem",
    level: "Avanzado",
    durationMin: 50,
    focus: "División de hipertrofia por patrones de movimiento: Empuje, Tirón y Pierna.",
    glp1Tip: "Asegurar mínimo 1.8 g de proteína por kg al entrenar a esta frecuencia.",
    days: [
      {
        dayName: "Día 1 · Push (Empuje)",
        exercises: [
          { id: "SpYC0Kp", sets: 4, reps: "8-10", restSec: 90, note: "Press de banca con mancuernas" },
          { id: "ns0SIbU", sets: 3, reps: "10-12", restSec: 75, note: "Press inclinado" },
          { id: "A6wtbuL", sets: 3, reps: "10", restSec: 75, note: "Press militar con mancuernas" },
          { id: "DsgkuIt", sets: 3, reps: "15", restSec: 45, note: "Elevaciones laterales" },
          { id: "3ZflifB", sets: 3, reps: "12", restSec: 60, note: "Extensión de tríceps en polea" },
        ],
      },
      {
        dayName: "Día 2 · Pull (Tirón)",
        exercises: [
          { id: "RVwzP10", sets: 4, reps: "10-12", restSec: 75, note: "Jalón al pecho" },
          { id: "fUBheHs", sets: 3, reps: "10-12", restSec: 75, note: "Remo sentado en polea" },
          { id: "NJzBsGJ", sets: 3, reps: "12", restSec: 60, note: "Encogimientos de trapecio" },
          { id: "NbVPDMW", sets: 3, reps: "10-12", restSec: 60, note: "Curl de bíceps con mancuernas" },
          { id: "slDvUAU", sets: 3, reps: "12", restSec: 60, note: "Curl martillo" },
        ],
      },
      {
        dayName: "Día 3 · Legs (Pierna)",
        exercises: [
          { id: "7zdxRTl", sets: 4, reps: "10-12", restSec: 90, note: "Prensa de piernas" },
          { id: "qKBpF7I", sets: 4, reps: "10-12", restSec: 75, note: "Hip thrust" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral tumbado" },
          { id: "IeDEXTe", sets: 4, reps: "15", restSec: 45, note: "Elevación de gemelos" },
        ],
      },
    ],
  },
  {
    id: "gymmane_upper_lower",
    category: "classic",
    name: "Upper / Lower Split",
    badge: "GymMane Clásico · 4 días/sem",
    level: "Intermedio",
    durationMin: 45,
    focus: "División equilibrada de alta frecuencia: 2 sesiones de torso superior y 2 de tren inferior semanales.",
    glp1Tip: "Excelente equilibrio entre estímulo muscular y recuperación sin agotamiento.",
    days: [
      {
        dayName: "Día A · Torso (Upper)",
        exercises: [
          { id: "SpYC0Kp", sets: 3, reps: "10", restSec: 75, note: "Press de banca con mancuernas" },
          { id: "RVwzP10", sets: 3, reps: "10", restSec: 75, note: "Jalón en polea" },
          { id: "DsgkuIt", sets: 3, reps: "12-15", restSec: 45, note: "Elevaciones laterales" },
          { id: "PdmaD0N", sets: 3, reps: "12", restSec: 60, note: "Extensión de tríceps" },
          { id: "NbVPDMW", sets: 3, reps: "12", restSec: 60, note: "Curl de bíceps" },
        ],
      },
      {
        dayName: "Día B · Pierna (Lower)",
        exercises: [
          { id: "yn8yg1r", sets: 3, reps: "10-12", restSec: 75, note: "Sentadilla goblet" },
          { id: "qKBpF7I", sets: 3, reps: "12", restSec: 75, note: "Empuje de cadera" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral" },
          { id: "ykUOVze", sets: 3, reps: "15", restSec: 45, note: "Gemelos de pie" },
          { id: "TFqbd8t", sets: 3, reps: "15", restSec: 45, note: "Abdomen en colchoneta" },
        ],
      },
    ],
  },
  {
    id: "gymmane_full_body_3x",
    category: "classic",
    name: "Full Body 3x",
    badge: "GymMane Clásico · 3 días/sem",
    level: "Principiante / Intermedio",
    durationMin: 40,
    focus: "Estímulo de cuerpo completo en 3 sesiones por semana mediante ejercicios multiarticulares eficientes.",
    glp1Tip: "Ideal si dispones de 3 días para entrenar (ej. Lunes, Miércoles y Viernes).",
    days: [
      {
        dayName: "Sesión Full Body",
        exercises: [
          { id: "7zdxRTl", sets: 3, reps: "10-12", restSec: 75, note: "Prensa de pierna" },
          { id: "SpYC0Kp", sets: 3, reps: "10", restSec: 75, note: "Press mancuernas" },
          { id: "fUBheHs", sets: 3, reps: "12", restSec: 60, note: "Remo sentado" },
          { id: "A6wtbuL", sets: 3, reps: "10", restSec: 60, note: "Press militar" },
          { id: "TFqbd8t", sets: 3, reps: "15", restSec: 45, note: "Abdomen" },
        ],
      },
    ],
  },
  {
    id: "gymmane_bro_split",
    category: "classic",
    name: "5-Day Muscle Split",
    badge: "GymMane Clásico · 5 días/sem",
    level: "Intermedio / Avanzado",
    durationMin: 45,
    focus: "Un grupo muscular principal por sesión: Pecho, Espalda, Hombros, Piernas y Brazos.",
    glp1Tip: "Permite un bombeo y volumen muscular elevado sin fatigar los mismos grupos dos días consecutivos.",
    days: [
      {
        dayName: "Día 1 · Pecho",
        exercises: [
          { id: "SpYC0Kp", sets: 4, reps: "8-10", restSec: 75, note: "Press plano" },
          { id: "ns0SIbU", sets: 3, reps: "10", restSec: 75, note: "Press inclinado" },
          { id: "yz9nUhF", sets: 3, reps: "12", restSec: 60, note: "Aperturas con mancuernas" },
        ],
      },
      {
        dayName: "Día 2 · Espalda",
        exercises: [
          { id: "RVwzP10", sets: 4, reps: "10", restSec: 75, note: "Jalón al pecho" },
          { id: "fUBheHs", sets: 3, reps: "12", restSec: 60, note: "Remo en polea" },
          { id: "BJ0Hz5L", sets: 3, reps: "10 por brazo", restSec: 60, note: "Remo con mancuerna" },
        ],
      },
    ],
  },
  {
    id: "gymmane_arnold",
    category: "classic",
    name: "Arnold Split",
    badge: "GymMane Clásico · 6 días/sem",
    level: "Avanzado",
    durationMin: 50,
    focus: "División clásica con combinación de grupos antagonistas: Pecho/Espalda, Hombros/Brazos y Piernas.",
    glp1Tip: "Requiere hidratación óptima y cumplimiento de carbohidratos nobles en el día.",
    days: [
      {
        dayName: "Día 1 · Pecho y Espalda",
        exercises: [
          { id: "SpYC0Kp", sets: 4, reps: "10", restSec: 75, note: "Press mancuernas plano" },
          { id: "RVwzP10", sets: 4, reps: "10", restSec: 75, note: "Jalón al pecho" },
          { id: "ns0SIbU", sets: 3, reps: "10", restSec: 60, note: "Press inclinado" },
          { id: "fUBheHs", sets: 3, reps: "12", restSec: 60, note: "Remo en polea" },
        ],
      },
    ],
  },
  {
    id: "gymmane_strength_5x5",
    category: "classic",
    name: "Strength 5x5",
    badge: "GymMane Clásico · 3 días/sem",
    level: "Intermedio",
    durationMin: 45,
    focus: "Desarrollo de fuerza neuromuscular máxima con 5 repeticiones pesadas en patrones básicos.",
    glp1Tip: "Tomar pausas de 90 a 120 segundos para reponer creatina fosfato celular.",
    days: [
      {
        dayName: "Sesión 5x5 Base",
        exercises: [
          { id: "7zdxRTl", sets: 5, reps: "5", restSec: 90, note: "Prensa / Sentadilla pesada controlada" },
          { id: "SpYC0Kp", sets: 5, reps: "5", restSec: 90, note: "Press de banca plano" },
          { id: "fUBheHs", sets: 5, reps: "5", restSec: 90, note: "Remo pesado" },
        ],
      },
    ],
  },
  {
    id: "gymmane_home_bodyweight",
    category: "classic",
    name: "Calistenia sin Equipo",
    badge: "GymMane Clásico · En Casa",
    level: "Principiante / Intermedio",
    durationMin: 25,
    focus: "Acondicionamiento físico completo usando únicamente la masa corporal.",
    glp1Tip: "No se requiere equipamiento complejo para estimular y conservar la masa magra.",
    days: [
      {
        dayName: "Circuito de Calistenia",
        exercises: [
          { id: "6YUfHPL", sets: 4, reps: "15", restSec: 45, note: "Sentadillas profundas" },
          { id: "I4hDWkc", sets: 3, reps: "10-12", restSec: 60, note: "Flexiones de pecho" },
          { id: "c8f5cSY", sets: 3, reps: "15 por lado", restSec: 45, note: "Abducción lateral de cadera" },
          { id: "TFqbd8t", sets: 3, reps: "20", restSec: 45, note: "Flexión abdominal" },
        ],
      },
    ],
  },
  {
    id: "gymmane_dumbbell_only",
    category: "classic",
    name: "Solo Mancuernas",
    badge: "GymMane Clásico · Mancuernas",
    level: "Todos los niveles",
    durationMin: 35,
    focus: "Programa diseñado para entrenar de forma integral con un par de mancuernas.",
    glp1Tip: "Si no tienes mancuernas más pesadas, ralentiza la fase excéntrica (bajada de 3 segundos).",
    days: [
      {
        dayName: "Sesión Completa con Mancuernas",
        exercises: [
          { id: "yn8yg1r", sets: 3, reps: "12", restSec: 60, note: "Sentadilla goblet" },
          { id: "SpYC0Kp", sets: 3, reps: "10-12", restSec: 60, note: "Press con mancuernas" },
          { id: "BJ0Hz5L", sets: 3, reps: "10 por lado", restSec: 60, note: "Remo unilateral" },
          { id: "DsgkuIt", sets: 3, reps: "12-15", restSec: 45, note: "Elevaciones laterales" },
          { id: "NbVPDMW", sets: 3, reps: "12", restSec: 45, note: "Curl de bíceps alterno" },
        ],
      },
    ],
  },
];

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function defaultState() {
  const today = todayISO();
  return {
    version: 1,
    profile: {
      name: "Massiel",
      sex: "female",
      unit: "lb",
      heightCm: 163,
      startWeight: 185,
      currentWeight: 178,
      goalWeight: 145,
      medicationId: "mounjaro",
      currentDose: "2.5 mg",
      injectionDayOfWeek: 5,
      proteinGoalG: 100,
      waterGoalGlasses: 8,
      caloriesGoal: 1400,
      fiberGoalG: 25,
      activeProgramId: "glp1_gluteos_piernas",
    },
    injections: [
      {
        id: "inj-demo-1",
        date: today,
        medicationId: "mounjaro",
        dose: "2.5 mg",
        site: "muslo_izq",
        weight: 178,
        notes: "Aplicación normal, adecuada hidratación previa.",
      },
    ],
    weights: [
      { id: "w-1", date: offsetDate(today, -14), weight: 185, waistCm: 92, hipCm: 108, note: "Inicio de registro" },
      { id: "w-2", date: offsetDate(today, -7), weight: 181.2, waistCm: 90, hipCm: 106.5, note: "Semana 1" },
      { id: "w-3", date: today, weight: 178, waistCm: 88.5, hipCm: 105, note: "Progresión adecuada con foco en proteína" },
    ],
    symptomLogs: [],
    nutritionByDate: {
      [today]: {
        waterGlasses: 4,
        electrolytes: true,
        meals: [
          {
            id: "m-init-1",
            foodId: "huevos_suaves",
            name: "Huevos pochados o revueltos tiernos",
            slot: "Desayuno",
            protein: 14,
            kcal: 155,
            carbs: 1,
            fat: 10,
            fiber: 0,
            category: "green",
          },
          {
            id: "m-init-2",
            foodId: "pechuga_plancha",
            name: "Pechuga de pollo a la plancha",
            slot: "Almuerzo",
            protein: 36,
            kcal: 195,
            carbs: 0,
            fat: 4,
            fiber: 0,
            category: "green",
          },
        ],
      },
    },
    workouts: [],
    customRoutines: [],
    prRecords: {},
  };
}

export function offsetDate(baseIso, deltaDays) {
  const d = new Date(`${baseIso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T12:00:00Z`).getTime();
  const b = new Date(`${dateB}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86400000);
}

export function computeWellnessOverview(state, currentDate = todayISO()) {
  const profile = state?.profile || defaultState().profile;
  const dayLog = state?.nutritionByDate?.[currentDate] || {
    waterGlasses: 0,
    electrolytes: false,
    meals: [],
  };

  const totals = (dayLog.meals || []).reduce(
    (acc, m) => ({
      protein: acc.protein + (Number(m.protein) || 0),
      kcal: acc.kcal + (Number(m.kcal) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
      fiber: acc.fiber + (Number(m.fiber) || 0),
    }),
    { protein: 0, kcal: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const waterGlasses = Number(dayLog.waterGlasses) || 0;
  const proteinGoal = Number(profile.proteinGoalG) || 100;
  const waterGoal = Number(profile.waterGoalGlasses) || 8;
  const caloriesGoal = Number(profile.caloriesGoal) || 1400;
  const proteinPct = Math.min(100, Math.round((totals.protein / proteinGoal) * 100));
  const waterPct = Math.min(100, Math.round((waterGlasses / waterGoal) * 100));
  const caloriesPct = Math.min(100, Math.round((totals.kcal / caloriesGoal) * 100));

  // Injection status
  const sortedInjections = [...(state?.injections || [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const lastInjection = sortedInjections[0] || null;
  const daysSinceInjection = lastInjection
    ? Math.max(0, daysBetween(lastInjection.date, currentDate))
    : null;
  const daysUntilNextInjection =
    daysSinceInjection !== null ? Math.max(0, 7 - daysSinceInjection) : 0;

  let cyclePhase = MEAL_PLANS_BY_PHASE[0];
  if (daysSinceInjection === 0) cyclePhase = MEAL_PLANS_BY_PHASE[0];
  else if (daysSinceInjection === 1 || daysSinceInjection === 2)
    cyclePhase = MEAL_PLANS_BY_PHASE[1];
  else if (daysSinceInjection >= 3 && daysSinceInjection <= 5)
    cyclePhase = MEAL_PLANS_BY_PHASE[2];
  else cyclePhase = MEAL_PLANS_BY_PHASE[3];

  // Today's symptoms
  const todaySymptoms = (state?.symptomLogs || []).filter(
    (s) => s.date === currentDate,
  );
  const hasSevereSymptom = todaySymptoms.some((s) => s.severity === "fuerte");
  const hasModerateSymptom = todaySymptoms.some(
    (s) => s.severity === "moderado",
  );

  // Weight progress
  const sortedWeights = [...(state?.weights || [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const latestWeight = sortedWeights.length
    ? Number(sortedWeights[sortedWeights.length - 1].weight)
    : Number(profile.currentWeight) || 0;
  const startWeight = Number(profile.startWeight) || latestWeight;
  const goalWeight = Number(profile.goalWeight) || latestWeight;
  const lostSoFar = Math.max(0, Number((startWeight - latestWeight).toFixed(1)));
  const totalToLose = Math.max(1, startWeight - goalWeight);
  const weightProgressPct = Math.min(
    100,
    Math.max(0, Math.round((lostSoFar / totalToLose) * 100)),
  );

  // BMI (IMC) Calculation
  const heightM = (Number(profile.heightCm) || 163) / 100;
  const weightKg = profile.unit === "lb" ? latestWeight * 0.453592 : latestWeight;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 22.0;

  let bmiCategory = "Peso saludable";
  let bmiColor = "#10B981";
  if (bmi < 18.5) {
    bmiCategory = "Bajo peso";
    bmiColor = "#38BDF8";
  } else if (bmi < 25) {
    bmiCategory = "Peso saludable";
    bmiColor = "#10B981";
  } else if (bmi < 30) {
    bmiCategory = "Sobrepeso";
    bmiColor = "#F59E0B";
  } else {
    bmiCategory = "Obesidad";
    bmiColor = "#EF4444";
  }

  // Weekly workouts count
  const weekAgo = offsetDate(currentDate, -6);
  const weeklyWorkouts = (state?.workouts || []).filter(
    (w) => w.date >= weekAgo && w.date <= currentDate,
  );

  // Status Indicator
  let color = "green";
  let badge = "En rango óptimo";
  let title = "Metabolismo y Dosis en Balance";
  let caption =
    "Cumplimiento adecuado de proteína, hidratación y volumen de entrenamiento.";

  if (hasSevereSymptom || (daysSinceInjection !== null && daysSinceInjection > 8)) {
    color = "red";
    badge = hasSevereSymptom ? "Alerta digestiva" : "Dosis pendiente";
    title = hasSevereSymptom
      ? "Pausa y alimentación suave"
      : "Registro de dosis semanal pendiente";
    caption = hasSevereSymptom
      ? "Se reportan síntomas de intensidad elevada. Prioriza hidratación con electrolitos y caldos claros."
      : "Han transcurrido más de 7 días desde tu última inyección registrada.";
  } else if (hasModerateSymptom || (proteinPct < 45 && waterPct < 45)) {
    color = "yellow";
    badge = "Ajustar ingesta";
    title = "Priorizar proteína e hidratación";
    caption =
      "La inhibición de sed y apetito es habitual: asegura primero tu meta proteica para blindar el músculo.";
  }

  return {
    color,
    badge,
    title,
    caption,
    totals,
    waterGlasses,
    waterGoal,
    proteinGoal,
    caloriesGoal,
    proteinPct,
    waterPct,
    caloriesPct,
    lastInjection,
    daysSinceInjection,
    daysUntilNextInjection,
    nextSiteSuggestion: suggestNextInjectionSite(sortedInjections),
    cyclePhase,
    todaySymptoms,
    latestWeight,
    startWeight,
    goalWeight,
    lostSoFar,
    weightProgressPct,
    bmi,
    bmiCategory,
    bmiColor,
    weeklyWorkoutsCount: weeklyWorkouts.length,
  };
}

export function getExerciseById(id) {
  return EXERCISES.find((e) => e.id === id) || null;
}
