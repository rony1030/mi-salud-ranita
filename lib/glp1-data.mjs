import { EXERCISES } from "./exercise-catalog.mjs";

export const STORAGE_KEY = "gymmane-glp1:v1";
export const LEGACY_STORAGE_KEY = "mi-salud-ranita:v1";

export const MUSCLE_LABELS = {
  glutes: { name: "Glúteos", side: "back", icon: "🍑", priorityGlp1: true },
  quads: { name: "Cuádriceps (Pierna frontal)", side: "front", icon: "🦵", priorityGlp1: true },
  hamstrings: { name: "Isquiotibiales (Pierna posterior)", side: "back", icon: "🦵", priorityGlp1: true },
  abdomen: { name: "Abdomen y Core", side: "front", icon: "🎯", priorityGlp1: true },
  obliques: { name: "Oblicuos (Cintura)", side: "front", icon: "⏳", priorityGlp1: false },
  back: { name: "Espalda Dorsal", side: "back", icon: "🛡️", priorityGlp1: true },
  shoulders: { name: "Hombros", side: "both", icon: "💪", priorityGlp1: true },
  chest: { name: "Pectorales (Pecho)", side: "front", icon: "✨", priorityGlp1: false },
  biceps: { name: "Bíceps", side: "front", icon: "💪", priorityGlp1: false },
  triceps: { name: "Tríceps (Brazo posterior)", side: "back", icon: "✨", priorityGlp1: true },
  calves: { name: "Pantorrillas (Gemelos)", side: "both", icon: "👟", priorityGlp1: false },
  trapezius: { name: "Trapecio", side: "both", icon: "⬆️", priorityGlp1: false },
  lowerback: { name: "Espalda Baja (Lumbar)", side: "back", icon: "🧘‍♀️", priorityGlp1: false },
  forearm: { name: "Antebrazos", side: "both", icon: "✊", priorityGlp1: false },
};

export const EQUIPMENT_LABELS = {
  Bodyweight: "Peso corporal (En casa)",
  Dumbbell: "Mancuernas",
  Band: "Bandas elásticas",
  Machine: "Máquina de gimnasio",
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
    name: "Solo Dieta y Ejercicio (Sin inyección)",
    brand: "Plan Natural",
    activeIngredient: "Entrenamiento de fuerza + Nutrición proteica",
    frequencyDays: 7,
    doses: ["Control semanal"],
    summary:
      "Seguimiento de peso, medidas, macros y entrenamientos de fuerza sin fármacos inyectables.",
  },
];

export const INJECTION_SITES = [
  {
    id: "abdomen_izq",
    label: "Abdomen Izquierdo",
    short: "Abdomen Izq.",
    zone: "Abdomen",
    tip: "Aplica al menos a 5 cm (2 dedos) de distancia del ombligo en tejido graso suave.",
    coords: { x: 62, y: 48 },
  },
  {
    id: "abdomen_der",
    label: "Abdomen Derecho",
    short: "Abdomen Der.",
    zone: "Abdomen",
    tip: "Alterna de lado cada semana. Evita aplicar sobre cicatrices o piel enrojecida.",
    coords: { x: 38, y: 48 },
  },
  {
    id: "muslo_izq",
    label: "Muslo Frontal Izquierdo",
    short: "Muslo Izq.",
    zone: "Muslo",
    tip: "Tercio medio frontal de la pierna sentado. Reduce náuseas en muchos usuarios.",
    coords: { x: 60, y: 68 },
  },
  {
    id: "muslo_der",
    label: "Muslo Frontal Derecho",
    short: "Muslo Der.",
    zone: "Muslo",
    tip: "Tercio medio frontal. Gran alternativa de rotación cuando el abdomen está sensible.",
    coords: { x: 40, y: 68 },
  },
  {
    id: "brazo_izq",
    label: "Brazo Superior Izquierdo",
    short: "Brazo Izq.",
    zone: "Brazo",
    tip: "Zona posterior carnosa (tríceps). Ideal para rotar tras varias semanas de abdomen.",
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
    name: "Náuseas o malestar estomacal",
    icon: "🤢",
    category: "Digestivo",
    whatToEat: [
      "Té tibio de jengibre fresco o agua helada con gotas de limón a sorbitos",
      "Caldo desgrasado de pollo con pechuga desmenuzada",
      "Galletitas saladas integrales o pan tostado seco",
      "Puré de manzana sin azúcar o gelatina ligera",
      "Comidas a temperatura ambiente (los vapores calientes activan la náusea)",
    ],
    whatToAvoid: [
      "Frituras, carnes grasas, lácteos enteros y salsas con crema",
      "Acostarte antes de 2 horas tras comer",
      "Tomar vasos grandes de agua de golpe durante las comidas",
    ],
    whyItHappens:
      "Tanto Mounjaro como Ozempic retardan el vaciado del estómago. Si ingieres grasa o volumen excesivo, el estómago se congestiona.",
  },
  {
    id: "reflujo",
    name: "Reflujo gastroesofágico o acidez",
    icon: "🔥",
    category: "Digestivo",
    whatToEat: [
      "Avena suave cocida en agua o leche de almendras",
      "Papaya o melón dulce en trocitos pequeños",
      "Pechuga de pollo o merluza a la plancha con sal suave",
      "Cenas tempranas (al menos 3 horas antes de acostarse)",
    ],
    whatToAvoid: [
      "Café en ayunas, chocolate, picante, salsas de tomate y vinagres",
      "Refrescos o agua con gas carbonatada",
      "Cenas abundantes después de las 8:00 PM",
    ],
    whyItHappens:
      "Al permanecer el quimo más tiempo en la cavidad gástrica, el ácido clorhídrico puede ascender hacia el esófago, en especial al recostarse.",
  },
  {
    id: "eructos",
    name: "Eructos con olor a azufre (Sulfur burps) o gases",
    icon: "🫧",
    category: "Digestivo",
    whatToEat: [
      "Infusión de menta piperita o manzanilla tibia tras comer",
      "Pescado blanco, pavo magro o claras de huevo",
      "Arroz blanco suave en porción pequeña y pepino sin piel",
      "Masticar lento y en calma cada bocado",
    ],
    whatToAvoid: [
      "Carnes rojas pesadas en la noche (tardan hasta 10 horas en digerirse)",
      "Brócoli, coliflor, cebolla cruda, repollo y ajo en exceso por 48 h",
      "Alimentos fritos o ultraprocesados azucarados que fermentan",
    ],
    whyItHappens:
      "Las bacterias digestivas descomponen alimentos ricos en azufre que se han retenido más de lo habitual por el vaciado lento.",
  },
  {
    id: "estrenimiento",
    name: "Estreñimiento o tránsito lento",
    icon: "🧱",
    category: "Digestivo",
    whatToEat: [
      "Papaya (lechosa), pitahaya, kiwi o 1 cucharadita de chía remojada",
      "Vegetales cocidos al vapor con 1 cucharadita de aceite de oliva crudo",
      "Subir a 2.5 litros de agua diaria + electrolitos sin azúcar",
      "Caminata ligera de 15 a 20 minutos tras las comidas principales",
    ],
    whatToAvoid: [
      "Ignorar la hidratación porque 'no tienes sed'",
      "Exceso de harinas refinadas y quesos curados maduros",
    ],
    whyItHappens:
      "El peristaltismo intestinal disminuye y el fármaco inhibe la señal neurológica de sed, resecando las heces si no te hidratas.",
  },
  {
    id: "llenura",
    name: "Saciedad precoz o llenura extrema",
    icon: "🎈",
    category: "Saciedad",
    whatToEat: [
      "Dividir la ingesta en 4 o 5 mini comidas nutritivas",
      "Comenzar SIEMPRE por 4-5 bocados de proteína magra antes que los carbohidratos",
      "Batidos de proteína whey isolate si no toleras textura sólida",
    ],
    whatToAvoid: [
      "Forzarte a vaciar el plato cuando sientes la señal de saciedad",
      "Líquidos abundantes justo antes o durante la comida",
    ],
    whyItHappens:
      "Efecto terapéutico directo sobre el centro hipotalámico de saciedad. Respeta el aviso de tu cuerpo y prioriza densidad de aminoácidos.",
  },
  {
    id: "fatiga",
    name: "Fatiga o déficit de energía",
    icon: "🔋",
    category: "Energía",
    whatToEat: [
      "Electrolitos completos (sodio, potasio y magnesio) sin azúcar en la mañana",
      "2 huevos revueltos o yogur griego con una fruta suave",
      "Consomé tibio con sal marina para reponer volumen vascular",
    ],
    whatToAvoid: [
      "Pasar más de 5 horas sin consumir aminoácidos o líquidos",
      "Entrenamientos de alta intensidad extenuantes en los días 1 y 2 post-dosis",
    ],
    whyItHappens:
      "El déficit calórico abrupto sumado a la pérdida inicial de agua y glucógeno reduce temporalmente el tono energético mitocondrial.",
  },
  {
    id: "mareo",
    name: "Mareo postural o aturdimiento leve",
    icon: "💫",
    category: "Energía",
    whatToEat: [
      "Agua con electrolitos y una pizca de sal marina",
      "Snack proteico con un carbohidrato noble (medio plátano con yogur griego)",
    ],
    whatToAvoid: [
      "Cambios bruscos de posición de tumbado a de pie",
      "Ejercicios tipo burpees donde la cabeza sube y baja rápido",
    ],
    whyItHappens:
      "Hipotensión ortostática leve por vasodilatación, menor volumen plasmático o menor ingesta sódica. Si tomas antihipertensivos, consulta con tu médico.",
  },
  {
    id: "diarrea",
    name: "Diarrea o deposiciones líquidas",
    icon: "💧",
    category: "Digestivo",
    whatToEat: [
      "Suero oral con electrolitos y caldo claro de pollo",
      "Arroz blanco cocido suave, compota de manzana y pechuga hervida",
    ],
    whatToAvoid: [
      "Lácteos con lactosa, grasas añadidas, picante, café y polialcoholes (sorbitol, maltitol)",
    ],
    whyItHappens:
      "Respuesta gástrica frecuente tras escalar la dosis del fármaco o por consumo involuntario de una porción con demasiada grasa oculta.",
  },
];

export const FOOD_GUIDE = [
  // 🟢 VERDE: Priorizar (Proteína de fácil absorción, protección muscular, sin carga gástrica)
  {
    id: "pechuga_plancha",
    name: "Pechuga de pollo a la plancha",
    category: "green",
    group: "Proteína Magra",
    icon: "🍗",
    portion: "120 g (palma de la mano)",
    kcal: 195,
    protein: 36,
    carbs: 0,
    fat: 4,
    fiber: 0,
    reason:
      "La proteína estándar para proteger masa magra y glúteos mientras quemas grasa. Se digiere sin fricción si se cocina sin grasas quemadas.",
    bestFor: "Almuerzo o cena · Cómelos de primero",
  },
  {
    id: "pescado_blanco",
    name: "Filete de merluza, corvina o salmón suave",
    category: "green",
    group: "Proteína Magra",
    icon: "🐟",
    portion: "130 g",
    kcal: 180,
    protein: 30,
    carbs: 0,
    fat: 6,
    fiber: 0,
    reason:
      "Fibras musculares cortas de digestión inmediata. Ideal en los días 1 a 3 post-inyección cuando el apetito es mínimo.",
    bestFor: "Cena suave o días con saciedad temprana",
  },
  {
    id: "huevos_suaves",
    name: "Huevos revueltos tiernos o poche",
    category: "green",
    group: "Proteína y Micronutrientes",
    icon: "🥚",
    portion: "2 unidades (o 1 huevo + 2 claras)",
    kcal: 155,
    protein: 14,
    carbs: 1,
    fat: 10,
    fiber: 0,
    reason:
      "Aporte completo de colina, biotina y aminoácidos esenciales en volumen compacto. Ayuda a sostener el cabello y la piel.",
    bestFor: "Desayuno o cena ligera",
  },
  {
    id: "yogur_griego",
    name: "Yogur griego 0% o 2% natural sin azúcar",
    category: "green",
    group: "Proteína y Probióticos",
    icon: "🥣",
    portion: "170 g (1 taza)",
    kcal: 110,
    protein: 17,
    carbs: 6,
    fat: 2,
    fiber: 0,
    reason:
      "Textura fresca que apetece mucho cuando hay náuseas o no quieres platos calientes. Cultivos vivos que favorecen la microbiota.",
    bestFor: "Desayuno, merienda o post-entreno",
  },
  {
    id: "batido_whey",
    name: "Batido de Proteína Whey Isolate o Vegetal",
    category: "green",
    group: "Proteína Rápida",
    icon: "🥤",
    portion: "1 scoop (30 g) en agua fría",
    kcal: 125,
    protein: 25,
    carbs: 2,
    fat: 1,
    fiber: 0,
    reason:
      "El comodín clínico de GLP-1: permite cumplir la meta de 80-120 g de proteína diaria cuando la comida sólida produce rechazo.",
    bestFor: "Días 1-2 post-inyección o merienda",
  },
  {
    id: "caldo_pollo",
    name: "Caldo casero de pollo con vegetales desgrasado",
    category: "green",
    group: "Hidratación y Electrolitos",
    icon: "🍲",
    portion: "300 ml con pollo picado",
    kcal: 140,
    protein: 18,
    carbs: 8,
    fat: 3,
    fiber: 2,
    reason:
      "Aporta líquidos, sodio biodisponible y calor gástrico reconfortante sin provocar náuseas ni reflujo.",
    bestFor: "Día de la inyección y día siguiente",
  },
  {
    id: "lechosa_papaya",
    name: "Papaya (lechosa) o melón fresco",
    category: "green",
    group: "Digestión y Fibra",
    icon: "🍈",
    portion: "1 taza en cubos",
    kcal: 62,
    protein: 1,
    carbs: 15,
    fat: 0,
    fiber: 3,
    reason:
      "Enzima papaína que acelera la descomposición de proteínas en el estómago y fibra soluble que previene el estreñimiento.",
    bestFor: "Mañanas o entre comidas",
  },
  {
    id: "avena_chia",
    name: "Avena cocida con semillas de chía hidratadas",
    category: "green",
    group: "Fibra Soluble",
    icon: "🌾",
    portion: "1/2 taza cocida",
    kcal: 140,
    protein: 5,
    carbs: 23,
    fat: 3,
    fiber: 5,
    reason:
      "Los mucílagos protegen la mucosa estomacal contra el ácido y dan saciedad prolongada sin distensión.",
    bestFor: "Desayuno nutritivo",
  },

  // 🟡 AMARILLO: Moderar (Porción pequeña y controlada)
  {
    id: "aguacate",
    name: "Aguacate fresco en rebanadas",
    category: "yellow",
    group: "Grasas Saludables",
    icon: "🥑",
    portion: "2 rebanadas (30-40 g)",
    kcal: 65,
    protein: 1,
    carbs: 3,
    fat: 6,
    fiber: 2,
    reason:
      "Excelente ácido oleico y potasio, pero las grasas retrasan aún más el vaciado del estómago. No exceder 40 g por comida.",
    bestFor: "Almuerzo en días estables (Días 3 a 7)",
  },
  {
    id: "viveres_suaves",
    name: "Batata, auyama o puré de papa suave",
    category: "yellow",
    group: "Carbohidratos Nobles",
    icon: "🍠",
    portion: "1/2 taza pequeña",
    kcal: 95,
    protein: 2,
    carbs: 22,
    fat: 0,
    fiber: 3,
    reason:
      "Carbohidrato noble que recarga glucógeno muscular. Servir en porción moderada para dejar espacio a la proteína.",
    bestFor: "Almuerzos en días de entrenamiento",
  },
  {
    id: "arroz_blanco",
    name: "Arroz blanco cocido al vapor",
    category: "yellow",
    group: "Carbohidrato Simple",
    icon: "🍚",
    portion: "1/3 taza cocida (70 g)",
    kcal: 85,
    protein: 2,
    carbs: 18,
    fat: 0,
    fiber: 0.5,
    reason:
      "Muy suave con el estómago pero aporta poco volumen de proteína. Cómetelo tras terminar tu porción de carne o pescado.",
    bestFor: "Acompañante medido",
  },
  {
    id: "habichuelas_suaves",
    name: "Habichuelas o lentejas coladas suaves",
    category: "yellow",
    group: "Legumbres",
    icon: "🫘",
    portion: "1/3 taza",
    kcal: 90,
    protein: 6,
    carbs: 16,
    fat: 0.5,
    fiber: 5,
    reason:
      "Ricas en fibra y hierro, pero pueden provocar gases o sensación de pesadez si se comen en volumen alto o con sofrito pesado.",
    bestFor: "Almuerzo medido",
  },

  // 🔴 ROJO: Evitar (Causan náuseas severas, reflujo y eructos con GLP-1)
  {
    id: "frituras",
    name: "Frituras, chicharrón y empanizados",
    category: "red",
    group: "Grasas Saturadas",
    icon: "🥓",
    portion: "Cualquier cantidad",
    kcal: 380,
    protein: 10,
    carbs: 18,
    fat: 30,
    fiber: 0,
    reason:
      "Detonante #1 de náuseas, vómitos y diarrea con Mounjaro/Ozempic. La grasa excesiva queda atrapada horas en el estómago.",
    bestFor: "Evitar de forma estricta",
  },
  {
    id: "bebidas_gas",
    name: "Refrescos y bebidas carbonatadas",
    category: "red",
    group: "Gases y Azúcares",
    icon: "🥤",
    portion: "Cualquier lata o botella",
    kcal: 140,
    protein: 0,
    carbs: 35,
    fat: 0,
    fiber: 0,
    reason:
      "El gas distiende las paredes del estómago ya enlentecido, provocando reflujo ácido agudo y eructos dolorosos.",
    bestFor: "Sustituir por agua con limón o té frío",
  },
  {
    id: "alcohol",
    name: "Cerveza, vino o licores",
    category: "red",
    group: "Toxina Hepática",
    icon: "🍺",
    portion: "Cualquier copa",
    kcal: 160,
    protein: 0,
    carbs: 12,
    fat: 0,
    fiber: 0,
    reason:
      "Aumenta drásticamente el riesgo de hipoglucemia severa, irrita la mucosa gástrica y compite con la degradación del fármaco en hígado.",
    bestFor: "Evitar completamente",
  },
  {
    id: "carnes_grasosas",
    name: "Costillas de cerdo, embutidos y chorizos grasos",
    category: "red",
    group: "Carnes Pesadas",
    icon: "🍖",
    portion: "Porciones convencionales",
    kcal: 320,
    protein: 16,
    carbs: 2,
    fat: 28,
    fiber: 0,
    reason:
      "Tiempo de digestión de hasta 8-10 horas. Produce fermentación anaeróbica con sulfur burps desagradables.",
    bestFor: "Sustituir por pechuga de pavo o pollo",
  },
  {
    id: "postres_azucar",
    name: "Dulces densos, donas y helados cremosos",
    category: "red",
    group: "Azúcar Concentrado",
    icon: "🍩",
    portion: "Porciones comunes",
    kcal: 290,
    protein: 3,
    carbs: 45,
    fat: 12,
    fiber: 0.5,
    reason:
      "La carga osmótica de azúcar rápida en el intestino delgado puede generar síndrome de dumping, taquicardia y náuseas repentinas.",
    bestFor: "Elegir fruta fresca con canela",
  },
];

export const MEAL_PLANS_BY_PHASE = [
  {
    id: "day_0",
    title: "Día 0 · Día de Inyección (Preparación y Cero Náusea)",
    badge: "💉 Día de Dosis",
    description:
      "Prepara tu organismo con abundante agua, electrolitos y comidas ligeras. Reduce grasa para asegurar que la dosis asiente con calma.",
    meals: [
      {
        slot: "Desayuno",
        idea: "Avena suave en agua o leche de almendras con 1 cdita de chía y 2 claras de huevo revueltas tiernas.",
        macros: "20 g proteína · Muy digestivo",
      },
      {
        slot: "Almuerzo Ligero",
        idea: "Filete de pechuga a la plancha con puré de batata pequeño y zanahoria al vapor.",
        macros: "32 g proteína · Libre de grasa pesada",
      },
      {
        slot: "Merienda Pre-Inyección",
        idea: "Tazón de caldo claro de pollo con electrolitos en agua fresca 1 hora antes de la aplicación.",
        macros: "15 g proteína · Excelente hidratación",
      },
      {
        slot: "Cena Post-Dosis",
        idea: "Sopa suave o batido ligero de proteína whey isolate. Nada de comida grasosa ni pesada en la noche.",
        macros: "25 g proteína · Cero reflujo nocturno",
      },
    ],
  },
  {
    id: "peak_days",
    title: "Días 1 y 2 · Pico Farmacológico (Máxima Saciedad)",
    badge: "🧊 Fase de Saciedad Máxima",
    description:
      "El efecto anorexígeno es máximo y el vaciado estomacal es más lento. Si no tienes apetito, come en mini porciones y prioriza líquidos con proteína.",
    meals: [
      {
        slot: "Mañana",
        idea: "1 taza de yogur griego 0% con papaya picada o té de jengibre con 2 galletas saladas integrales.",
        macros: "18 g proteína · Suave con el estómago",
      },
      {
        slot: "Mediodía",
        idea: "Filete de pescado blanco a la plancha (120 g) con 2 cucharadas de arroz blanco o puré suave.",
        macros: "28 g proteína · Digestión ultrarrápida",
      },
      {
        slot: "Tarde",
        idea: "Batido de proteína isolate en agua fría bebido a sorbitos lentos durante 30 minutos.",
        macros: "25 g proteína · Nutre sin llenar",
      },
      {
        slot: "Noche",
        idea: "Caldo de pollo desgrasado con trocitos de pechuga tierna o 2 claras revueltas.",
        macros: "20 g proteína · Cero pesadez al dormir",
      },
    ],
  },
  {
    id: "active_days",
    title: "Días 3, 4 y 5 · Ventana de Fuerza y Masa Muscular",
    badge: "💪 Entrenar Pesado",
    description:
      "Tu sistema digestivo está perfectamente adaptado y cuentas con buen nivel de energía. Esta es la ventana de oro para levantar pesas y proteger tu masa muscular.",
    meals: [
      {
        slot: "Desayuno Completo",
        idea: "2 huevos enteros revueltos con espinacas + 1/2 plátano verde o batata hervida.",
        macros: "22 g proteína · Energía sostenida",
      },
      {
        slot: "Almuerzo Anabólico GLP-1",
        idea: "140 g de pechuga o ternera magra + ensalada verde fresca + 1/3 taza de arroz blanco y aguacate medido.",
        macros: "38 g proteína · Hierro y micronutrientes",
      },
      {
        slot: "Merienda Post-Entrenamiento",
        idea: "Yogur griego con semillas de chía o batido proteico con hielo triturado.",
        macros: "25 g proteína · Síntesis proteica activa",
      },
      {
        slot: "Cena Reparadora",
        idea: "Salmón o pechuga al horno con verduras salteadas con aceite de oliva crudo.",
        macros: "32 g proteína · Saciante y limpia",
      },
    ],
  },
  {
    id: "appetite_return",
    title: "Días 6 y 7 · Cierre Semanal y Retorno de Apetito",
    badge: "🥗 Volumen & Fibra",
    description:
      "Hacia el final de la semana la concentración sérica del fármaco disminuye levemente y es natural sentir más ganas de comer. Aplica volumen con vegetales y fibra soluble para mantener el déficit con plenitud.",
    meals: [
      {
        slot: "Desayuno",
        idea: "Omelette de 2 huevos con champiñones y tomate + avena con semillas de chía hidratadas.",
        macros: "22 g proteína · 6 g fibra saciante",
      },
      {
        slot: "Almuerzo de Volumen",
        idea: "Bowl grande: 140 g de pollo a la plancha sobre base abundante de vegetales verdes, pepino, batata al horno y vinagreta suave.",
        macros: "36 g proteína · 8 g fibra",
      },
      {
        slot: "Merienda Anti-Ansiedad",
        idea: "Gelatina sin azúcar + yogur griego con fresas frescas picadas.",
        macros: "18 g proteína · Calma el paladar dulce",
      },
      {
        slot: "Cena Ligera",
        idea: "Atún al agua o pechuga desmenuzada sobre crema de calabaza o vegetales al vapor.",
        macros: "30 g proteína · Cero carga calórica",
      },
    ],
  },
];

export const GLP1_ROUTINES = [
  // 1. Programas Especializados GLP-1 (Anti-Flacidez y Preservación)
  {
    id: "glp1_gluteos_piernas",
    category: "glp1",
    name: "GLP-1 Glúteos y Piernas Firmes (Cero Flacidez)",
    badge: "🍑 Glúteos Prioridad #1",
    level: "Todos los niveles",
    durationMin: 32,
    focus: "Evitar la pérdida de volumen y firmeza en glúteos e isquiotibiales mientras bajas de peso rápido con Mounjaro u Ozempic.",
    glp1Tip: "Consume tu batido o comida proteica en las 2 horas posteriores para nutrir el tejido muscular del glúteo.",
    days: [
      {
        dayName: "Día 1 · Enfoque Glúteo Redondo y Fuerte",
        exercises: [
          { id: "qKBpF7I", sets: 4, reps: "12", restSec: 75, note: "Hip thrust con mancuerna o barra: aprieta arriba 2 segundos" },
          { id: "qx4fgX7", sets: 3, reps: "10 por pierna", restSec: 60, note: "Sentadilla búlgara: tronco inclinado al frente para activar glúteo" },
          { id: "nUwVh7b", sets: 3, reps: "12", restSec: 60, note: "Peso muerto rumano con mancuernas estirando isquiotibiales" },
          { id: "c8f5cSY", sets: 3, reps: "15 por lado", restSec: 45, note: "Abducción de cadera de lado para dar forma a la cadera alta" },
          { id: "8ozhUIZ", sets: 3, reps: "15-20", restSec: 45, note: "Elevación de talones para activar retorno venoso" },
        ],
      },
      {
        dayName: "Día 2 · Pierna Completa y Cuádriceps",
        exercises: [
          { id: "yn8yg1r", sets: 3, reps: "12", restSec: 60, note: "Sentadilla goblet profunda y controlada" },
          { id: "7zdxRTl", sets: 3, reps: "12", restSec: 75, note: "Prensa de piernas segura sin despegar la pelvis" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral en máquina" },
          { id: "RRWFUcw", sets: 3, reps: "10 por pierna", restSec: 60, note: "Zancadas controladas" },
        ],
      },
    ],
  },
  {
    id: "glp1_femenina_completa",
    category: "glp1",
    name: "GLP-1 Preservación Muscular Femenina (Cuerpo Completo)",
    badge: "🛡️ Anti-Flacidez Femenina",
    level: "Intermedio",
    durationMin: 35,
    focus: "Estimular todos los grupos musculares mayores (espalda, hombros, piernas, brazos) para estilizar la figura y evitar piel colgada.",
    glp1Tip: "Descansar 60-90 segundos entre series optimiza la recuperación del sistema nervioso central.",
    days: [
      {
        dayName: "Sesión A · Espalda, Glúteos y Brazos Firmes",
        exercises: [
          { id: "RVwzP10", sets: 3, reps: "10-12", restSec: 60, note: "Jalón al pecho en polea para dar forma esbelta a la cintura" },
          { id: "qKBpF7I", sets: 3, reps: "12", restSec: 75, note: "Puente de glúteos con peso" },
          { id: "BJ0Hz5L", sets: 3, reps: "10 por lado", restSec: 60, note: "Remo unilateral con mancuerna" },
          { id: "PAgTVaK", sets: 3, reps: "12", restSec: 45, note: "Extensión de tríceps contra la flacidez debajo del brazo" },
          { id: "TFqbd8t", sets: 3, reps: "15", restSec: 45, note: "Crunch abdominal expulsando aire al subir" },
        ],
      },
      {
        dayName: "Sesión B · Hombros Redondos, Piernas y Core",
        exercises: [
          { id: "DsgkuIt", sets: 3, reps: "12-15", restSec: 45, note: "Elevaciones laterales con mancuernas ligeras" },
          { id: "yn8yg1r", sets: 3, reps: "12", restSec: 60, note: "Sentadilla goblet" },
          { id: "SpYC0Kp", sets: 3, reps: "10-12", restSec: 60, note: "Press plano con mancuernas reafirmando el pectoral" },
          { id: "NbVPDMW", sets: 3, reps: "12", restSec: 45, note: "Curl de bíceps con mancuernas" },
          { id: "XVDdcoj", sets: 3, reps: "20 giros", restSec: 45, note: "Giro ruso para tonificar oblicuos" },
        ],
      },
    ],
  },
  {
    id: "glp1_post_inyeccion_suave",
    category: "glp1",
    name: "GLP-1 Día Suave Post-Inyección (Sin Mareos ni Náuseas)",
    badge: "🌿 Días 1-2 · Suave",
    level: "Principiante / Recuperación",
    durationMin: 20,
    focus: "Mover el cuerpo suavemente para oxigenar y reducir gases sin ejercicios de cabeza abajo que provoquen reflujo.",
    glp1Tip: "Sin saltos ni cambios bruscos de altura. Hidrátate con sorbos pequeños de agua templada.",
    days: [
      {
        dayName: "Circuito Suave de Activación",
        exercises: [
          { id: "6YUfHPL", sets: 2, reps: "10 suaves", restSec: 60, note: "Sentadilla a silla sin peso a ritmo muy pausado" },
          { id: "DsgkuIt", sets: 2, reps: "10", restSec: 45, note: "Elevación lateral con peso mínimo respirando profundo" },
          { id: "c8f5cSY", sets: 2, reps: "12 por lado", restSec: 45, note: "Elevación de pierna lateral tumbada" },
          { id: "LNE3wfo", sets: 2, reps: "30 seg", restSec: 30, note: "Estiramiento suave para soltar tensión" },
        ],
      },
    ],
  },
  {
    id: "glp1_tonificacion_casa",
    category: "glp1",
    name: "GLP-1 Tonificación en Casa 25 min",
    badge: "🏠 En Casa · Mancuernas o Peso Corporal",
    level: "Principiante / Intermedio",
    durationMin: 25,
    focus: "Fuerza funcional en la sala de tu casa con peso corporal o un par de mancuernas para mantener el metabolismo activo.",
    glp1Tip: "La constancia de 3 días a la semana en casa es suficiente para preservar tu masa muscular magra.",
    days: [
      {
        dayName: "Circuito Rápido de Cuerpo Completo",
        exercises: [
          { id: "6YUfHPL", sets: 3, reps: "15", restSec: 45, note: "Sentadillas al aire bajando hasta paralelo" },
          { id: "I4hDWkc", sets: 3, reps: "8-10", restSec: 60, note: "Flexiones de pecho apoyando rodillas si es necesario" },
          { id: "u27Kcdz", sets: 3, reps: "15", restSec: 45, note: "Puente de glúteos en el suelo apretando arriba" },
          { id: "BbfB8Gb", sets: 3, reps: "15", restSec: 45, note: "Abdominales controlados" },
        ],
      },
    ],
  },

  // 2. Programas Clásicos de GymMane (Rutinas Pro de Gimnasio)
  {
    id: "gymmane_ppl",
    category: "classic",
    name: "Push / Pull / Legs (PPL — 6 días)",
    badge: "⚡ GymMane Pro · 6 días/sem",
    level: "Avanzado",
    durationMin: 50,
    focus: "La división más popular de GymMane: Empuje (Pecho/Hombro/Tríceps), Tirón (Espalda/Bíceps) y Pierna (Glúteos/Cuádriceps/Femoral).",
    glp1Tip: "Asegura mínimo 1.8 g de proteína por kg al entrenar a esta frecuencia.",
    days: [
      {
        dayName: "Día 1 · Push (Empuje)",
        exercises: [
          { id: "SpYC0Kp", sets: 4, reps: "8-10", restSec: 90, note: "Press de banca con mancuernas" },
          { id: "ns0SIbU", sets: 3, reps: "10-12", restSec: 75, note: "Press inclinado" },
          { id: "A6wtbuL", sets: 3, reps: "10", restSec: 75, note: "Press militar de pie con mancuernas" },
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
          { id: "7zdxRTl", sets: 4, reps: "10-12", restSec: 90, note: "Prensa de piernas pesada" },
          { id: "qKBpF7I", sets: 4, reps: "10-12", restSec: 75, note: "Hip thrust" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral tumbado" },
          { id: "IeDEXTe", sets: 4, reps: "15", restSec: 45, note: "Elevación de gemelos en máquina" },
        ],
      },
    ],
  },
  {
    id: "gymmane_upper_lower",
    category: "classic",
    name: "Upper / Lower Split (Torso / Pierna — 4 días)",
    badge: "🏛️ Clásico GymMane · 4 días/sem",
    level: "Intermedio",
    durationMin: 45,
    focus: "División equilibrada de alta frecuencia: 2 sesiones de torso superior y 2 sesiones de pierna por semana.",
    glp1Tip: "Excelente equilibrio para quien busca construir masa muscular sin fatiga excesiva.",
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
          { id: "yn8yg1r", sets: 3, reps: "10-12", restSec: 75, note: "Sentadilla goblet pesada" },
          { id: "qKBpF7I", sets: 3, reps: "12", restSec: 75, note: "Empuje de cadera" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral" },
          { id: "ykUOVze", sets: 3, reps: "15", restSec: 45, note: "Gemelos de pie" },
          { id: "TFqbd8t", sets: 3, reps: "15", restSec: 45, note: "Abdomen en suelo" },
        ],
      },
    ],
  },
  {
    id: "gymmane_full_body_3x",
    category: "classic",
    name: "Full Body 3x (Cuerpo Completo — 3 días)",
    badge: "⭐ Eficiencia Máxima · 3 días/sem",
    level: "Principiante / Intermedio",
    durationMin: 40,
    focus: "Estimula cada grupo muscular tres veces por semana con ejercicios compuestos, optimizando el tiempo invertido.",
    glp1Tip: "Ideal si dispones de 3 días para entrenar (ej. Lunes, Miércoles y Viernes).",
    days: [
      {
        dayName: "Sesión Full Body",
        exercises: [
          { id: "7zdxRTl", sets: 3, reps: "10-12", restSec: 75, note: "Prensa de pierna" },
          { id: "SpYC0Kp", sets: 3, reps: "10", restSec: 75, note: "Press mancuernas" },
          { id: "fUBheHs", sets: 3, reps: "12", restSec: 60, note: "Remo sentado" },
          { id: "A6wtbuL", sets: 3, reps: "10", restSec: 60, note: "Press de hombros" },
          { id: "TFqbd8t", sets: 3, reps: "15", restSec: 45, note: "Abdomen" },
        ],
      },
    ],
  },
  {
    id: "gymmane_bro_split",
    category: "classic",
    name: "5-Day Muscle Split (1 Músculo por Día)",
    badge: "🔥 Bro Split · 5 días/sem",
    level: "Intermedio / Avanzado",
    durationMin: 45,
    focus: "Día 1 Pecho, Día 2 Espalda, Día 3 Hombros, Día 4 Piernas, Día 5 Brazos.",
    glp1Tip: "Permite un bombeo y volumen muscular elevado sin fatigar los mismos grupos dos días seguidos.",
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
    name: "Arnold Split (Pecho/Espalda, Hombros/Brazos, Piernas)",
    badge: "🏆 Clásico Golden Era · 6 días/sem",
    level: "Avanzado",
    durationMin: 50,
    focus: "Inspirado en el entrenamiento clásico con superseries de músculos antagonistas.",
    glp1Tip: "Requiere excelente hidratación y cumplimiento estricto de carbohidratos nobles en el día.",
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
    name: "Strength 5x5 (Fuerza Base)",
    badge: "⛓️ Fuerza Pura · 3 días/sem",
    level: "Intermedio",
    durationMin: 45,
    focus: "Construye fuerza neural máxima con series de 5 repeticiones pesadas en ejercicios multiarticulares.",
    glp1Tip: "Toma descansos largos de 90 a 120 segundos para reponer creatina fosfato celular.",
    days: [
      {
        dayName: "Día A · 5x5 Base",
        exercises: [
          { id: "7zdxRTl", sets: 5, reps: "5", restSec: 90, note: "Prensa / Sentadilla pesada controlada" },
          { id: "SpYC0Kp", sets: 5, reps: "5", restSec: 90, note: "Press de banca pesado" },
          { id: "fUBheHs", sets: 5, reps: "5", restSec: 90, note: "Remo pesado" },
        ],
      },
    ],
  },
  {
    id: "gymmane_home_bodyweight",
    category: "classic",
    name: "Home Bodyweight (En Casa sin Equipo)",
    badge: "🤸 Calistenia · 0 Equipamiento",
    level: "Principiante / Intermedio",
    durationMin: 25,
    focus: "Entrenamiento completo utilizando únicamente la gravedad y el propio peso corporal.",
    glp1Tip: "Cero excusas: no necesitas pagar mensualidad de gimnasio para preservar tu masa muscular.",
    days: [
      {
        dayName: "Circuito Corporal",
        exercises: [
          { id: "6YUfHPL", sets: 4, reps: "15", restSec: 45, note: "Sentadillas profundas al aire" },
          { id: "I4hDWkc", sets: 3, reps: "10-12", restSec: 60, note: "Flexiones de pecho" },
          { id: "c8f5cSY", sets: 3, reps: "15 por lado", restSec: 45, note: "Abducción lateral de cadera" },
          { id: "TFqbd8t", sets: 3, reps: "20", restSec: 45, note: "Crunch abdominal" },
        ],
      },
    ],
  },
  {
    id: "gymmane_dumbbell_only",
    category: "classic",
    name: "Dumbbell Only (Solo Mancuernas)",
    badge: "🎯 Mancuernas · 3-4 días/sem",
    level: "Todos los niveles",
    durationMin: 35,
    focus: "Programa diseñado para entrenar con un solo par de mancuernas en casa o en un rincón del gimnasio.",
    glp1Tip: "Si no tienes mancuernas más pesadas, aumenta las repeticiones o baja más lento (fase excéntrica).",
    days: [
      {
        dayName: "Sesión Completa con Mancuernas",
        exercises: [
          { id: "yn8yg1r", sets: 3, reps: "12", restSec: 60, note: "Sentadilla goblet sosteniendo una mancuerna al pecho" },
          { id: "SpYC0Kp", sets: 3, reps: "10-12", restSec: 60, note: "Press con mancuernas en banco o suelo" },
          { id: "BJ0Hz5L", sets: 3, reps: "10 por lado", restSec: 60, note: "Remo con mancuerna apoyando rodilla" },
          { id: "DsgkuIt", sets: 3, reps: "12-15", restSec: 45, note: "Elevaciones laterales de hombros" },
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
      injectionDayOfWeek: 5, // Viernes
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
        notes: "Aplicada sin dolor, excelente hidratación previa.",
      },
    ],
    weights: [
      { id: "w-1", date: offsetDate(today, -14), weight: 185, waistCm: 92, hipCm: 108, note: "Inicio de tratamiento" },
      { id: "w-2", date: offsetDate(today, -7), weight: 181.2, waistCm: 90, hipCm: 106.5, note: "Semana 1 completada" },
      { id: "w-3", date: today, weight: 178, waistCm: 88.5, hipCm: 105, note: "Bajando firme y cuidando proteína diaria" },
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
            name: "Huevos revueltos tiernos o poche",
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
    prRecords: {}, // { [exerciseId]: { maxWeight: number, maxVolume: number, date: string } }
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
  // If unit is lb, convert to kg for BMI: 1 lb = 0.453592 kg
  const weightKg = profile.unit === "lb" ? latestWeight * 0.453592 : latestWeight;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 22.0;

  let bmiCategory = "Normal";
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
  let badge = "🟢 Estado Óptimo · Al Día";
  let title = "Metabolismo y Dosis en Armonía";
  let caption =
    "Vas cumpliendo con tu proteína diaria, tu hidratación y tu entrenamiento de fuerza en GymMane.";

  if (hasSevereSymptom || (daysSinceInjection !== null && daysSinceInjection > 8)) {
    color = "red";
    badge = hasSevereSymptom
      ? "🔴 Cuidado Digestivo Hoy"
      : "🔴 Dosis Semanal Pendiente";
    title = hasSevereSymptom
      ? "Día de Recuperación y Alimentos Suaves"
      : "Registro de Aplicación Semanal Pendiente";
    caption = hasSevereSymptom
      ? "Se han reportado síntomas de intensidad fuerte. Prioriza sorbos fríos de agua con electrolitos y caldos claros."
      : "Han transcurrido más de 7 días desde tu última inyección registrada.";
  } else if (hasModerateSymptom || (proteinPct < 45 && waterPct < 45)) {
    color = "yellow";
    badge = "🟡 Atención en Proteína e Hidratación";
    title = "Prioriza Aminoácidos y Líquidos";
    caption =
      "Con medicación GLP-1 la sed y el apetito disminuyen: asegura primero tu meta de proteína para proteger tus músculos.";
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
