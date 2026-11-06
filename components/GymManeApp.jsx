"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Info,
  Layers,
  LayoutDashboard,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Sparkles,
  Syringe,
  Timer,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import BodyMap from "./BodyMap.jsx";
import ExerciseArt from "./ExerciseArt.jsx";
import { EXERCISES } from "../lib/exercise-catalog.mjs";
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  MUSCLE_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  MEDICATIONS,
  INJECTION_SITES,
  SYMPTOM_CATALOG,
  FOOD_GUIDE,
  MEAL_PLANS_BY_PHASE,
  GLP1_ROUTINES,
  todayISO,
  defaultState,
  computeWellnessOverview,
  getExerciseById,
  suggestNextInjectionSite,
  offsetDate,
} from "../lib/glp1-data.mjs";

const NAV_DESTINATIONS = [
  { id: "hoy", label: "Hoy", icon: LayoutDashboard },
  { id: "entrenar", label: "Entrenar", icon: Dumbbell },
  { id: "programas", label: "Programas", icon: Layers },
  { id: "nutricion", label: "Nutrición", icon: Utensils },
  { id: "seguimiento", label: "Progreso", icon: TrendingUp },
];

const APPEARANCE_OPTIONS = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
];

const APPEARANCE_KEY = "gymmane-appearance";

function BrandIntro({ ready = false }) {
  return (
    <div className={`brand-intro${ready ? " brand-intro-ready" : ""}`} aria-hidden={ready || undefined}>
      <div className="brand-intro-signature">
        <img src="./logo.svg" width="308" height="92" alt="GymMane" />
        <p>Fuerza a tu ritmo</p>
      </div>
    </div>
  );
}

function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

export default function GymManeApp() {
  const [state, setState] = useState(null);
  const [activeTab, setActiveTab] = useState("hoy");
  const [toast, setToast] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [appearance, setAppearance] = useState(null);
  const [routineModal, setRoutineModal] = useState(null);

  // Train Tab State
  const [trainSubView, setTrainSubView] = useState("library"); // library | live
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [activeExerciseModal, setActiveExerciseModal] = useState(null);

  // Active Live Workout State
  const [liveWorkout, setLiveWorkout] = useState(null);
  const [liveDuration, setLiveDuration] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restActive, setRestActive] = useState(false);

  // Nutrition Sub-views
  const [nutritionSubView, setNutritionSubView] = useState("journal"); // journal | trafficLight | phasePlan
  const [newFoodDesc, setNewFoodDesc] = useState("");
  const [newFoodProtein, setNewFoodProtein] = useState("");
  const [newFoodKcal, setNewFoodKcal] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("desayuno");

  // Tracking Sub-views
  const trackingTarget = useRef(null);

  useEffect(() => {
    const target = trackingTarget.current;
    trackingTarget.current = null;
    if (target) {
      const panel = document.getElementById(target);
      panel?.scrollIntoView({ block: "start" });
      panel?.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  // Injection Dialog Form
  const [doseAmount, setDoseAmount] = useState("");
  const [doseSite, setDoseSite] = useState("");

  // Symptom Form
  const [selectedSymptomId, setSelectedSymptomId] = useState(SYMPTOM_CATALOG[0].id);
  const [symptomSeverity, setSymptomSeverity] = useState(2);
  const [symptomNotes, setSymptomNotes] = useState("");

  // Weight Form
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(APPEARANCE_KEY);
      setAppearance(APPEARANCE_OPTIONS.some((option) => option.id === saved) ? saved : "system");
    } catch {
      setAppearance("system");
    }
  }, []);

  useEffect(() => {
    if (!appearance) return;
    const preference = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      const theme = appearance === "system" ? (preference.matches ? "light" : "dark") : appearance;
      document.documentElement.dataset.theme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#edf2ff" : "#0c1021");
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [appearance]);

  const selectAppearance = (option) => {
    setAppearance(option);
    try { localStorage.setItem(APPEARANCE_KEY, option); } catch {}
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Load initial state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(parsed);
      } else {
        const init = defaultState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        setState(init);
      }
    } catch {
      const init = defaultState();
      setState(init);
    }
  }, []);

  const saveState = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const currentDate = todayISO();

  // Overview computed metrics
  const overview = useMemo(() => {
    if (!state) return null;
    return computeWellnessOverview(state, currentDate);
  }, [state, currentDate]);

  // Rest Timer ticking
  useEffect(() => {
    let timer;
    if (restActive && restSeconds > 0) {
      timer = setInterval(() => {
        setRestSeconds((sec) => {
          if (sec <= 1) {
            playBeepSound();
            setRestActive(false);
            showToast("Tiempo de descanso completado");
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [restActive, restSeconds]);

  // Live Workout duration ticking
  useEffect(() => {
    let timer;
    if (liveWorkout && !liveWorkout.completedAt) {
      timer = setInterval(() => {
        setLiveDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [liveWorkout]);

  // Initial dose site suggestion
  useEffect(() => {
    if (overview && !doseSite) {
      setDoseSite(overview.nextSiteSuggestion.id);
    }
    if (state?.profile && !doseAmount) {
      setDoseAmount(state.profile.currentDose || "5.0 mg");
    }
  }, [overview, state, doseSite, doseAmount]);

  // Quick food shortcuts
  const QUICK_FOODS = [
    { name: "Pechuga a la plancha", protein: 31, kcal: 165 },
    { name: "Yogur griego natural", protein: 18, kcal: 120 },
    { name: "2 Huevos revueltos", protein: 13, kcal: 145 },
    { name: "Filete de Salmón", protein: 25, kcal: 210 },
    { name: "Medio Aguacate", protein: 2, kcal: 130 },
    { name: "Caldo de Huesos", protein: 10, kcal: 50 },
  ];

  // Actions
  const toggleMuscle = (muscleId) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscleId) ? prev.filter((m) => m !== muscleId) : [...prev, muscleId]
    );
  };

  const clearMuscles = () => setSelectedMuscles([]);

  const addWaterGlass = () => {
    saveState((prev) => {
      const nut = { ...(prev.nutritionByDate || {}) };
      const day = { ...(nut[currentDate] || { waterGlasses: 0, electrolytes: false }) };
      day.waterGlasses = Math.min(16, (day.waterGlasses || 0) + 1);
      nut[currentDate] = day;
      return { ...prev, nutritionByDate: nut };
    });
    showToast("+250 ml de agua registrados");
  };

  const toggleElectrolytes = () => {
    saveState((prev) => {
      const nut = { ...(prev.nutritionByDate || {}) };
      const day = { ...(nut[currentDate] || { waterGlasses: 0, electrolytes: false }) };
      day.electrolytes = !day.electrolytes;
      nut[currentDate] = day;
      return { ...prev, nutritionByDate: nut };
    });
  };

  const registerInjection = () => {
    if (!doseAmount.trim()) {
      showToast("Especifica la dosis");
      return;
    }
    const newEntry = {
      date: currentDate,
      medicationId: state.profile.medicationId,
      dose: doseAmount,
      site: doseSite || overview.nextSiteSuggestion.id,
      notes: "Aplicación registrada",
    };
    saveState((prev) => ({
      ...prev,
      injections: [newEntry, ...(prev.injections || [])],
    }));
    showToast(`Dosis registrada: ${doseAmount} en ${doseSite}`);
  };

  const registerSymptom = () => {
    const symDef = SYMPTOM_CATALOG.find((s) => s.id === selectedSymptomId);
    const newEntry = {
      id: "sym-" + Date.now(),
      date: currentDate,
      symptomId: selectedSymptomId,
      severity: Number(symptomSeverity),
      notes: symptomNotes.trim() || symDef?.name || "Registro",
    };
    saveState((prev) => ({
      ...prev,
      symptoms: [newEntry, ...(prev.symptoms || [])],
    }));
    setSymptomNotes("");
    showToast("Síntoma registrado");
  };

  const registerWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || isNaN(w)) {
      showToast("Introduce un peso válido");
      return;
    }
    saveState((prev) => {
      const history = [...(prev.weightHistory || [])];
      history.unshift({ date: currentDate, weight: w });
      return {
        ...prev,
        weightHistory: history,
        profile: { ...prev.profile, targetWeight: prev.profile.targetWeight },
      };
    });
    setNewWeight("");
    showToast(`Peso actualizado: ${w} ${state.profile.unit || "lb"}`);
  };

  const addFoodItem = (foodObj) => {
    const p = parseFloat(foodObj ? foodObj.protein : newFoodProtein) || 0;
    const k = parseFloat(foodObj ? foodObj.kcal : newFoodKcal) || 0;
    const desc = (foodObj ? foodObj.name : newFoodDesc).trim();

    if (!desc) {
      showToast("Ingresa la descripción del alimento");
      return;
    }

    const newItem = {
      id: "food-" + Date.now(),
      name: desc,
      protein: p,
      kcal: k,
      carbs: Math.round(k * 0.1),
      fat: Math.round(k * 0.04),
      fiber: 2,
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    saveState((prev) => {
      const nut = { ...(prev.nutritionByDate || {}) };
      const day = { ...(nut[currentDate] || {}) };
      const meals = [...(day.meals || [])];
      meals.push(newItem);
      day.meals = meals;
      nut[currentDate] = day;
      return { ...prev, nutritionByDate: nut };
    });

    if (!foodObj) {
      setNewFoodDesc("");
      setNewFoodProtein("");
      setNewFoodKcal("");
    }
    showToast(`Registrado: ${desc} (+${p}g proteína)`);
  };

  const deleteMealItem = (id) => {
    saveState((prev) => {
      const nut = { ...(prev.nutritionByDate || {}) };
      const day = { ...(nut[currentDate] || {}) };
      day.meals = (day.meals || []).filter((m) => m.id !== id);
      nut[currentDate] = day;
      return { ...prev, nutritionByDate: nut };
    });
  };

  // Start live workout from routine
  const startWorkoutFromRoutine = (routine, dayIndex = 0) => {
    const routineDay = routine.days[dayIndex] || routine.days[0];
    const sessionExercises = routineDay.exercises.map((item) => {
      const ex = getExerciseById(item.id);
      return {
        exerciseId: item.id,
        name: ex ? ex.name : item.id,
        primaryMuscle: ex ? ex.primaryMuscle : "general",
        equipment: ex ? ex.equipment : "bodyweight",
        targetSets: item.targetSets || 3,
        targetReps: item.targetReps || "10-12",
        restSec: item.restSec || 60,
        sets: Array.from({ length: item.targetSets || 3 }, (_, i) => ({
          setNum: i + 1,
          weight: 20,
          reps: 10,
          rpe: 8,
          completed: false,
        })),
      };
    });

    setLiveWorkout({
      id: "session-" + Date.now(),
      routineId: routine.id,
      routineName: routine.name,
      dayName: routineDay.dayName,
      startedAt: Date.now(),
      completedAt: null,
      exercises: sessionExercises,
    });
    setLiveDuration(0);
    setTrainSubView("live");
    setActiveTab("entrenar");
    showToast(`Iniciando: ${routineDay.dayName}`);
  };

  const toggleSetComplete = (exIdx, setIdx) => {
    if (!liveWorkout) return;
    setLiveWorkout((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const targetSet = copy.exercises[exIdx].sets[setIdx];
      targetSet.completed = !targetSet.completed;

      if (targetSet.completed) {
        playBeepSound();
        const rest = copy.exercises[exIdx].restSec || 60;
        setRestSeconds(rest);
        setRestActive(true);
      }
      return copy;
    });
  };

  const updateSetField = (exIdx, setIdx, field, val) => {
    if (!liveWorkout) return;
    setLiveWorkout((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.exercises[exIdx].sets[setIdx][field] = val;
      return copy;
    });
  };

  const finishLiveWorkout = () => {
    if (!liveWorkout) return;
    const completedSetsCount = liveWorkout.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );

    const finishedSession = {
      ...liveWorkout,
      completedAt: Date.now(),
      durationSeconds: liveDuration,
      date: currentDate,
      completedSetsCount,
    };

    saveState((prev) => ({
      ...prev,
      workouts: [finishedSession, ...(prev.workouts || [])],
    }));

    setLiveWorkout(null);
    setRestActive(false);
    showToast(`¡Entrenamiento completado! ${completedSetsCount} series registradas`);
    setActiveTab("hoy");
  };

  // Filtered exercises for catalog
  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchSearch =
        !exerciseSearch ||
        ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.primaryMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchMuscle =
        selectedMuscles.length === 0 || selectedMuscles.includes(ex.primaryMuscle);
      const matchEquip = selectedEquipment === "all" || ex.equipment === selectedEquipment;
      return matchSearch && matchMuscle && matchEquip;
    });
  }, [exerciseSearch, selectedMuscles, selectedEquipment]);

  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `GymMane-Backup-${currentDate}.json`;
    a.click();
    showToast("Copia de seguridad descargada");
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.profile) {
          saveState(imported);
          showToast("Datos restaurados correctamente");
          setSettingsOpen(false);
        } else {
          showToast("Archivo no válido");
        }
      } catch {
        showToast("Error al procesar archivo");
      }
    };
    reader.readAsText(file);
  };

  if (!state || !overview) {
    return <div className="adaptive-app-shell"><BrandIntro /></div>;
  }

  const { profile } = state;
  const currentMed = MEDICATIONS.find((m) => m.id === profile.medicationId) || MEDICATIONS[0];
  const unitLabel = profile.unit || "lb";

  // Calorie calculation for donut ring
  const remainingKcal = Math.max(0, overview.caloriesGoal - overview.totals.kcal);
  const ringPct = Math.min(100, Math.round((overview.totals.kcal / overview.caloriesGoal) * 100));
  const strokeDashoffset = 377 - (377 * ringPct) / 100;

  return (
    <div className="adaptive-app-shell">
      <BrandIntro ready />
      {/* Toast Notification */}
      <div role="status">{toast && <div className="gm-toast-pill">{toast}</div>}</div>

      {/* 1. Side Navigation Rail (Desktop / Tablet >= 768px) */}
      <nav className="m3-navigation-rail" aria-label="Navegación principal">
        <div className="rail-top-group">
          <button className="rail-brand-logo" onClick={() => setActiveTab("hoy")} aria-label="GymMane, inicio">
            <img src="./icon.svg" width="44" height="44" alt="" />
          </button>

          <div className="rail-nav-items">
            {NAV_DESTINATIONS.map((dest) => {
              const Icon = dest.icon;
              const isActive = activeTab === dest.id;
              return (
                <button
                  key={dest.id}
                  className={`rail-item-btn ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveTab(dest.id)}
                  title={dest.label}
                >
                  <div className="rail-indicator-pill">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="rail-label">{dest.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rail-bottom-group">
          <button className="m3-icon-button" onClick={() => setSettingsOpen(true)} title="Ajustes">
            <SettingsIcon size={18} />
          </button>
        </div>
      </nav>

      {/* 2. Main Content View */}
      <div className={`adaptive-main-area${restActive ? " has-rest-timer" : ""}`}>
        {/* Top App Bar */}
        <header className="m3-top-app-bar">
          <div className="top-bar-headline-group">
            <img className="top-bar-brand" src="./logo.svg" width="112" height="33" alt="GymMane" />
            <h1 className="top-bar-title">{NAV_DESTINATIONS.find((dest) => dest.id === activeTab).label}</h1>
          </div>

          <div className="top-bar-trailing-group">
            <button className="m3-icon-button" onClick={() => setSettingsOpen(true)} aria-label="Ajustes">
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        {/* Floating Rest Timer Sheet */}
        {restActive && (
          <aside className="gm-rest-sheet">
            <div className="gm-rest-info">
              <Timer size={22} color="var(--accent-orange)" />
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Descanso entre series
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900 }} className="num-tabular">
                  {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, "0")}
                </div>
              </div>
            </div>
            <div className="gm-rest-actions">
              <button
                className="gm-pill-btn"
                onClick={() => setRestSeconds((s) => s + 15)}
              >
                +15s
              </button>
              <button
                className="gm-pill-btn"
                style={{ background: "var(--text-primary)", color: "var(--bg-base)", fontWeight: 800 }}
                onClick={() => {
                  setRestActive(false);
                  setRestSeconds(0);
                }}
              >
                Listo
              </button>
            </div>
          </aside>
        )}

        {/* Scrollable Content */}
        <main className="content-scroller">
          {/* ========================================================================= */}
          {/* TAB 1: HOY (DASHBOARD — EXACTLY LIKE SCREENSHOT 1 & 4) */}
          {/* ========================================================================= */}
          {activeTab === "hoy" && (
            <div className="tab-pane-view gm-dashboard">
              <div className="gm-dashboard-heading">
                <p><Calendar size={15} aria-hidden="true" /> {new Intl.DateTimeFormat("es", { dateStyle: "full", timeZone: "UTC" }).format(new Date(currentDate))}</p>
                <h2>Tu panel de bienestar</h2>
                <span>Entrenamiento, nutrición y seguimiento personal.</span>
              </div>
              {/* 1. Hero Card: TODAY'S ROUTINE */}
              {(() => {
                const activeProg =
                  GLP1_ROUTINES.find((r) => r.id === profile.activeProgramId) || GLP1_ROUTINES[0];
                const dayOne = activeProg.days[0];
                return (
                  <section className="gm-card gm-card-hero">
                    <div className="gm-hero-art" aria-hidden="true">
                      <div className="gm-glass-orb"><Dumbbell strokeWidth={1.1} /></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="card-eyebrow">RUTINA DE HOY</span>
                        <h2 className="card-title-lg" style={{ marginTop: 4 }}>
                          {activeProg.name}
                        </h2>
                        <div className="card-meta-text" style={{ marginTop: 4 }}>
                          {dayOne.exercises.length} ejercicios · {activeProg.durationMin} min · {dayOne.dayName}
                        </div>
                      </div>
                    </div>

                    <div className="gm-hero-actions">
                      <button
                        className="gm-btn-white"
                        onClick={() => startWorkoutFromRoutine(activeProg, 0)}
                      >
                        <Play size={17} fill="currentColor" /> Iniciar entrenamiento
                      </button>
                      <button
                        className="gm-btn-circle-action"
                        onClick={() => setActiveTab("programas")}
                        aria-label="Ver todas las rutinas"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </section>
                );
              })()}

              {/* 2. Weekday Calendar Strip (Screenshot 1) */}
              {/* 3. Personal tracking card */}
              <section className="gm-card gm-dashboard-tracking">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="card-eyebrow" style={{ color: "var(--accent-emerald)" }}>
                    SEGUIMIENTO PERSONAL
                  </span>
                  <span className="gm-pill-btn active" style={{ padding: "4px 10px", fontSize: "0.72rem" }}>
                    {currentMed.name.split(" ")[0]} · {profile.currentDose}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>{overview.title}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {overview.caption}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", padding: "8px 0", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span>Próxima dosis: <strong style={{ color: "var(--text-primary)" }}>en {overview.daysUntilNextInjection} días</strong></span>
                  <span>Zona sugerida: <strong style={{ color: "var(--accent-emerald)" }}>{overview.nextSiteSuggestion.short}</strong></span>
                </div>

                <div className="gm-dashboard-actions">
                  <button
                    className="gm-pill-btn"
                    onClick={() => {
                      trackingTarget.current = "tracking-injection";
                      setActiveTab("seguimiento");
                    }}
                  >
                    <Syringe size={15} /> Registrar Dosis
                  </button>
                  <button
                    className="gm-pill-btn"
                    onClick={() => {
                      trackingTarget.current = "tracking-symptoms";
                      setActiveTab("seguimiento");
                    }}
                  >
                    <HeartPulse size={15} /> Registrar Síntoma
                  </button>
                </div>
              </section>

              {/* 4. Nutrition Donut Ring Card (Screenshot 4) */}
              <section className="gm-card gm-nutrition-ring-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="card-eyebrow">NUTRICIÓN & MACROS</span>
                  <button
                    onClick={() => setActiveTab("nutricion")}
                    style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-orange)" }}
                  >
                    Ver Detalle &rarr;
                  </button>
                </div>

                <div className="gm-ring-hero-layout">
                  {/* Left: Consumidas */}
                  <div className="gm-ring-stat-col left">
                    <span className="gm-ring-stat-num num-tabular">{overview.totals.kcal}</span>
                    <span className="gm-ring-stat-label">Consumidas</span>
                  </div>

                  {/* Center Donut Ring */}
                  <div className="gm-ring-center-wrapper">
                    <svg className="gm-ring-svg" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="var(--md-outline-variant)"
                        strokeWidth="10"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="var(--accent-orange)"
                        strokeWidth="10"
                        strokeDasharray="377"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                      />
                    </svg>
                    <div className="gm-ring-inner-text">
                      <span className="gm-ring-remaining-num num-tabular">{remainingKcal}</span>
                      <span className="gm-ring-remaining-label">Restantes</span>
                    </div>
                  </div>

                  {/* Right: daily goal */}
                  <div className="gm-ring-stat-col right">
                    <span className="gm-ring-stat-num num-tabular">{overview.caloriesGoal}</span>
                    <span className="gm-ring-stat-label">Meta diaria</span>
                  </div>
                </div>

                {/* 3 Macro Bars */}
                <div className="gm-macro-bars-row">
                  <div className="gm-macro-bar-item">
                    <div className="gm-macro-label-row">
                      <span className="gm-macro-name">
                        <span className="gm-macro-dot carbs"></span> Carbos
                      </span>
                      <span className="gm-macro-val num-tabular">{overview.totals.carbs}g</span>
                    </div>
                    <div className="gm-macro-track">
                      <div
                        className="gm-macro-fill carbs"
                        style={{ width: `${Math.min(100, Math.round((overview.totals.carbs / overview.carbsGoal) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="gm-macro-bar-item">
                    <div className="gm-macro-label-row">
                      <span className="gm-macro-name">
                        <span className="gm-macro-dot protein"></span> Proteína
                      </span>
                      <span className="gm-macro-val num-tabular">{overview.totals.protein}g</span>
                    </div>
                    <div className="gm-macro-track">
                      <div
                        className="gm-macro-fill protein"
                        style={{ width: `${overview.proteinPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="gm-macro-bar-item">
                    <div className="gm-macro-label-row">
                      <span className="gm-macro-name">
                        <span className="gm-macro-dot fat"></span> Grasas
                      </span>
                      <span className="gm-macro-val num-tabular">{overview.totals.fat}g</span>
                    </div>
                    <div className="gm-macro-track">
                      <div
                        className="gm-macro-fill fat"
                        style={{ width: `${Math.min(100, Math.round((overview.totals.fat / overview.fatGoal) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Hydration Bar */}
                <div className="gm-water-strip">
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                      💧 {overview.waterGlasses} de {overview.waterGoal} vasos ({overview.waterGlasses * 250} ml)
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Meta hídrica diaria</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="gm-pill-btn" onClick={addWaterGlass}>
                      <Plus size={14} /> +250 ml
                    </button>
                    <button
                      className={`gm-pill-btn ${state.nutritionByDate?.[currentDate]?.electrolytes ? "active" : ""}`}
                      onClick={toggleElectrolytes}
                    >
                      ⚡ Electrolitos
                    </button>
                  </div>
                </div>
              </section>

              {/* 5. Weekly Summary Stats (Screenshot 1) */}
              <section className="gm-card">
                <span className="card-eyebrow">ÚLTIMOS 7 DÍAS</span>
                <p className="gm-weekly-stat">
                  <strong className="num-tabular">{overview.weeklyWorkoutsCount}</strong>
                  Entrenamientos registrados
                </p>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ENTRENAR (EXACTLY LIKE SCREENSHOT 2) */}
          {/* ========================================================================= */}
          {activeTab === "entrenar" && (
            <div className="tab-pane-view">
              {/* If Live Workout is active */}
              {liveWorkout ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Active Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "14px 18px", borderRadius: 24, border: "1px solid var(--border-medium)" }}>
                    <div>
                      <span className="card-eyebrow" style={{ color: "var(--accent-orange)" }}>SESIÓN EN VIVO</span>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 900 }}>{liveWorkout.dayName}</h3>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)" }} className="num-tabular">
                        {Math.floor(liveDuration / 60).toString().padStart(2, "0")}:
                        {(liveDuration % 60).toString().padStart(2, "0")}
                      </div>
                      <button
                        onClick={finishLiveWorkout}
                        style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: 2 }}
                      >
                        ✓ Finalizar
                      </button>
                    </div>
                  </div>

                  {/* Exercises sets table */}
                  {liveWorkout.exercises.map((ex, exIdx) => {
                    const exInfo = getExerciseById(ex.exerciseId);
                    return (
                      <div key={ex.exerciseId} className="gm-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <h4 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{ex.name}</h4>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {ex.targetSets} series · Meta: {ex.targetReps} reps
                            </span>
                          </div>
                          {exInfo && (
                            <button
                              className="gm-pill-btn"
                              style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                              onClick={() => setActiveExerciseModal(exInfo)}
                            >
                              Ver Técnica
                            </button>
                          )}
                        </div>

                        <table className="gm-sets-table">
                          <thead>
                            <tr>
                              <th>Serie</th>
                              <th>Kg</th>
                              <th>Reps</th>
                              <th>RPE</th>
                              <th>✓</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ex.sets.map((s, sIdx) => (
                              <tr key={sIdx}>
                                <td style={{ fontWeight: 800 }}>{s.setNum}</td>
                                <td>
                                  <input
                                    type="number"
                                    className="gm-set-input"
                                    value={s.weight}
                                    onChange={(e) => updateSetField(exIdx, sIdx, "weight", e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="gm-set-input"
                                    value={s.reps}
                                    onChange={(e) => updateSetField(exIdx, sIdx, "reps", e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="gm-set-input"
                                    value={s.rpe}
                                    onChange={(e) => updateSetField(exIdx, sIdx, "rpe", e.target.value)}
                                  />
                                </td>
                                <td>
                                  <button
                                    className={`gm-check-btn ${s.completed ? "completed" : ""}`}
                                    onClick={() => toggleSetComplete(exIdx, sIdx)}
                                  >
                                    <Check size={16} strokeWidth={3} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Standard Screen: YOUR FOCUS & BodyMap (Screenshot 2) */
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="gm-train-focus-header">
                    <h2 className="gm-focus-title">TU ENFOQUE</h2>
                    <p className="gm-focus-subtitle">
                      Toca los músculos que quieres entrenar — frente y espalda.
                    </p>
                  </div>

                  {/* Interactive BodyMap Card */}
                  <div className="gm-bodymap-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="card-eyebrow">MAPA ANATÓMICO</span>
                      <button
                        className="gm-pill-btn"
                        style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                        onClick={() =>
                          saveState((p) => ({
                            ...p,
                            profile: {
                              ...p.profile,
                              sex: p.profile.sex === "female" ? "male" : "female",
                            },
                          }))
                        }
                      >
                        Silueta: {profile.sex === "female" ? "Femenina" : "Masculina"}
                      </button>
                    </div>

                    <BodyMap
                      sex={profile.sex || "female"}
                      selectedMuscles={selectedMuscles}
                      onToggleMuscle={toggleMuscle}
                    />

                    {/* Selected Tags below body */}
                    {selectedMuscles.length > 0 && (
                      <div className="gm-tags-flow">
                        {selectedMuscles.map((m) => (
                          <div
                            key={m}
                            className="gm-tag-pill"
                            onClick={() => toggleMuscle(m)}
                          >
                            <span>{MUSCLE_LABELS[m]?.name || m}</span>
                            <X size={14} />
                          </div>
                        ))}
                        <button
                          onClick={clearMuscles}
                          style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 4 }}
                        >
                          Limpiar
                        </button>
                      </div>
                    )}

                    <button
                      className="gm-btn-white"
                      onClick={() => {
                        if (filteredExercises.length > 0) {
                          setActiveExerciseModal(filteredExercises[0]);
                        } else {
                          showToast("Selecciona al menos un músculo con ejercicios");
                        }
                      }}
                    >
                      Continuar ({filteredExercises.length} ejercicios listos)
                    </button>
                  </div>

                  {/* OR START WITH SECTION (Screenshot 2) */}
                  <div>
                    <span className="card-eyebrow" style={{ display: "block", marginBottom: 8 }}>
                      O EMPEZAR CON
                    </span>
                    <div className="gm-or-start-grid">
                      <div
                        className="gm-quick-start-card"
                        onClick={() => startWorkoutFromRoutine(GLP1_ROUTINES[2], 0)}
                      >
                        <div className="gm-quick-start-icon-box">
                          <Flame size={20} />
                        </div>
                        <h4 className="gm-quick-start-title">Calentamiento</h4>
                        <p className="gm-quick-start-desc">
                          Movilidad y activación articular suave (5-8 min).
                        </p>
                      </div>

                      <div
                        className="gm-quick-start-card"
                        onClick={() => showToast("Caminata inclinada: 15-20 min a RPE 6")}
                      >
                        <div className="gm-quick-start-icon-box" style={{ color: "var(--accent-blue)" }}>
                          <Activity size={20} />
                        </div>
                        <h4 className="gm-quick-start-title">Cardio Ligero</h4>
                        <p className="gm-quick-start-desc">
                          Caminata anti-impacto que acelera la digestión.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Catalog Grid */}
                  <div className="gm-card">
                    <span className="card-eyebrow">CATÁLOGO DE FUERZA ({filteredExercises.length})</span>
                    <div className="gm-search-row">
                      <div className="gm-search-input-box">
                        <Search size={18} color="var(--text-dim)" />
                        <input
                          type="text"
                          placeholder="Buscar ejercicio..."
                          value={exerciseSearch}
                          onChange={(e) => setExerciseSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                      {filteredExercises.slice(0, 15).map((ex) => (
                        <div
                          key={ex.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            background: "var(--bg-card-hover)",
                            borderRadius: 14,
                            cursor: "pointer",
                          }}
                          onClick={() => setActiveExerciseModal(ex)}
                        >
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>{ex.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              {MUSCLE_LABELS[ex.primaryMuscle]?.name} · {EQUIPMENT_LABELS[ex.equipment]}
                            </div>
                          </div>
                          <ChevronRight size={16} color="var(--text-dim)" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PROGRAMAS (12 RUTINAS COMPLETAS) */}
          {/* ========================================================================= */}
          {activeTab === "programas" && (
            <div className="tab-pane-view gm-program-grid">
              <div className="gm-train-focus-header">
                <h2 className="gm-focus-title">PROGRAMAS</h2>
                <p className="gm-focus-subtitle">
                  12 rutinas estructuradas: 4 adaptadas y 8 clásicas de fuerza.
                </p>
              </div>

              {GLP1_ROUTINES.map((prog) => {
                const isActive = profile.activeProgramId === prog.id;
                return (
                  <div key={prog.id} className="gm-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        {prog.isGlp1Special && (
                          <span className="gm-pill-btn active" style={{ padding: "3px 8px", fontSize: "0.68rem", marginBottom: 6, display: "inline-block" }}>
                            ★ Rutina adaptada
                          </span>
                        )}
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 900 }}>{prog.name}</h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                          {prog.goal} · {prog.frequency} · {prog.durationMin} min
                        </p>
                      </div>
                      {isActive && (
                        <span className="top-bar-streak-pill" style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                          Activo
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--bg-pitch)", padding: 12, borderRadius: 16 }}>
                      {prog.days.map((d, dIdx) => (
                        <div key={dIdx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                          <span style={{ fontWeight: 700 }}>{d.dayName}</span>
                          <span style={{ color: "var(--text-muted)" }}>{d.exercises.length} ejercicios</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="gm-btn-white"
                        style={{ height: 44, fontSize: "0.88rem" }}
                        onClick={() => {
                          saveState((p) => ({
                            ...p,
                            profile: { ...p.profile, activeProgramId: prog.id },
                          }));
                          startWorkoutFromRoutine(prog, 0);
                        }}
                      >
                        <Play size={15} fill="currentColor" /> Iniciar Sesión 1
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: NUTRICIÓN (EXACTLY LIKE SCREENSHOT 4) */}
          {/* ========================================================================= */}
          {activeTab === "nutricion" && (
            <div className="tab-pane-view">
              {/* Donut Ring Hero Card */}
              <section className="gm-card gm-nutrition-ring-card">
                <span className="card-eyebrow">BALANCE DE MACRONUTRIENTES</span>
                <div className="gm-ring-hero-layout">
                  <div className="gm-ring-stat-col left">
                    <span className="gm-ring-stat-num num-tabular">{overview.totals.kcal}</span>
                    <span className="gm-ring-stat-label">Consumidas</span>
                  </div>

                  <div className="gm-ring-center-wrapper">
                    <svg className="gm-ring-svg" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="60" fill="none" stroke="var(--md-outline-variant)" strokeWidth="10" />
                      <circle
                        cx="70"
                        cy="70"
                        r="60"
                        fill="none"
                        stroke="var(--accent-orange)"
                        strokeWidth="10"
                        strokeDasharray="377"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="gm-ring-inner-text">
                      <span className="gm-ring-remaining-num num-tabular">{remainingKcal}</span>
                      <span className="gm-ring-remaining-label">Restantes</span>
                    </div>
                  </div>

                  <div className="gm-ring-stat-col right">
                    <span className="gm-ring-stat-num num-tabular">350</span>
                    <span className="gm-ring-stat-label">Quemadas</span>
                  </div>
                </div>

                <div className="gm-macro-bars-row">
                  <div className="gm-macro-bar-item">
                    <div className="gm-macro-label-row">
                      <span className="gm-macro-name"><span className="gm-macro-dot carbs"></span> Carbos</span>
                      <span className="gm-macro-val num-tabular">{overview.totals.carbs}g</span>
                    </div>
                    <div className="gm-macro-track">
                      <div className="gm-macro-fill carbs" style={{ width: `${Math.min(100, Math.round((overview.totals.carbs / overview.carbsGoal) * 100))}%` }}></div>
                    </div>
                  </div>

                  <div className="gm-macro-bar-item">
                    <div className="gm-macro-label-row">
                      <span className="gm-macro-name"><span className="gm-macro-dot protein"></span> Proteína</span>
                      <span className="gm-macro-val num-tabular">{overview.totals.protein}g</span>
                    </div>
                    <div className="gm-macro-track">
                      <div className="gm-macro-fill protein" style={{ width: `${overview.proteinPct}%` }}></div>
                    </div>
                  </div>

                  <div className="gm-macro-bar-item">
                    <div className="gm-macro-label-row">
                      <span className="gm-macro-name"><span className="gm-macro-dot fat"></span> Grasas</span>
                      <span className="gm-macro-val num-tabular">{overview.totals.fat}g</span>
                    </div>
                    <div className="gm-macro-track">
                      <div className="gm-macro-fill fat" style={{ width: `${Math.min(100, Math.round((overview.totals.fat / overview.fatGoal) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Search & Register Row (Screenshot 4) */}
              <div className="gm-card">
                <span className="card-eyebrow">AÑADIR ALIMENTO</span>
                <div className="gm-search-row">
                  <div className="gm-search-input-box">
                    <Search size={18} color="var(--text-dim)" />
                    <input
                      type="text"
                      placeholder="¿Qué comiste hoy?"
                      value={newFoodDesc}
                      onChange={(e) => setNewFoodDesc(e.target.value)}
                    />
                  </div>
                  <button className="gm-btn-circle-add" onClick={() => addFoodItem(null)}>
                    <Plus size={22} strokeWidth={3} />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input
                    type="number"
                    placeholder="Proteína (g)"
                    value={newFoodProtein}
                    onChange={(e) => setNewFoodProtein(e.target.value)}
                    className="gm-set-input"
                    style={{ width: "100%", textAlign: "left", padding: "0 14px" }}
                  />
                  <input
                    type="number"
                    placeholder="Calorías (kcal)"
                    value={newFoodKcal}
                    onChange={(e) => setNewFoodKcal(e.target.value)}
                    className="gm-set-input"
                    style={{ width: "100%", textAlign: "left", padding: "0 14px" }}
                  />
                </div>

                {/* Quick Foods Horizontal Row */}
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 8 }}>
                    ALIMENTOS RECOMENDADOS
                  </span>
                  <div className="gm-quick-foods-row">
                    {QUICK_FOODS.map((f, i) => (
                      <button
                        key={i}
                        className="gm-quick-food-chip"
                        onClick={() => addFoodItem(f)}
                      >
                        <span>{f.name}</span>
                        <span style={{ color: "var(--accent-orange)" }}>+{f.protein}g</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meals Log for Today */}
              <div className="gm-card">
                <span className="card-eyebrow">REGISTRO DE COMIDAS</span>
                {(!overview.meals || overview.meals.length === 0) ? (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", textAlign: "center", padding: "20px 0" }}>
                    No hay alimentos registrados hoy. Usa la barra superior para agregar.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {overview.meals.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--bg-card-hover)",
                          padding: "10px 14px",
                          borderRadius: 14,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 800 }}>{item.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {item.protein}g proteína · {item.kcal} kcal · {item.time}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMealItem(item.id)}
                          style={{ color: "var(--text-dim)" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Semáforo de alimentos */}
              <div className="gm-card">
                <span className="card-eyebrow">SEMÁFORO DE TOLERANCIA DIGESTIVA</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 16, padding: 14 }}>
                    <div style={{ color: "var(--accent-emerald)", fontWeight: 800, fontSize: "0.85rem", marginBottom: 4 }}>
                      🟢 PRIORIZAR (Digestión rápida y alta absorción)
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Pechuga de pollo, claras de huevo, yogur griego, caldo desgrasado, salmón y papaya.
                    </div>
                  </div>

                  <div style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.3)", borderRadius: 16, padding: 14 }}>
                    <div style={{ color: "#EAB308", fontWeight: 800, fontSize: "0.85rem", marginBottom: 4 }}>
                      🟡 MODERAR (Porciones medidas)
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Aguacate, arroz blanco medido, batata y frutos secos molidos.
                    </div>
                  </div>

                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 16, padding: 14 }}>
                    <div style={{ color: "var(--accent-error)", fontWeight: 800, fontSize: "0.85rem", marginBottom: 4 }}>
                      🔴 EVITAR (Causa náuseas y eructos de azufre)
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Frituras, chicharrón, carnes muy grasosas, refrescos con gas y alcohol.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SEGUIMIENTO (EXACTLY LIKE SCREENSHOT 3 & 5) */}
          {/* ========================================================================= */}
          {activeTab === "seguimiento" && (
            <div className="tab-pane-view">
              {/* Dual Metric Cards (Screenshot 3) */}
              <div className="gm-dual-metric-grid">
                {/* Volume 30D */}
                <div className="gm-metric-card">
                  <div className="gm-metric-header">
                    <span className="gm-metric-title">VOLUMEN · 30D</span>
                    <span className="gm-metric-trend">↗ 23%</span>
                  </div>
                  <div className="gm-metric-value-row">
                    <span className="gm-metric-big-num num-tabular">109</span>
                    <span className="gm-metric-unit">t</span>
                  </div>
                  <svg className="gm-sparkline-svg" viewBox="0 0 100 30">
                    <polyline
                      fill="none"
                      stroke="var(--text-primary)"
                      strokeWidth="2.5"
                      points="0,25 20,22 40,18 60,14 80,8 100,4"
                    />
                  </svg>
                </div>

                {/* Weight */}
                <div className="gm-metric-card">
                  <div className="gm-metric-header">
                    <span className="gm-metric-title">PESO</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Hoy</span>
                  </div>
                  <div className="gm-metric-value-row">
                    <span className="gm-metric-big-num num-tabular">{overview.latestWeight}</span>
                    <span className="gm-metric-unit">{unitLabel}</span>
                  </div>
                  <svg className="gm-sparkline-svg" viewBox="0 0 100 30">
                    <polyline
                      fill="none"
                      stroke="var(--accent-emerald)"
                      strokeWidth="2.5"
                      points="0,6 25,10 50,15 75,18 100,24"
                    />
                  </svg>
                </div>
              </div>

              {/* Consistency Heatmap Matrix (Screenshot 3) */}
              <div className="gm-card gm-heatmap-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="card-eyebrow">CONSISTENCIA DE ENTRENAMIENTO</span>
                  <span className="top-bar-streak-pill" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                    <Flame size={14} fill="currentColor" /> 12 días seguidos
                  </span>
                </div>

                <div className="gm-heatmap-matrix">
                  {Array.from({ length: 42 }, (_, i) => {
                    const lvls = ["lvl-0", "lvl-1", "lvl-2", "lvl-3", "lvl-4"];
                    const randLvl = (i > 25 && i < 38) ? lvls[Math.min(4, (i % 4) + 1)] : lvls[i % 3];
                    return <div key={i} className={`gm-heatmap-square ${randLvl}`}></div>;
                  })}
                </div>
              </div>

              {/* Injection Rotation 6 Zones */}
              <div className="gm-card gm-tracking-panel" id="tracking-injection" tabIndex={-1}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="card-eyebrow">ROTACIÓN DE INYECCIÓN (6 ZONAS)</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--accent-emerald)", fontWeight: 700 }}>
                    Siguiente: {overview.nextSiteSuggestion.short}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {INJECTION_SITES.map((site) => {
                    const isSuggested = site.id === overview.nextSiteSuggestion.id;
                    const isSelected = doseSite === site.id;
                    return (
                      <button
                        key={site.id}
                        onClick={() => setDoseSite(site.id)}
                        style={{
                          background: isSelected ? "var(--accent-emerald-dim)" : "var(--bg-pitch)",
                          border: isSelected ? "1.5px solid var(--accent-emerald)" : isSuggested ? "1px dashed var(--accent-emerald)" : "1px solid var(--border-medium)",
                          borderRadius: 16,
                          padding: "12px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{site.short}</span>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{site.zone}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <input
                    type="text"
                    value={doseAmount}
                    onChange={(e) => setDoseAmount(e.target.value)}
                    placeholder="Dosis (ej. 5.0 mg)"
                    className="gm-set-input"
                    style={{ flex: 1, textAlign: "left", padding: "0 14px" }}
                  />
                  <button className="gm-btn-white" style={{ width: "auto", height: 44 }} onClick={registerInjection}>
                    Registrar Dosis
                  </button>
                </div>
              </div>

              {/* Symptoms Registry */}
              <div className="gm-card gm-tracking-panel" id="tracking-symptoms" tabIndex={-1}>
                <span className="card-eyebrow">CONTROL DE SÍNTOMAS</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SYMPTOM_CATALOG.slice(0, 6).map((sym) => {
                    const isSel = selectedSymptomId === sym.id;
                    return (
                      <button
                        key={sym.id}
                        onClick={() => setSelectedSymptomId(sym.id)}
                        style={{
                          background: isSel ? "var(--md-secondary-container)" : "var(--bg-card-hover)",
                          border: isSel ? "1.5px solid var(--text-primary)" : "1px solid var(--border-subtle)",
                          borderRadius: 14,
                          padding: "10px",
                          textAlign: "left",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>{sym.name}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{sym.category}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="gm-pill-btn"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  onClick={registerSymptom}
                >
                  <HeartPulse size={15} /> Registrar Alerta de Síntoma
                </button>
              </div>

              {/* Offline Privacy & Backup (Screenshot 5) */}
              <div className="gm-card">
                <span className="card-eyebrow">100% OFFLINE · TUS DATOS SON TUYOS</span>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Sin cuenta requerida. Toda la información médica y de entrenamiento se guarda en tu dispositivo.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button className="gm-pill-btn" onClick={exportBackup}>
                    <Download size={15} /> Exportar JSON
                  </button>
                  <label className="gm-pill-btn" style={{ cursor: "pointer", display: "inline-flex", justifyContent: "center" }}>
                    <Upload size={15} /> Importar Datos
                    <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 3. Bottom Navigation Bar (GymMane Style) */}
        <nav
          className="gm-bottom-bar"
          aria-label="Navegación principal"
          style={{ "--active-index": NAV_DESTINATIONS.findIndex((dest) => dest.id === activeTab) }}
        >
          {NAV_DESTINATIONS.map((dest) => {
            const Icon = dest.icon;
            const isActive = activeTab === dest.id;
            return (
              <button
                key={dest.id}
                className={`gm-nav-btn ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveTab(dest.id)}
              >
                <div className="gm-nav-icon-wrap">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="gm-nav-label">{dest.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal Sheet for Exercise Technique Animation */}
      {activeExerciseModal && (
        <div className="gm-modal-overlay" onClick={() => setActiveExerciseModal(null)}>
          <div className="gm-modal-sheet gm-technique-sheet" role="dialog" aria-modal="true" aria-labelledby="exercise-technique-title" onClick={(e) => e.stopPropagation()}>
            <div className="gm-modal-handle"></div>
            <div className="gm-modal-header">
              <div>
                <span className="card-eyebrow">TÉCNICA DE EJERCICIO</span>
                <h3 id="exercise-technique-title" style={{ fontSize: "1.25rem", fontWeight: 900 }}>{activeExerciseModal.name}</h3>
              </div>
              <button className="m3-icon-button" onClick={() => setActiveExerciseModal(null)} aria-label="Cerrar técnica">
                <X size={20} />
              </button>
            </div>

            <div className="gm-technique-content">
              <ExerciseArt key={activeExerciseModal.id} slug={activeExerciseModal.art} />
              <span className="card-eyebrow">PASOS DEL EJERCICIO</span>
              {activeExerciseModal.steps?.length > 0 && (
                <ol className="exercise-steps">
                  {activeExerciseModal.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="gm-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="gm-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="gm-modal-handle"></div>
            <div className="gm-modal-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: 900 }}>Perfil & Ajustes</h3>
              <button className="m3-icon-button" onClick={() => setSettingsOpen(false)} aria-label="Cerrar ajustes">
                <X size={20} />
              </button>
            </div>

            <fieldset className="gm-appearance">
              <legend className="card-eyebrow">Apariencia</legend>
              <div className="gm-appearance-options">
                {APPEARANCE_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`gm-pill-btn ${appearance === id ? "active" : ""}`}
                    aria-pressed={appearance === id}
                    onClick={() => selectAppearance(id)}
                  >
                    <Icon size={16} aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Nombre</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    saveState((p) => ({ ...p, profile: { ...p.profile, name: e.target.value } }))
                  }
                  className="gm-set-input"
                  style={{ width: "100%", textAlign: "left", padding: "0 14px", marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Medicamento Activo</label>
                <select
                  value={profile.medicationId}
                  onChange={(e) =>
                    saveState((p) => ({ ...p, profile: { ...p.profile, medicationId: e.target.value } }))
                  }
                  className="gm-set-input"
                  style={{ width: "100%", textAlign: "left", padding: "0 14px", marginTop: 4 }}
                >
                  {MEDICATIONS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Actualizar Peso ({unitLabel})</label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="number"
                    placeholder={`Peso actual (${overview.latestWeight})`}
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="gm-set-input"
                    style={{ flex: 1, textAlign: "left", padding: "0 14px" }}
                  />
                  <button className="gm-btn-white" style={{ width: "auto", height: 44 }} onClick={registerWeight}>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
