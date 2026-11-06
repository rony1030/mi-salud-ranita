import { EXERCISES } from "./exercise-catalog.mjs";

export const STORAGE_KEY = "mi-salud-ranita:v1";

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
      "Actúa sobre dos receptores (GIP y GLP-1), reduciendo el apetito y haciendo más lento el vaciamiento del estómago.",
  },
  {
    id: "ozempic",
    name: "Ozempic (Semaglutida)",
    brand: "Ozempic / Wegovy",
    activeIngredient: "Semaglutida (GLP-1)",
    frequencyDays: 7,
    doses: ["0.25 mg", "0.5 mg", "1.0 mg", "1.7 mg", "2.0 mg", "2.4 mg"],
    summary:
      "Agonista GLP-1 semanal que prolonga la saciedad, regula picos de glucosa y disminuye los antojos.",
  },
  {
    id: "natural",
    name: "Solo Dieta y Ejercicio (Sin inyección)",
    brand: "Plan Natural",
    activeIngredient: "Nutrición alta en proteína + Fuerza",
    frequencyDays: 7,
    doses: ["Control semanal"],
    summary:
      "Seguimiento semanal de peso, medidas, proteína y entrenamiento sin medicación.",
  },
];

export const INJECTION_SITES = [
  {
    id: "abdomen_izq",
    label: "Abdomen Izquierdo",
    short: "Abdomen Izq.",
    zone: "Abdomen",
    tip: "Aplica al menos a 5 cm (2 dedos) de distancia del ombligo.",
    coords: { x: 62, y: 48 },
  },
  {
    id: "abdomen_der",
    label: "Abdomen Derecho",
    short: "Abdomen Der.",
    zone: "Abdomen",
    tip: "Alterna de lado cada semana y evita zonas con estrías o cicatrices.",
    coords: { x: 38, y: 48 },
  },
  {
    id: "muslo_izq",
    label: "Muslo Frontal Izquierdo",
    short: "Muslo Izq.",
    zone: "Muslo",
    tip: "Tercio medio frontal del muslo, sentado/a con la pierna relajada. Muchos usuarios reportan menos náuseas aquí.",
    coords: { x: 60, y: 68 },
  },
  {
    id: "muslo_der",
    label: "Muslo Frontal Derecho",
    short: "Muslo Der.",
    zone: "Muslo",
    tip: "Tercio medio frontal del muslo. Excelente opción para rotar cuando el abdomen está sensible.",
    coords: { x: 40, y: 68 },
  },
  {
    id: "brazo_izq",
    label: "Brazo Superior Izquierdo",
    short: "Brazo Izq.",
    zone: "Brazo",
    tip: "Parte posterior carnosa del brazo superior (entre hombro y codo).",
    coords: { x: 76, y: 34 },
  },
  {
    id: "brazo_der",
    label: "Brazo Superior Derecho",
    short: "Brazo Der.",
    zone: "Brazo",
    tip: "Parte posterior del brazo superior. Ideal con ayuda de tu pareja.",
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
    name: "Náuseas o estómago revuelto",
    icon: "🤢",
    category: "Digestivo",
    whatToEat: [
      "Té de jengibre natural o agua fría con limón a sorbos pequeños",
      "Caldo claro de pollo desgrasado con pechuga desmenuzada",
      "Galletas saladas integrales (2–3 unidades) o pan tostado seco",
      "Puré de manzana sin azúcar o gelatina ligera",
      "Comidas tibias o frías (los olores calientes fuertes aumentan la náusea)",
    ],
    whatToAvoid: [
      "Frituras, salsas con crema, mantequilla o carnes grasosas",
      "Acostarte inmediatamente después de comer (espera mínimo 2 horas)",
      "Beber vasos grandes de agua de golpe mientras comes",
    ],
    whyItHappens:
      "Mounjaro y Ozempic hacen que el estómago se vacíe más despacio. Si entra grasa o mucho volumen junto, el estómago se resiente.",
  },
  {
    id: "reflujo",
    name: "Reflujo, acidez o ardor",
    icon: "🔥",
    category: "Digestivo",
    whatToEat: [
      "Avena suave cocida en agua o leche deslactosada/almendra",
      "Papaya (lechosa) picada en porción pequeña",
      "Pechuga de pollo o pescado blanco a la plancha sin condimentos ácidos",
      "Cenar al menos 3 horas antes de dormir y muy ligero",
    ],
    whatToAvoid: [
      "Café en ayunas, chocolate, salsa de tomate, cítricos fuertes y picante",
      "Bebidas con gas (refrescos, agua carbonatada fuerte)",
      "Cenas pesadas después de las 7:30 PM",
    ],
    whyItHappens:
      "Al permanecer la comida más tiempo en el estómago, el ácido puede subir si cenas tarde o comes alimentos irritantes.",
  },
  {
    id: "eructos",
    name: "Eructos con sabor fuerte (Sulfur burps) o gases",
    icon: "🫧",
    category: "Digestivo",
    whatToEat: [
      "Té de menta o manzanilla tibia después de comer",
      "Pescado blanco, pavo o pechuga de pollo a la plancha",
      "Arroz blanco suave en pequeña porción y pepino sin cáscara",
      "Masticar muy despacio cada bocado",
    ],
    whatToAvoid: [
      "Carnes rojas pesadas de noche (tardan mucho en digerirse)",
      "Brócoli, coliflor, repollo crudo, cebolla cruda y exceso de ajo por 48h",
      "Alimentos fritos o muy azucarados que fermentan en el estómago",
    ],
    whyItHappens:
      "Ocurren cuando alimentos ricos en azufre o difíciles de digerir permanecen muchas horas en el estómago por el vaciamiento lento.",
  },
  {
    id: "estrenimiento",
    name: "Estreñimiento o tránsito lento",
    icon: "🧱",
    category: "Digestivo",
    whatToEat: [
      "Lechosa (papaya), kiwi, ciruelas pasas o semillas de chía hidratadas (1 cdita en agua)",
      "Avena integral suave y vegetales cocidos con un hilo de aceite de oliva",
      "Subir hidratación a 8–10 vasos de agua + electrolitos sin azúcar",
      "Caminar 15–20 minutos después de comer para activar el intestino",
    ],
    whatToAvoid: [
      "Pasar el día casi sin beber agua porque 'no sientes sed'",
      "Harinas blancas refinadas en exceso y queso amarillo pesado",
    ],
    whyItHappens:
      "El tránsito intestinal se vuelve más lento y muchas personas beben menos agua porque la medicación también reduce la sensación de sed.",
  },
  {
    id: "llenura",
    name: "Llenura extrema con pocos bocados",
    icon: "🎈",
    category: "Saciedad",
    whatToEat: [
      "Divide tu comida en 4–5 mini comidas pequeñas al día en vez de 2 platos grandes",
      "Empieza SIEMPRE por los 3–4 bocados de proteína antes que el arroz o víveres",
      "Batido de proteína ligero (whey isolate o vegetal) si no te entra comida sólida",
    ],
    whatToAvoid: [
      "Forzarte a terminar el plato cuando ya sentiste la primera señal de saciedad",
      "Beber líquidos 20 minutos antes o durante la comida",
    ],
    whyItHappens:
      "Es el efecto principal del medicamento en el centro de saciedad del cerebro y el estómago. Escucha a tu cuerpo y prioriza calidad nutricional.",
  },
  {
    id: "fatiga",
    name: "Fatiga, cansancio o poca energía",
    icon: "🔋",
    category: "Energía",
    whatToEat: [
      "Agua con electrolitos (sodio, potasio, magnesio) sin azúcar por la mañana",
      "2 huevos revueltos suaves o yogur griego con un poquito de avena/fruta",
      "Caldo de pollo tibio con sal marina si sientes debilidad",
    ],
    whatToAvoid: [
      "Pasar más de 6 horas despierta sin probar ni siquiera proteína líquida",
      "Entrenamientos extremos en ayunas los días 1 y 2 después de la inyección",
    ],
    whyItHappens:
      "Al comer mucho menos de lo habitual y perder líquidos al inicio, bajan las reservas de glucógeno y electrolitos.",
  },
  {
    id: "mareo",
    name: "Mareo leve al levantarte",
    icon: "💫",
    category: "Energía",
    whatToEat: [
      "Hidratación con electrolitos y una pizca de sal si tu presión suele ser baja",
      "Pequeña merienda con proteína y carbohidrato noble (ej. medio guineo con yogur griego)",
    ],
    whatToAvoid: [
      "Ejercicios donde subas y bajes la cabeza bruscamente (como burpees) hoy",
      "Levantarte rápido de la cama o de las máquinas del gimnasio",
    ],
    whyItHappens:
      "Suele deberse a deshidratación leve o baja ingesta calórica/electrolitos. Si tienes presión alta medicada, avisa a tu médico por si requiere ajustar dosis.",
  },
  {
    id: "diarrea",
    name: "Diarrea o estómago suelto",
    icon: "💧",
    category: "Digestivo",
    whatToEat: [
      "Suero oral o electrolitos sin azúcar, caldo de pollo desgrasado",
      "Arroz blanco suave, pechuga hervida/plancha, guineo verde hervido o manzana cocida",
    ],
    whatToAvoid: [
      "Lácteos enteros, grasas, picante, café y endulzantes artificiales tipo sorbitol/maltitol",
    ],
    whyItHappens:
      "A veces ocurre tras comer algo muy grasoso o al subir de dosis semanal.",
  },
];

export const FOOD_GUIDE = [
  // GREEN: Priorizar siempre (Proteína alta, fácil digestión, protege masa muscular)
  {
    id: "pechuga_plancha",
    name: "Pechuga de pollo a la plancha o desmenuzada",
    category: "green",
    group: "Proteína Magra",
    icon: "🍗",
    portion: "120 g (1 palma de la mano)",
    kcal: 195,
    protein: 36,
    carbs: 0,
    fat: 4,
    fiber: 0,
    reason:
      "Proteína reina para no perder músculo ni glúteos mientras bajas de peso. Se digiere suave si se hace a la plancha o al horno sin piel.",
    bestFor: "Almuerzo o cena · Cómelos de primero en el plato",
  },
  {
    id: "pescado_blanco",
    name: "Filete de pescado blanco o salmón al horno",
    category: "green",
    group: "Proteína Magra",
    icon: "🐟",
    portion: "130 g (1 filete mediano)",
    kcal: 180,
    protein: 30,
    carbs: 0,
    fat: 6,
    fiber: 0,
    reason:
      "Es la proteína más fácil de digerir en los días 1 a 3 después de la inyección. Cero pesadez estomacal.",
    bestFor: "Ideal para cenar o días con poco apetito",
  },
  {
    id: "huevos_suaves",
    name: "Huevos revueltos suaves o hervidos",
    category: "green",
    group: "Proteína Magra",
    icon: "🥚",
    portion: "2 huevos (o 1 huevo + 2 claras)",
    kcal: 155,
    protein: 14,
    carbs: 1,
    fat: 10,
    fiber: 0,
    reason:
      "Nutrición completa, colina y biotina (ayuda al cabello y uñas) en poco volumen. Hazlos con mínimo spray de aceite.",
    bestFor: "Desayuno o cena ligera",
  },
  {
    id: "yogur_griego",
    name: "Yogur griego natural sin azúcar (0% o 2%)",
    category: "green",
    group: "Proteína y Probióticos",
    icon: "🥣",
    portion: "1 taza (170 g)",
    kcal: 110,
    protein: 17,
    carbs: 6,
    fat: 2,
    fiber: 0,
    reason:
      "Fresco, entra súper bien cuando tienes náuseas o no quieres comida caliente, y aporta probióticos para la digestión.",
    bestFor: "Desayuno, merienda o cena suave",
  },
  {
    id: "batido_proteina",
    name: "Batido de proteína (Whey Isolate o Vegetal)",
    category: "green",
    group: "Proteína Rápida",
    icon: "🥤",
    portion: "1 scoop (30 g) en agua o leche de almendra",
    kcal: 125,
    protein: 25,
    carbs: 2,
    fat: 1,
    fiber: 0,
    reason:
      "Salvavidas en Mounjaro/Ozempic cuando tienes cero hambre pero necesitas proteger tu masa muscular y evitar flacidez.",
    bestFor: "Días post-inyección o post-entrenamiento",
  },
  {
    id: "caldo_pollo",
    name: "Sopa o caldo claro de pollo con vegetales",
    category: "green",
    group: "Hidratación y Alivio",
    icon: "🍲",
    portion: "1 tazón (300 ml) con pollo desmenuzado",
    kcal: 145,
    protein: 19,
    carbs: 8,
    fat: 4,
    fiber: 2,
    reason:
      "Repone agua, sodio y proteína suave. Es el plato #1 recomendado cuando el estómago está sensible.",
    bestFor: "Día de la inyección y día siguiente",
  },
  {
    id: "lechosa_papaya",
    name: "Lechosa (Papaya) fresca picada",
    category: "green",
    group: "Digestión y Fibra",
    icon: "🍈",
    portion: "1 taza en cuadritos",
    kcal: 62,
    protein: 1,
    carbs: 15,
    fat: 0,
    fiber: 3,
    reason:
      "Contiene papaína (enzima digestiva natural) que alivia la acidez y ayuda contra el estreñimiento típico de GLP-1.",
    bestFor: "Mañana o merienda digestiva",
  },
  {
    id: "avena_chia",
    name: "Avena suave con 1 cdita de chía hidratada",
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
      "Aporta fibra soluble que protege la mucosa gástrica y mantiene el tránsito intestinal activo sin irritar.",
    bestFor: "Desayuno (mejor aún si le mezclas proteína)",
  },
  {
    id: "atun_agua",
    name: "Atún al natural (en agua) con pepino",
    category: "green",
    group: "Proteína Magra",
    icon: "🥫",
    portion: "1 lata escurrida (100 g)",
    kcal: 120,
    protein: 26,
    carbs: 1,
    fat: 1,
    fiber: 1,
    reason:
      "Altísimo en proteína limpia en muy poca cantidad de comida, sin grasas que den reflujo.",
    bestFor: "Almuerzo rápido o cena ligera",
  },
  {
    id: "queso_cottage",
    name: "Queso Cottage o Ricotta bajo en grasa",
    category: "green",
    group: "Proteína Suave",
    icon: "🧀",
    portion: "1/2 taza (110 g)",
    kcal: 98,
    protein: 13,
    carbs: 4,
    fat: 3,
    fiber: 0,
    reason:
      "Textura suave, alta en caseína de absorción lenta y muy fácil para el estómago.",
    bestFor: "Desayuno con tostada integral o merienda",
  },
  {
    id: "vegetales_vapor",
    name: "Vegetales cocidos (Auyama, tayota, espinaca, calabacín)",
    category: "green",
    group: "Vegetales Suaves",
    icon: "🥒",
    portion: "1 taza cocida",
    kcal: 65,
    protein: 3,
    carbs: 12,
    fat: 1,
    fiber: 4,
    reason:
      "Cocidos al vapor son mucho más fáciles de digerir que las ensaladas crudas gigantes y aportan agua, potasio y fibra.",
    bestFor: "Acompañante de tu proteína en almuerzo y cena",
  },

  // YELLOW: Con Moderación (Comer DESPUÉS de la proteína, porciones pequeñas)
  {
    id: "platano_hervido",
    name: "Plátano verde o guineíto hervido (Mangú sin grasa)",
    category: "yellow",
    group: "Carbohidrato Criollo",
    icon: "🍌",
    portion: "1/2 unidad hervida (sin salami ni aceite frito)",
    kcal: 115,
    protein: 1,
    carbs: 28,
    fat: 0,
    fiber: 2,
    reason:
      "Hervido cae bien y da energía para entrenar, pero cómelo en media porción y SIEMPRE después de comerte los huevos o el pollo.",
    bestFor: "Desayuno o almuerzo (medio plátano hervido)",
  },
  {
    id: "arroz_blanco",
    name: "Arroz blanco o integral (sin concón grasoso)",
    category: "yellow",
    group: "Carbohidrato",
    icon: "🍚",
    portion: "1/3 a 1/2 taza cocida (puño pequeño)",
    kcal: 105,
    protein: 2,
    carbs: 22,
    fat: 1,
    fiber: 1,
    reason:
      "Si te comes el arroz primero te llenarás rápido y no te cabrá la proteína. Sirve solo 3–4 cucharadas como acompañante final.",
    bestFor: "Almuerzo (después de la carne y vegetales)",
  },
  {
    id: "habichuelas_suaves",
    name: "Habichuelas guisadas suaves (sin grasa pesada)",
    category: "yellow",
    group: "Legumbres",
    icon: "🫘",
    portion: "1/3 taza (más caldo y grano blando)",
    kcal: 95,
    protein: 6,
    carbs: 16,
    fat: 1,
    fiber: 5,
    reason:
      "Tienen buena fibra y proteína vegetal, pero en los primeros 2 días tras la inyección pueden dar gases o llenura si comes muchas.",
    bestFor: "Días 4 a 7 de la semana en porción pequeña",
  },
  {
    id: "aguacate",
    name: "Aguacate fresco",
    category: "yellow",
    group: "Grasa Saludable",
    icon: "🥑",
    portion: "1/4 de aguacate (2 lonjas)",
    kcal: 80,
    protein: 1,
    carbs: 4,
    fat: 7,
    fiber: 3,
    reason:
      "Es grasa buena y saludable, pero recuerda que toda grasa retrasa aún más el vaciamiento del estómago. 2 lonjas es la medida ideal.",
    bestFor: "Almuerzo junto con pechuga o pescado",
  },
  {
    id: "batata_horno",
    name: "Batata (Camote) o Yautía hervida / al horno",
    category: "yellow",
    group: "Víveres Nobles",
    icon: "🍠",
    portion: "100 g (media taza)",
    kcal: 90,
    protein: 2,
    carbs: 20,
    fat: 0,
    fiber: 3,
    reason:
      "Excelente fuente de energía limpia y fibra para antes de hacer ejercicio, cuidando que no desplace tu porción de proteína.",
    bestFor: "Días de entrenamiento de piernas o glúteos",
  },
  {
    id: "cafe_leche",
    name: "Café con leche deslactosada o almendra",
    category: "yellow",
    group: "Bebidas",
    icon: "☕",
    portion: "1 taza pequeña (después de desayunar)",
    kcal: 45,
    protein: 3,
    carbs: 4,
    fat: 1,
    fiber: 0,
    reason:
      "En ayunas puede disparar acidez o náuseas en Mounjaro/Ozempic. Tómalo suave y después de haber comido algo de proteína.",
    bestFor: "Después del desayuno (evitar si hay reflujo)",
  },

  // RED: Evitar o Limitar (Disparan náuseas, reflujo, vómitos o "sulfur burps")
  {
    id: "frituras_pica_pollo",
    name: "Frituras (Pica pollo, chicharrón, tostones fritos, empanadas)",
    category: "red",
    group: "Grasa Pesada / Fritura",
    icon: "🍟",
    portion: "Evitar especialmente días 1–4",
    kcal: 480,
    protein: 18,
    carbs: 38,
    fat: 29,
    fiber: 2,
    reason:
      "El aceite frito se queda estancado horas en el estómago con Mounjaro/Ozempic, causando náuseas fuertes, reflujo, vómitos o diarrea.",
    bestFor: "Sustituir por Airfryer o al horno sin aceite",
  },
  {
    id: "dulces_azucar",
    name: "Postres, bizcocho, helados y dulces azucarados",
    category: "red",
    group: "Azúcares Simples",
    icon: "🧁",
    portion: "Evitar",
    kcal: 360,
    protein: 3,
    carbs: 54,
    fat: 15,
    fiber: 0,
    reason:
      "Pueden provocar síndrome de vaciamiento o bajón brusco de azúcar con mareos, sudor frío, náuseas y frenan la pérdida de grasa.",
    bestFor: "Cambiar por yogur griego con canela o gelatina sin azúcar",
  },
  {
    id: "refrescos_gas",
    name: "Refrescos con gas, jugos azucarados y alcohol",
    category: "red",
    group: "Bebidas Irritantes",
    icon: "🥤",
    portion: "Evitar",
    kcal: 180,
    protein: 0,
    carbs: 42,
    fat: 0,
    fiber: 0,
    reason:
      "El gas infla el estómago que ya está lento, causando dolor abdominal, eructos fuertes y reflujo; el alcohol irrita el páncreas y deshidrata.",
    bestFor: "Cambiar por agua fría con limón, pepino o electrolitos",
  },
  {
    id: "carnes_grasosas_noche",
    name: "Carnes muy rojas/grasosas, salami frito o longaniza de noche",
    category: "red",
    group: "Grasa Saturada",
    icon: "🥩",
    portion: "Evitar en la cena",
    kcal: 410,
    protein: 22,
    carbs: 4,
    fat: 34,
    fiber: 0,
    reason:
      "Cenar carne grasosa o embutidos fritos con GLP-1 hace que amanezcas con pesadez, acidez y 'eructos de azufre' al día siguiente.",
    bestFor: "De noche prefiere pollo, pescado blanco, atún o huevos",
  },
  {
    id: "salsas_cremosas",
    name: "Pastas con salsas blancas cremosas, pizza grasosa o comida muy picante",
    category: "red",
    group: "Ultraprocesados Pesados",
    icon: "🍕",
    portion: "Evitar",
    kcal: 520,
    protein: 14,
    carbs: 56,
    fat: 26,
    fiber: 2,
    reason:
      "La combinación de harina refinada + mucha grasa láctea + condimentos fuertes es el disparador #1 de malestar gástrico severo.",
    bestFor: "Optar por preparaciones caseras sencillas",
  },
];

export const MEAL_PLANS_BY_PHASE = [
  {
    id: "shot_day",
    title: "Día 1 · Día de la Inyección (Shot Day)",
    badge: "💉 Preparación Suave",
    description:
      "Lo que comes 12 horas antes y después de inyectarte define cómo te sentirás en la semana. Hidrátate bien y evita comidas grasosas.",
    meals: [
      {
        slot: "Antes de la inyección",
        idea: "1 vaso grande de agua con electrolitos + comida rica en proteína limpia (ej. 2 huevos revueltos suaves o pechuga a la plancha) 1–2 horas antes.",
        macros: "25 g proteína · Baja en grasa",
      },
      {
        slot: "Almuerzo",
        idea: "Pechuga de pollo a la plancha en trocitos + vegetales al vapor (auyama/calabacín) + 3 cucharadas de arroz blanco.",
        macros: "35 g proteína · Digestión fácil",
      },
      {
        slot: "Cena ligera (temprano)",
        idea: "Caldo claro de pollo con pechuga desmenuzada o filete de pescado blanco al horno con pepino.",
        macros: "28 g proteína · Cero reflujo",
      },
    ],
  },
  {
    id: "peak_days",
    title: "Días 2 y 3 · Pico de Efecto (Poca Hambre o Náuseas)",
    badge: "🍵 Porciones Mini",
    description:
      "Son los días donde la medicación está más fuerte. No te fuerces a platos grandes: haz 4 comidas chiquitas priorizando proteína y líquidos.",
    meals: [
      {
        slot: "Mañana",
        idea: "Yogur griego natural frío con canela o 1/2 taza de lechosa + té de jengibre a sorbitos.",
        macros: "18 g proteína · Fresco y anti-náusea",
      },
      {
        slot: "Mediodía",
        idea: "Atún en agua o pollo desmenuzado suave con puré de batata o auyama.",
        macros: "28 g proteína · Textura blanda",
      },
      {
        slot: "Tarde (Salvavidas muscular)",
        idea: "1 batido de proteína (Whey Isolate) en agua fría o leche de almendra.",
        macros: "25 g proteína · Sin llenura pesada",
      },
      {
        slot: "Noche",
        idea: "Sopa de pollo desgrasada o 2 claras + 1 huevo revuelto suave.",
        macros: "20 g proteína · Ligero para dormir",
      },
    ],
  },
  {
    id: "active_days",
    title: "Días 4 y 5 · Fase Estable (Quema de Grasa y Fuerza)",
    badge: "💪 Día de Entrenar",
    description:
      "Tu estómago ya está cómodo y tienes buena energía. Aprovecha para entrenar glúteos, piernas y fuerza cumpliendo tu meta de proteína.",
    meals: [
      {
        slot: "Desayuno",
        idea: "2 huevos revueltos con espinaca + 1/2 plátano verde hervido o avena con chía.",
        macros: "20 g proteína · Energía sostenida",
      },
      {
        slot: "Almuerzo Completo GLP-1",
        idea: "Regla del plato: 150 g de pollo o pescado primero + ensalada/vegetales + 1/3 taza de arroz y un poquito de habichuelas suaves.",
        macros: "38 g proteína · Rico en hierro y fibra",
      },
      {
        slot: "Merienda Post-Ejercicio",
        idea: "Batido de proteína o queso cottage / yogur griego.",
        macros: "24 g proteína · Recuperación muscular",
      },
      {
        slot: "Cena",
        idea: "Filete de salmón o pechuga al airfryer con vegetales salteados sin grasa.",
        macros: "30 g proteína · Saciante",
      },
    ],
  },
  {
    id: "appetite_return",
    title: "Días 6 y 7 · Retorno de Apetito (Fin de Semana)",
    badge: "🥗 Alta Saciedad",
    description:
      "Es completamente normal sentir un poco más de hambre los últimos 2 días antes de tu siguiente dosis. Usa volumen vegetal y fibra para saciarte sin ansiedad.",
    meals: [
      {
        slot: "Desayuno Saciante",
        idea: "Omelette de 2 huevos con vegetales + avena con semillas de chía hidratadas.",
        macros: "22 g proteína · 6 g fibra",
      },
      {
        slot: "Almuerzo de Volumen",
        idea: "Pechuga o pescado a la plancha + bowl grande de vegetales frescos/cocidos + 2 lonjas de aguacate + batata al horno.",
        macros: "36 g proteína · 8 g fibra",
      },
      {
        slot: "Merienda Anti-Antojos",
        idea: "Yogur griego con fresas/lechosa o gelatina sin azúcar + bastones de pepino.",
        macros: "17 g proteína · Calma ansiedad dulce",
      },
      {
        slot: "Cena",
        idea: "Pollo desmenuzado o atún sobre cama de vegetales tibios.",
        macros: "28 g proteína · Bajo en calorías",
      },
    ],
  },
];

export const GLP1_ROUTINES = [
  {
    id: "glp1_tonificacion_casa",
    name: "Fuerza en Casa · Cero Flacidez (Especial GLP-1)",
    badge: "🏠 En Casa · 3 días/sem",
    level: "Principiante / Intermedio",
    durationMin: 28,
    focus: "Evitar pérdida de masa muscular y flacidez en brazos, piernas y abdomen mientras bajas de peso con Mounjaro u Ozempic.",
    glp1Tip:
      "Hacer ejercicios de fuerza 3 veces por semana le dice a tu cuerpo que queme la grasa acumulada y NO tu músculo.",
    days: [
      {
        dayName: "Día A · Glúteos, Piernas y Core",
        exercises: [
          { id: "6YUfHPL", sets: 3, reps: "12-15", restSec: 60, note: "Baja controlado cuidando las rodillas" },
          { id: "yn8yg1r", sets: 3, reps: "10-12", restSec: 60, note: "Puedes usar una mancuerna o botella con agua" },
          { id: "u27Kcdz", sets: 3, reps: "15", restSec: 60, note: "Aprieta el glúteo 2 segundos arriba" },
          { id: "RRWFUcw", sets: 3, reps: "10 por pierna", restSec: 60, note: "Paso firme para tonificar muslo y glúteo" },
          { id: "BbfB8Gb", sets: 3, reps: "15", restSec: 45, note: "Activa el abdomen exhalando al subir" },
        ],
      },
      {
        dayName: "Día B · Brazos Firmes, Espalda y Postura",
        exercises: [
          { id: "I4hDWkc", sets: 3, reps: "8-12", restSec: 60, note: "Puedes apoyar las rodillas en el piso" },
          { id: "BJ0Hz5L", sets: 3, reps: "12 por brazo", restSec: 60, note: "Espalda recta, reafirma dorsal y brazo" },
          { id: "DsgkuIt", sets: 3, reps: "12-15", restSec: 45, note: "Da forma bonita a los hombros" },
          { id: "PAgTVaK", sets: 3, reps: "10-12", restSec: 60, note: "Clave contra la flacidez debajo del brazo (tríceps)" },
        ],
      },
    ],
  },
  {
    id: "glp1_gluteos_piernas",
    name: "Especial Glúteos y Piernas Firmes (Anti-Pérdida Muscular)",
    badge: "🍑 Glúteos · Prioridad #1",
    level: "Todos los niveles",
    durationMin: 32,
    focus: "Proteger y levantar el glúteo (el músculo que más rápido suele perder volumen al bajar rápido de peso).",
    glp1Tip:
      "Toma tu porción de proteína dentro de las 2 horas posteriores a esta rutina para nutrir el glúteo.",
    days: [
      {
        dayName: "Sesión Enfoque Glúteo Redondo y Pierna",
        exercises: [
          { id: "qKBpF7I", sets: 4, reps: "12", restSec: 75, note: "Empuje de cadera enfocando 100% en glúteos" },
          { id: "qx4fgX7", sets: 3, reps: "10 por pierna", restSec: 75, note: "Inclinación leve hacia adelante para activar glúteo" },
          { id: "nUwVh7b", sets: 3, reps: "12", restSec: 60, note: "Estira isquios y levanta la base del glúteo" },
          { id: "c8f5cSY", sets: 3, reps: "15 por lado", restSec: 45, note: "Trabaja el glúteo medio (cadera lateral)" },
          { id: "8ozhUIZ", sets: 3, reps: "15-20", restSec: 45, note: "Mejora la circulación de las piernas" },
        ],
      },
    ],
  },
  {
    id: "glp1_post_inyeccion_suave",
    name: "Día Suave Post-Inyección (Sin Mareos ni Náuseas)",
    badge: "🌿 Días 1–2 · Suave",
    level: "Principiante / Suave",
    durationMin: 20,
    focus: "Activar el metabolismo y aliviar gases/estreñimiento sin movimientos bruscos ni cabeza abajo que den reflujo o mareo.",
    glp1Tip:
      "Cero saltos y cero cambios bruscos de posición. Toma sorbos pequeños de agua entre ejercicios.",
    days: [
      {
        dayName: "Circuito Suave de Pie y Sentada",
        exercises: [
          { id: "6YUfHPL", sets: 2, reps: "10 suaves", restSec: 60, note: "Sentadilla a silla o media altura sin prisa" },
          { id: "DsgkuIt", sets: 2, reps: "12", restSec: 45, note: "De pie o sentada, respirando profundo" },
          { id: "3d7wHyd", sets: 2, reps: "10", restSec: 60, note: "Sentada con espalda apoyada para evitar mareos" },
          { id: "c8f5cSY", sets: 2, reps: "12 por lado", restSec: 45, note: "Movimiento controlado y suave" },
        ],
      },
    ],
  },
  {
    id: "gymmane_full_body",
    name: "Gimnasio Completo · Preservación Muscular (GymMane)",
    badge: "🏋️‍♀️ Gimnasio · Completo",
    level: "Intermedio",
    durationMin: 40,
    focus: "Rutina clásica de cuerpo completo inspirada en GymMane para conservar fuerza y acelerar el metabolismo basal.",
    glp1Tip:
      "Descansa de 60 a 90 segundos entre series; cuando el reloj suene estarás lista para la siguiente serie.",
    days: [
      {
        dayName: "Tren Inferior y Espalda",
        exercises: [
          { id: "7zdxRTl", sets: 3, reps: "10-12", restSec: 75, note: "Prensa de piernas segura para la espalda" },
          { id: "C5jncD2", sets: 3, reps: "12", restSec: 60, note: "Curl femoral controlado" },
          { id: "RVwzP10", sets: 3, reps: "10-12", restSec: 60, note: "Jalón al pecho para estilizar espalda" },
          { id: "fUBheHs", sets: 3, reps: "12", restSec: 60, note: "Remo sentado juntando escápulas" },
        ],
      },
      {
        dayName: "Tren Superior y Core",
        exercises: [
          { id: "SpYC0Kp", sets: 3, reps: "10-12", restSec: 60, note: "Press con mancuernas" },
          { id: "67n3r98", sets: 3, reps: "12", restSec: 60, note: "Press de hombros en máquina" },
          { id: "goJ6ezq", sets: 3, reps: "12-15", restSec: 45, note: "Elevación lateral en polea" },
          { id: "LNE3wfo", sets: 2, reps: "30 seg", restSec: 30, note: "Estiramiento final de descarga" },
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
    },
    injections: [
      {
        id: "inj-demo-1",
        date: today,
        medicationId: "mounjaro",
        dose: "2.5 mg",
        site: "muslo_izq",
        weight: 178,
        notes: "Aplicada sin dolor, buena hidratación previa.",
      },
    ],
    weights: [
      { id: "w-1", date: offsetDate(today, -14), weight: 185, waistCm: 92, hipCm: 108, note: "Inicio del camino" },
      { id: "w-2", date: offsetDate(today, -7), weight: 181.2, waistCm: 90, hipCm: 106.5, note: "Semana 1 completada" },
      { id: "w-3", date: today, weight: 178, waistCm: 88.5, hipCm: 105, note: "Bajando firme y cuidando proteína" },
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
            name: "Huevos revueltos suaves o hervidos",
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
  const proteinPct = Math.min(100, Math.round((totals.protein / proteinGoal) * 100));
  const waterPct = Math.min(100, Math.round((waterGlasses / waterGoal) * 100));

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
  else if (daysSinceInjection >= 3 && daysSinceInjection <= 4)
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

  // Weekly workouts
  const weekAgo = offsetDate(currentDate, -6);
  const weeklyWorkouts = (state?.workouts || []).filter(
    (w) => w.date >= weekAgo && w.date <= currentDate,
  );

  // Calibrate Semaphore (Green / Yellow / Red) like Mi Finanza
  let color = "green";
  let badge = "🟢 En verde · Bienestar al día";
  let title = "Tu cuerpo y tu dosis, en armonía";
  let caption =
    "Vas cuidando tu proteína, tu hidratación y tu seguimiento semanal con la Ranita.";

  if (hasSevereSymptom || (daysSinceInjection !== null && daysSinceInjection > 8)) {
    color = "red";
    badge = hasSevereSymptom
      ? "🔴 Cuidado digestivo hoy"
      : "🔴 Dosis semanal pendiente";
    title = hasSevereSymptom
      ? "Día de descanso y comida blanda"
      : "Revisa tu registro de dosis semanal";
    caption = hasSevereSymptom
      ? "Tienes síntomas fuertes hoy. Prioriza sorbos de agua con electrolitos, caldos suaves y consulta a tu médico si persiste."
      : "Ya pasaron más de 7 días desde tu última aplicación registrada.";
  } else if (hasModerateSymptom || (proteinPct < 45 && waterPct < 45)) {
    color = "yellow";
    badge = "🟡 Atención con proteína y agua";
    title = "Paso a paso: hidrátate y prioriza proteína";
    caption =
      "Con Mounjaro y Ozempic la sed y el hambre bajan: asegura primero tu proteína y tus vasos de agua hoy.";
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
    proteinPct,
    waterPct,
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
    weeklyWorkoutsCount: weeklyWorkouts.length,
  };
}

export function getExerciseById(id) {
  return EXERCISES.find((e) => e.id === id) || null;
}
