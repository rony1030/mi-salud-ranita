"use client";

import { useEffect, useMemo, useState } from "react";
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
  { id: "seguimiento", label: "Seguimiento", icon: TrendingUp },
];

function playBeepSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore audio restrictions
  }
}

export default function GymManeApp() {
  const [state, setState] = useState(null);
  const [activeTab, setActiveTab] = useState("hoy");
  const [toastMessage, setToastMessage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => todayISO());

  // Subview toggles within tabs (M3 Segmented Buttons)
  const [trainSubView, setTrainSubView] = useState("library"); // 'library' | 'live'
  const [nutriSubView, setNutriSubView] = useState("diary"); // 'diary' | 'traffic' | 'phase_menu'
  const [trackingSubView, setTrackingSubView] = useState("injection"); // 'injection' | 'symptoms' | 'progress'

  // Exercise library state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [anatomySex, setAnatomySex] = useState("female");
  const [activeExerciseModal, setActiveExerciseModal] = useState(null);

  // Live workout session state
  const [liveWorkout, setLiveWorkout] = useState(null);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotal, setRestTotal] = useState(60);
  const [restActive, setRestActive] = useState(false);

  // Program filters
  const [programFilter, setProgramFilter] = useState("all"); // 'all' | 'glp1' | 'classic'

  // Food log state
  const [foodFilter, setFoodFilter] = useState("green");
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodProtein, setCustomFoodProtein] = useState("");
  const [customFoodKcal, setCustomFoodKcal] = useState("");
  const [customFoodSlot, setCustomFoodSlot] = useState("Almuerzo");

  // Injection log state
  const [injDose, setInjDose] = useState("2.5 mg");
  const [injSite, setInjSite] = useState("muslo_izq");
  const [injWeight, setInjWeight] = useState("");
  const [injNotes, setInjNotes] = useState("");

  // Symptom log state
  const [selectedSymptomId, setSelectedSymptomId] = useState("nauseas");
  const [symptomSeverity, setSymptomSeverity] = useState("moderado");
  const [symptomNote, setSymptomNote] = useState("");

  // Weight entry state
  const [newWeightVal, setNewWeightVal] = useState("");
  const [newWaistCm, setNewWaistCm] = useState("");
  const [newHipCm, setNewHipCm] = useState("");
  const [newWeightNote, setNewWeightNote] = useState("");

  // Initialize and load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState(parsed);
      } else {
        const init = defaultState();
        setState(init);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
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
      } catch (err) {
        console.error("Error saving state:", err);
      }
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3200);
  };

  // Workout duration timer
  useEffect(() => {
    if (!liveWorkout) return;
    const interval = setInterval(() => {
      setLiveSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveWorkout]);

  // Rest countdown timer
  useEffect(() => {
    if (!restActive || restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds((sec) => {
        if (sec <= 1) {
          setRestActive(false);
          playBeepSound();
          showToast("Pausa concluida · Inicia la siguiente serie");
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restActive, restSeconds]);

  const startRestTimer = (seconds = 60) => {
    setRestTotal(seconds);
    setRestSeconds(seconds);
    setRestActive(true);
  };

  const overview = useMemo(() => {
    if (!state) return null;
    return computeWellnessOverview(state, currentDate);
  }, [state, currentDate]);

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ex.name.toLowerCase().includes(q) || ex.nameEn.toLowerCase().includes(q);
        if (!matchName) return false;
      }
      if (selectedMuscles.length > 0) {
        const matchesPrimary = selectedMuscles.includes(ex.primary);
        const matchesSecondary = ex.secondary?.some((s) => selectedMuscles.includes(s));
        if (!matchesPrimary && !matchesSecondary) return false;
      }
      if (selectedEquipment !== "all" && ex.equipment !== selectedEquipment) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedMuscles, selectedEquipment]);

  // Start live workout from a routine
  const startWorkoutFromRoutine = (routine, dayIndex = 0) => {
    const day = routine.days[dayIndex] || routine.days[0];
    const exercisesInSession = day.exercises.map((item) => {
      const catalogInfo = getExerciseById(item.id) || {
        id: item.id,
        name: "Ejercicio",
        equipment: "Dumbbell",
        primary: "glutes",
        art: "dumbbell-squat",
      };
      const numSets = Number(item.sets) || 3;
      const initialSets = Array.from({ length: numSets }, (_, sIdx) => ({
        setNumber: sIdx + 1,
        weight: "",
        reps: typeof item.reps === "number" ? item.reps : 12,
        rpe: 8,
        completed: false,
      }));
      return {
        id: item.id,
        catalog: catalogInfo,
        restSec: item.restSec || 60,
        note: item.note || "",
        sets: initialSets,
      };
    });

    setLiveWorkout({
      routineId: routine.id,
      routineName: routine.name,
      dayName: day.dayName,
      exercises: exercisesInSession,
      startTime: Date.now(),
    });
    setLiveSeconds(0);
    setTrainSubView("live");
    setActiveTab("entrenar");
    showToast(`Sesión activa: ${routine.name}`);
  };

  const toggleSetComplete = (exerciseIdx, setIdx) => {
    if (!liveWorkout) return;
    const nextExercises = [...liveWorkout.exercises];
    const targetEx = nextExercises[exerciseIdx];
    const targetSet = { ...targetEx.sets[setIdx] };
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;
    targetEx.sets[setIdx] = targetSet;

    setLiveWorkout({ ...liveWorkout, exercises: nextExercises });

    if (willBeCompleted) {
      const weightNum = parseFloat(targetSet.weight) || 0;
      const repsNum = parseInt(targetSet.reps, 10) || 0;
      if (weightNum > 0) {
        const prevPr = state?.prRecords?.[targetEx.id];
        if (!prevPr || weightNum > prevPr.maxWeight) {
          saveState((s) => ({
            ...s,
            prRecords: {
              ...(s.prRecords || {}),
              [targetEx.id]: {
                maxWeight: weightNum,
                reps: repsNum,
                date: todayISO(),
              },
            },
          }));
          showToast(`Nuevo Récord Personal (PR): ${weightNum} ${state?.profile?.unit || "lb"}`);
        }
      }
      startRestTimer(targetEx.restSec || 60);
    }
  };

  const finishLiveWorkout = () => {
    if (!liveWorkout) return;
    let totalSetsDone = 0;
    let totalVolume = 0;

    liveWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((st) => {
        if (st.completed) {
          totalSetsDone += 1;
          const w = parseFloat(st.weight) || 0;
          const r = parseInt(st.reps, 10) || 0;
          totalVolume += w * r;
        }
      });
    });

    const durationMin = Math.max(1, Math.round(liveSeconds / 60));
    const newWorkoutLog = {
      id: `wkt-${Date.now()}`,
      date: todayISO(),
      routineId: liveWorkout.routineId,
      routineName: liveWorkout.routineName,
      dayName: liveWorkout.dayName,
      durationMin,
      totalSets: totalSetsDone,
      totalVolume,
      completedAt: new Date().toISOString(),
    };

    saveState((prev) => ({
      ...prev,
      workouts: [newWorkoutLog, ...(prev.workouts || [])],
    }));

    setLiveWorkout(null);
    setRestActive(false);
    setTrainSubView("library");
    showToast(`Entrenamiento guardado · ${totalSetsDone} series · ${totalVolume} ${state?.profile?.unit || "lb"}`);
  };

  const addWaterGlass = () => {
    saveState((prev) => {
      const today = currentDate;
      const existing = prev.nutritionByDate?.[today] || { waterGlasses: 0, electrolytes: false, meals: [] };
      return {
        ...prev,
        nutritionByDate: {
          ...(prev.nutritionByDate || {}),
          [today]: {
            ...existing,
            waterGlasses: (existing.waterGlasses || 0) + 1,
          },
        },
      };
    });
    showToast("+250 ml de agua registrados");
  };

  const toggleElectrolytes = () => {
    saveState((prev) => {
      const today = currentDate;
      const existing = prev.nutritionByDate?.[today] || { waterGlasses: 0, electrolytes: false, meals: [] };
      return {
        ...prev,
        nutritionByDate: {
          ...(prev.nutritionByDate || {}),
          [today]: {
            ...existing,
            electrolytes: !existing.electrolytes,
          },
        },
      };
    });
  };

  const addFoodFromGuide = (foodItem, slot = "Almuerzo") => {
    saveState((prev) => {
      const today = currentDate;
      const existing = prev.nutritionByDate?.[today] || { waterGlasses: 0, electrolytes: false, meals: [] };
      const newMeal = {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        foodId: foodItem.id,
        name: foodItem.name,
        slot,
        protein: foodItem.protein,
        kcal: foodItem.kcal,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        fiber: foodItem.fiber,
        category: foodItem.category,
      };
      return {
        ...prev,
        nutritionByDate: {
          ...(prev.nutritionByDate || {}),
          [today]: {
            ...existing,
            meals: [...(existing.meals || []), newMeal],
          },
        },
      };
    });
    showToast(`Añadido a ${slot}: ${foodItem.name} (+${foodItem.protein}g proteína)`);
  };

  const removeMeal = (mealId) => {
    saveState((prev) => {
      const today = currentDate;
      const existing = prev.nutritionByDate?.[today];
      if (!existing) return prev;
      return {
        ...prev,
        nutritionByDate: {
          ...prev.nutritionByDate,
          [today]: {
            ...existing,
            meals: existing.meals.filter((m) => m.id !== mealId),
          },
        },
      };
    });
    showToast("Alimento eliminado");
  };

  const addCustomMeal = (e) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;
    const proteinNum = parseFloat(customFoodProtein) || 0;
    const kcalNum = parseFloat(customFoodKcal) || 0;
    const newMeal = {
      id: `meal-${Date.now()}`,
      name: customFoodName.trim(),
      slot: customFoodSlot,
      protein: proteinNum,
      kcal: kcalNum,
      carbs: 0,
      fat: 0,
      fiber: 0,
      category: "green",
    };
    saveState((prev) => {
      const today = currentDate;
      const existing = prev.nutritionByDate?.[today] || { waterGlasses: 0, electrolytes: false, meals: [] };
      return {
        ...prev,
        nutritionByDate: {
          ...(prev.nutritionByDate || {}),
          [today]: {
            ...existing,
            meals: [...(existing.meals || []), newMeal],
          },
        },
      };
    });
    setCustomFoodName("");
    setCustomFoodProtein("");
    setCustomFoodKcal("");
    showToast(`Registrado: ${newMeal.name} (+${proteinNum}g proteína)`);
  };

  const handleAddInjection = (e) => {
    e.preventDefault();
    const wNum = parseFloat(injWeight) || state?.profile?.currentWeight || 0;
    const newInj = {
      id: `inj-${Date.now()}`,
      date: currentDate,
      medicationId: state?.profile?.medicationId || "mounjaro",
      dose: injDose,
      site: injSite,
      weight: wNum,
      notes: injNotes.trim(),
    };
    saveState((prev) => ({
      ...prev,
      injections: [newInj, ...(prev.injections || [])],
      profile: {
        ...prev.profile,
        currentWeight: wNum || prev.profile.currentWeight,
      },
    }));
    setInjNotes("");
    showToast(`Dosis de ${injDose} guardada`);
  };

  const handleAddSymptomLog = (e) => {
    e.preventDefault();
    const symObj = SYMPTOM_CATALOG.find((s) => s.id === selectedSymptomId);
    const newLog = {
      id: `sym-${Date.now()}`,
      date: currentDate,
      symptomId: selectedSymptomId,
      symptomName: symObj?.name || selectedSymptomId,
      severity: symptomSeverity,
      note: symptomNote.trim(),
    };
    saveState((prev) => ({
      ...prev,
      symptomLogs: [newLog, ...(prev.symptomLogs || [])],
    }));
    setSymptomNote("");
    showToast(`Síntoma reportado: ${symObj?.name}`);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(newWeightVal);
    if (!w || w <= 0) return;
    const waist = parseFloat(newWaistCm) || undefined;
    const hip = parseFloat(newHipCm) || undefined;
    const newEntry = {
      id: `w-${Date.now()}`,
      date: currentDate,
      weight: w,
      waistCm: waist,
      hipCm: hip,
      note: newWeightNote.trim(),
    };
    saveState((prev) => ({
      ...prev,
      weights: [...(prev.weights || []), newEntry],
      profile: {
        ...prev.profile,
        currentWeight: w,
      },
    }));
    setNewWeightVal("");
    setNewWaistCm("");
    setNewHipCm("");
    setNewWeightNote("");
    showToast(`Peso actualizado: ${w} ${state?.profile?.unit || "lb"}`);
  };

  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `GymMane-GLP1-${todayISO()}.json`);
    dlAnchorElem.click();
    showToast("Respaldo exportado");
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
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <Dumbbell className="spin-icon" size={40} color="#FF8A65" />
          <p className="loading-text">Cargando GymMane GLP-1…</p>
        </div>
      </main>
    );
  }

  const { profile } = state;
  const currentMed = MEDICATIONS.find((m) => m.id === profile.medicationId) || MEDICATIONS[0];
  const unitLabel = profile.unit || "lb";

  return (
    <div className="adaptive-app-shell">
      {/* 1. M3 Navigation Rail (Tablet / Desktop >= 768px - adaptive-apps-samples) */}
      <aside className="m3-navigation-rail" aria-label="Navegación lateral adaptativa">
        <div className="rail-top-group">
          <div className="rail-brand-logo" onClick={() => setActiveTab("hoy")} title="GymMane GLP-1">
            <Dumbbell size={22} />
          </div>

          <div className="rail-nav-items">
            {NAV_DESTINATIONS.map((dest) => {
              const Icon = dest.icon;
              const isActive = activeTab === dest.id;
              return (
                <button
                  key={dest.id}
                  className={`rail-item-btn ${isActive ? "active" : ""}`}
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
          <button
            className="m3-icon-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Ajustes de Perfil"
            title="Ajustes de Perfil"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </aside>

      {/* 2. Main Adaptive Content Area */}
      <div className="adaptive-main-area">
        {/* M3 Top App Bar */}
        <header className="m3-top-app-bar">
          <div className="top-bar-headline-group" onClick={() => setActiveTab("hoy")} style={{ cursor: "pointer" }}>
            <div>
              <h1 className="top-bar-title">GymMane</h1>
              <span className="top-bar-subtitle">Clinical GLP-1</span>
            </div>
          </div>

          <div className="top-bar-trailing-group">
            <div className="m3-profile-capsule" onClick={() => setSettingsOpen(true)} style={{ cursor: "pointer" }}>
              <span className="capsule-badge-dot"></span>
              <span>{profile.name}</span>
              <span style={{ color: "var(--md-sys-color-outline)" }}>·</span>
              <span className="num-tabular">
                {overview.latestWeight} {unitLabel}
              </span>
            </div>

            <button
              className="m3-icon-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Ajustes"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        {/* Floating Rest Timer Sheet (When Active) */}
        {restActive && (
          <aside className="m3-rest-floating-sheet">
            <div className="rest-left-meta">
              <Timer size={20} color="var(--md-sys-color-primary)" />
              <div>
                <div className="rest-title-eyebrow">Descanso Entre Series</div>
                <div className="rest-countdown-clock num-tabular">
                  {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, "0")}
                </div>
              </div>
            </div>
            <div className="rest-timer-right">
              <button
                className="m3-btn-outlined"
                style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                onClick={() => setRestSeconds((s) => s + 15)}
              >
                +15s
              </button>
              <button
                className="m3-btn-tonal"
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                onClick={() => {
                  setRestActive(false);
                  setRestSeconds(0);
                }}
              >
                Continuar
              </button>
            </div>
          </aside>
        )}

        {/* Scrollable Content */}
        <main className="content-scroller">
          {/* ========================================================================= */}
          {/* TAB 1: HOY (DASHBOARD) */}
          {/* ========================================================================= */}
          {activeTab === "hoy" && (
            <div className="tab-pane-view">
              {/* 7-Day GLP-1 Cycle Card */}
              <section className="m3-card primary-tint m3-cycle-block">
                <div className="card-header-bar">
                  <span className="card-header-eyebrow">Ciclo Semanal</span>
                  <span className="treatment-active-pill">
                    {currentMed.name.split(" ")[0]} · {profile.currentDose}
                  </span>
                </div>

                <div className="cycle-hero-banner">
                  <h2 className="cycle-hero-title">{overview.title}</h2>
                  <p className="cycle-hero-desc">{overview.caption}</p>
                </div>

                {/* 7-Day Progress Track */}
                <div className="cycle-seven-grid">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                    const isPassed = overview.daysSinceInjection !== null && dayIdx < overview.daysSinceInjection;
                    const isCurrent = overview.daysSinceInjection === dayIdx;
                    return (
                      <div
                        key={dayIdx}
                        className={`cycle-day-box ${isPassed ? "passed" : ""} ${isCurrent ? "current" : ""}`}
                        title={`Día ${dayIdx + 1}`}
                      >
                        <span>D{dayIdx + 1}</span>
                        <span className="cycle-day-sub">
                          {isCurrent ? "Hoy" : isPassed ? "✓" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="cycle-action-strip">
                  <span>
                    Próxima dosis en: <strong>{overview.daysUntilNextInjection} días</strong>
                  </span>
                  <span>
                    Sitio sugerido: <strong>{overview.nextSiteSuggestion.short}</strong>
                  </span>
                </div>

                <div className="action-grid-2">
                  <button
                    className="m3-btn-tonal"
                    onClick={() => {
                      setActiveTab("seguimiento");
                      setTrackingSubView("injection");
                    }}
                  >
                    <Syringe size={16} /> Registrar Dosis
                  </button>
                  <button
                    className="m3-btn-outlined"
                    onClick={() => {
                      setActiveTab("seguimiento");
                      setTrackingSubView("symptoms");
                    }}
                  >
                    <HeartPulse size={16} /> Registrar Síntoma
                  </button>
                </div>
              </section>

              {/* Nutrition & Protein Target Card */}
              <section className="m3-card">
                <div className="card-header-bar">
                  <h3 className="card-header-title">Nutrición y Preservación Muscular</h3>
                  <button
                    className="card-action-text"
                    onClick={() => setActiveTab("nutricion")}
                  >
                    Ver Detalle &rarr;
                  </button>
                </div>

                <div className="macro-telemetry-container">
                  {/* Protein - Critical Target */}
                  <div className="m3-progress-row">
                    <div className="progress-label-line">
                      <span className="progress-title-text hero-protein">Proteína Diaria</span>
                      <span className="progress-value-text num-tabular">
                        {overview.totals.protein} g <span className="dim">/ {overview.proteinGoal} g</span> ({overview.proteinPct}%)
                      </span>
                    </div>
                    <div className="m3-linear-track">
                      <div
                        className="m3-linear-fill tertiary"
                        style={{ width: `${overview.proteinPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Calories */}
                  <div className="m3-progress-row">
                    <div className="progress-label-line">
                      <span className="progress-title-text">Calorías Totales</span>
                      <span className="progress-value-text num-tabular">
                        {overview.totals.kcal} <span className="dim">/ {overview.caloriesGoal} kcal</span> ({overview.caloriesPct}%)
                      </span>
                    </div>
                    <div className="m3-linear-track">
                      <div
                        className="m3-linear-fill primary"
                        style={{ width: `${Math.min(100, overview.caloriesPct)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Secondary Macro Grid */}
                  <div className="macro-secondary-grid">
                    <div className="macro-mini-kpi">
                      <span className="kpi-title">Carbohidratos</span>
                      <span className="kpi-value num-tabular">{overview.totals.carbs} g</span>
                    </div>
                    <div className="macro-mini-kpi">
                      <span className="kpi-title">Grasas</span>
                      <span className="kpi-value num-tabular">{overview.totals.fat} g</span>
                    </div>
                    <div className="macro-mini-kpi">
                      <span className="kpi-title">Fibra Soluble</span>
                      <span className="kpi-value num-tabular">{overview.totals.fiber} g</span>
                    </div>
                  </div>

                  {/* Hydration Bar */}
                  <div className="m3-hydration-bar">
                    <div className="hydration-summary-col">
                      <span className="hydration-title-val num-tabular">
                        {overview.waterGlasses} de {overview.waterGoal} vasos ({overview.waterGlasses * 250} ml)
                      </span>
                      <span className="hydration-subtext">Meta de reposición hídrica</span>
                    </div>
                    <div className="hydration-actions-col">
                      <button className="m3-btn-outlined" style={{ padding: "6px 14px", fontSize: "0.78rem" }} onClick={addWaterGlass}>
                        <Plus size={14} /> +250 ml
                      </button>
                      <label className="electrolytes-switch">
                        <input
                          type="checkbox"
                          checked={state.nutritionByDate?.[currentDate]?.electrolytes || false}
                          onChange={toggleElectrolytes}
                        />
                        <span>Electrolitos</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Workout Routine Scheduled for Today */}
              <section className="m3-card">
                <div className="card-header-bar">
                  <h3 className="card-header-title">Sesión Programada</h3>
                  <span className="treatment-active-pill">
                    {overview.weeklyWorkoutsCount} completados esta semana
                  </span>
                </div>

                {(() => {
                  const activeProg =
                    GLP1_ROUTINES.find((r) => r.id === profile.activeProgramId) || GLP1_ROUTINES[0];
                  const dayOne = activeProg.days[0];
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--md-sys-color-on-surface)" }}>
                            {activeProg.name}
                          </h4>
                          <span style={{ fontSize: "0.8rem", color: "var(--md-sys-color-primary)", fontWeight: 600 }}>
                            {dayOne.dayName}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", fontWeight: 600 }}>
                          {activeProg.durationMin} min
                        </span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {dayOne.exercises.slice(0, 4).map((exItem) => {
                          const exData = getExerciseById(exItem.id);
                          return (
                            <span key={exItem.id} className="ex-tag-item">
                              {exData?.name || "Ejercicio"}
                            </span>
                          );
                        })}
                        {dayOne.exercises.length > 4 && (
                          <span className="ex-tag-item" style={{ color: "var(--md-sys-color-primary)" }}>
                            +{dayOne.exercises.length - 4} más
                          </span>
                        )}
                      </div>

                      <button
                        className="m3-btn-filled"
                        onClick={() => startWorkoutFromRoutine(activeProg, 0)}
                      >
                        <Play size={16} fill="currentColor" /> Iniciar Entrenamiento
                      </button>
                    </div>
                  );
                })()}
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ENTRENAR (GYMMANE WORKOUT + BODYMAP + 115 EXERCISES) */}
          {/* ========================================================================= */}
          {activeTab === "entrenar" && (
            <div className="tab-pane-view">
              {/* M3 Segmented Buttons */}
              <div className="m3-segmented-button-row">
                <button
                  className={`m3-segment-item ${trainSubView === "library" ? "active" : ""}`}
                  onClick={() => setTrainSubView("library")}
                >
                  <Dumbbell size={16} /> Catálogo & Anatomía
                </button>
                <button
                  className={`m3-segment-item ${trainSubView === "live" ? "active" : ""}`}
                  onClick={() => setTrainSubView("live")}
                >
                  <Activity size={16} /> Sesión en Vivo {liveWorkout ? "(Activa)" : ""}
                </button>
              </div>

              {/* LIVE SESSION */}
              {trainSubView === "live" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {!liveWorkout ? (
                    <div className="m3-card" style={{ textAlign: "center", padding: "40px 20px" }}>
                      <Dumbbell size={40} color="var(--md-sys-color-primary)" style={{ margin: "0 auto 12px auto" }} />
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>
                        Sin sesión activa
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--md-sys-color-on-surface-variant)", marginBottom: "20px" }}>
                        Selecciona un programa para comenzar a registrar series, peso y repeticiones.
                      </p>
                      <button
                        className="m3-btn-filled"
                        style={{ alignSelf: "center" }}
                        onClick={() => startWorkoutFromRoutine(GLP1_ROUTINES[0], 0)}
                      >
                        <Play size={16} fill="currentColor" /> Comenzar Rutina GLP-1
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="live-workout-header-card">
                        <div>
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--md-sys-color-primary)", letterSpacing: "0.08em" }}>
                            REGISTRO EN VIVO
                          </span>
                          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--md-sys-color-on-surface)" }}>
                            {liveWorkout.routineName}
                          </h3>
                          <span style={{ fontSize: "0.82rem", color: "var(--md-sys-color-on-surface-variant)" }}>
                            {liveWorkout.dayName}
                          </span>
                        </div>
                        <div className="workout-duration-pill num-tabular">
                          <Timer size={18} />
                          <span>
                            {Math.floor(liveSeconds / 60)}:{(liveSeconds % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      {/* Exercises in Session */}
                      {liveWorkout.exercises.map((exItem, exIdx) => (
                        <div key={exItem.id} className="m3-table-card">
                          <div className="table-ex-header">
                            <div className="table-ex-thumb">
                              <ExerciseArt slug={exItem.catalog.art} height={58} live={true} />
                            </div>
                            <div className="table-ex-info">
                              <h4 className="table-ex-name">{exItem.catalog.name}</h4>
                              <div className="table-ex-tags">
                                <span className="ex-tag-item">
                                  {MUSCLE_LABELS[exItem.catalog.primary]?.name || exItem.catalog.primary}
                                </span>
                                <span className="ex-tag-item">{exItem.catalog.equipment}</span>
                              </div>
                            </div>
                          </div>

                          <table className="m3-sets-table">
                            <thead>
                              <tr>
                                <th>SET</th>
                                <th>PESO ({unitLabel.toUpperCase()})</th>
                                <th>REPS</th>
                                <th>RPE</th>
                                <th>LISTO</th>
                              </tr>
                            </thead>
                            <tbody>
                              {exItem.sets.map((setObj, sIdx) => (
                                <tr key={sIdx} style={{ backgroundColor: setObj.completed ? "rgba(255, 138, 101, 0.08)" : "transparent" }}>
                                  <td className="set-index-cell">{setObj.setNumber}</td>
                                  <td>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      className="set-input-box num-tabular"
                                      value={setObj.weight}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const updated = [...liveWorkout.exercises];
                                        updated[exIdx].sets[sIdx].weight = val;
                                        setLiveWorkout({ ...liveWorkout, exercises: updated });
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      placeholder="10"
                                      className="set-input-box num-tabular"
                                      value={setObj.reps}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const updated = [...liveWorkout.exercises];
                                        updated[exIdx].sets[sIdx].reps = val;
                                        setLiveWorkout({ ...liveWorkout, exercises: updated });
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <select
                                      className="set-input-box num-tabular"
                                      style={{ width: "58px", padding: "8px 4px" }}
                                      value={setObj.rpe}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const updated = [...liveWorkout.exercises];
                                        updated[exIdx].sets[sIdx].rpe = val;
                                        setLiveWorkout({ ...liveWorkout, exercises: updated });
                                      }}
                                    >
                                      {[6, 7, 8, 9, 10].map((num) => (
                                        <option key={num} value={num}>
                                          {num}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td>
                                    <button
                                      className={`set-complete-btn ${setObj.completed ? "checked" : ""}`}
                                      onClick={() => toggleSetComplete(exIdx, sIdx)}
                                    >
                                      <Check size={18} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <button
                            className="add-set-link"
                            onClick={() => {
                              const updated = [...liveWorkout.exercises];
                              const curSets = updated[exIdx].sets;
                              const lastSet = curSets[curSets.length - 1] || { weight: "", reps: 10, rpe: 8 };
                              curSets.push({
                                setNumber: curSets.length + 1,
                                weight: lastSet.weight,
                                reps: lastSet.reps,
                                rpe: lastSet.rpe,
                                completed: false,
                              });
                              setLiveWorkout({ ...liveWorkout, exercises: updated });
                            }}
                          >
                            + Agregar Serie
                          </button>
                        </div>
                      ))}

                      <button
                        className="m3-btn-tertiary"
                        style={{ width: "100%", padding: "14px", marginTop: "8px" }}
                        onClick={finishLiveWorkout}
                      >
                        <CheckCircle2 size={18} /> Finalizar Sesión y Guardar
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* LIBRARY & BODYMAP */}
              {trainSubView === "library" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Search and Filters */}
                  <div className="m3-card" style={{ padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <Search size={18} color="var(--md-sys-color-outline)" />
                      <input
                        type="text"
                        placeholder="Buscar entre los 115 ejercicios de GymMane…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, border: "none", backgroundColor: "transparent", padding: 0 }}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")}>
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="m3-chips-flow">
                      <button
                        className={`m3-chip ${selectedEquipment === "all" ? "active" : ""}`}
                        onClick={() => setSelectedEquipment("all")}
                      >
                        Todo el equipamiento
                      </button>
                      {Object.entries(EQUIPMENT_LABELS).map(([k, label]) => (
                        <button
                          key={k}
                          className={`m3-chip ${selectedEquipment === k ? "active" : ""}`}
                          onClick={() => setSelectedEquipment(k)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive BodyMap */}
                  <div className="bodymap-surface-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 className="card-header-title">Filtro Muscular Anatómico</h3>
                        <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-outline)" }}>
                          Toca para ver ejercicios del grupo muscular
                        </span>
                      </div>

                      <div className="m3-segmented-button-row" style={{ width: "180px" }}>
                        <button
                          className={`m3-segment-item ${anatomySex === "female" ? "active" : ""}`}
                          onClick={() => setAnatomySex("female")}
                        >
                          Femenino
                        </button>
                        <button
                          className={`m3-segment-item ${anatomySex === "male" ? "active" : ""}`}
                          onClick={() => setAnatomySex("male")}
                        >
                          Masculino
                        </button>
                      </div>
                    </div>

                    <BodyMap
                      sex={anatomySex}
                      selectedMuscles={selectedMuscles}
                      onToggleMuscle={(mId) => {
                        setSelectedMuscles((prev) =>
                          prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
                        );
                      }}
                      highlightPriority={true}
                    />

                    {selectedMuscles.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-outline)" }}>Seleccionados:</span>
                        {selectedMuscles.map((mId) => (
                          <span key={mId} className="ex-tag-item" style={{ color: "var(--md-sys-color-primary)" }}>
                            {MUSCLE_LABELS[mId]?.name || mId}
                            <X
                              size={12}
                              style={{ cursor: "pointer", marginLeft: "4px" }}
                              onClick={() => setSelectedMuscles((prev) => prev.filter((id) => id !== mId))}
                            />
                          </span>
                        ))}
                        <button
                          style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", textDecoration: "underline" }}
                          onClick={() => setSelectedMuscles([])}
                        >
                          Restablecer
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Exercise Tiles */}
                  <div style={{ fontSize: "0.8rem", color: "var(--md-sys-color-outline)" }}>
                    {filteredExercises.length} ejercicios disponibles
                  </div>

                  <div className="m3-exercise-grid">
                    {filteredExercises.slice(0, 36).map((exercise) => (
                      <div
                        key={exercise.id}
                        className="m3-exercise-tile"
                        onClick={() => setActiveExerciseModal(exercise)}
                      >
                        <div className="tile-art-stage">
                          <ExerciseArt slug={exercise.art} height={110} live={false} />
                        </div>
                        <div className="tile-content-pad">
                          <h4 className="tile-name">{exercise.name}</h4>
                          <span className="tile-sub">{exercise.nameEn}</span>
                          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                            <span className="ex-tag-item" style={{ color: "var(--md-sys-color-primary)" }}>
                              {MUSCLE_LABELS[exercise.primary]?.name || exercise.primary}
                            </span>
                            <span className="ex-tag-item">{exercise.equipment}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* M3 Modal Sheet for Exercise Details */}
              {activeExerciseModal && (
                <div className="m3-modal-scrim" onClick={() => setActiveExerciseModal(null)}>
                  <div className="m3-modal-sheet" onClick={(e) => e.stopPropagation()}>
                    <div className="m3-drag-handle-bar"></div>
                    <div className="m3-modal-top">
                      <div>
                        <h3 className="m3-modal-title">{activeExerciseModal.name}</h3>
                        <span style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)" }}>
                          {activeExerciseModal.nameEn}
                        </span>
                      </div>
                      <button className="m3-icon-button" onClick={() => setActiveExerciseModal(null)}>
                        <X size={20} />
                      </button>
                    </div>

                    <div style={{ background: "#F8FAFC", padding: "16px", display: "flex", justifyContent: "center" }}>
                      <ExerciseArt slug={activeExerciseModal.art} height={200} live={true} />
                    </div>

                    <div className="m3-modal-body">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        <div className="m3-card" style={{ padding: "8px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.62rem", color: "var(--md-sys-color-outline)", textTransform: "uppercase" }}>Músculo</span>
                          <strong style={{ fontSize: "0.78rem", color: "var(--md-sys-color-primary)" }}>
                            {MUSCLE_LABELS[activeExerciseModal.primary]?.name || activeExerciseModal.primary}
                          </strong>
                        </div>
                        <div className="m3-card" style={{ padding: "8px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.62rem", color: "var(--md-sys-color-outline)", textTransform: "uppercase" }}>Equipo</span>
                          <strong style={{ fontSize: "0.78rem" }}>{activeExerciseModal.equipment}</strong>
                        </div>
                        <div className="m3-card" style={{ padding: "8px", textAlign: "center" }}>
                          <span style={{ fontSize: "0.62rem", color: "var(--md-sys-color-outline)", textTransform: "uppercase" }}>Nivel</span>
                          <strong style={{ fontSize: "0.78rem" }}>{DIFFICULTY_LABELS[activeExerciseModal.difficulty] || activeExerciseModal.difficulty}</strong>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>Técnica de Ejecución:</h4>
                        <ol style={{ paddingLeft: "18px", fontSize: "0.82rem", color: "var(--md-sys-color-on-surface-variant)", lineHeight: 1.45, display: "flex", flexDirection: "column", gap: "6px" }}>
                          {activeExerciseModal.steps.map((st, i) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ol>
                      </div>

                      <button
                        className="m3-btn-filled"
                        onClick={() => {
                          const quickRoutine = {
                            id: `quick-${activeExerciseModal.id}`,
                            name: `Sesión: ${activeExerciseModal.name}`,
                            days: [
                              {
                                dayName: "Serie directa",
                                exercises: [{ id: activeExerciseModal.id, sets: 3, reps: 12, restSec: 60 }],
                              },
                            ],
                          };
                          startWorkoutFromRoutine(quickRoutine, 0);
                          setActiveExerciseModal(null);
                        }}
                      >
                        <Play size={16} fill="currentColor" /> Iniciar Sesión con este Ejercicio
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PROGRAMAS (12 PROGRAMAS M3) */}
          {/* ========================================================================= */}
          {activeTab === "programas" && (
            <div className="tab-pane-view">
              {/* Segmented Filter */}
              <div className="m3-segmented-button-row">
                <button
                  className={`m3-segment-item ${programFilter === "all" ? "active" : ""}`}
                  onClick={() => setProgramFilter("all")}
                >
                  Todos (12)
                </button>
                <button
                  className={`m3-segment-item ${programFilter === "glp1" ? "active" : ""}`}
                  onClick={() => setProgramFilter("glp1")}
                >
                  Especiales GLP-1 (4)
                </button>
                <button
                  className={`m3-segment-item ${programFilter === "classic" ? "active" : ""}`}
                  onClick={() => setProgramFilter("classic")}
                >
                  Clásicos GymMane (8)
                </button>
              </div>

              {/* Program Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {GLP1_ROUTINES.filter((r) => {
                  if (programFilter === "glp1") return r.category === "glp1";
                  if (programFilter === "classic") return r.category === "classic";
                  return true;
                }).map((routine) => {
                  const isCurrentActive = profile.activeProgramId === routine.id;
                  return (
                    <div key={routine.id} className={`program-block-card ${isCurrentActive ? "active-program" : ""}`}>
                      <div className="program-block-top">
                        <div>
                          <div className="program-badge-line">
                            <span className={`program-tag ${routine.category === "glp1" ? "emerald" : ""}`}>
                              {routine.badge}
                            </span>
                            {isCurrentActive && (
                              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--md-sys-color-primary)" }}>
                                PROGRAMA ACTIVO
                              </span>
                            )}
                          </div>
                          <h3 className="program-block-name" style={{ marginTop: "4px" }}>
                            {routine.name}
                          </h3>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-outline)", fontWeight: 600 }}>
                          {routine.durationMin} min
                        </span>
                      </div>

                      <p className="program-desc-text">{routine.focus}</p>

                      {routine.glp1Tip && (
                        <div className="program-glp1-callout">
                          <strong>Indicación Clínica:</strong> {routine.glp1Tip}
                        </div>
                      )}

                      <div className="program-days-strip">
                        {routine.days.map((d, dIdx) => (
                          <div key={dIdx} className="program-day-row">
                            <div>
                              <span className="day-row-title">{d.dayName}</span>
                              <span className="day-row-count">({d.exercises.length} ejercicios)</span>
                            </div>
                            <button
                              className="btn-start-day"
                              onClick={() => startWorkoutFromRoutine(routine, dIdx)}
                            >
                              <Play size={12} fill="currentColor" /> Iniciar
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          className="m3-btn-outlined"
                          style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                          onClick={() => {
                            saveState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, activeProgramId: routine.id },
                            }));
                            showToast(`${routine.name} seleccionado como programa principal`);
                          }}
                        >
                          {isCurrentActive ? "Programa Asignado" : "Asignar a Mi Rutina"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: NUTRICIÓN (DIARIO + SEMÁFORO M3 + MENÚ POR FASE) */}
          {/* ========================================================================= */}
          {activeTab === "nutricion" && (
            <div className="tab-pane-view">
              {/* Segmented Buttons */}
              <div className="m3-segmented-button-row">
                <button
                  className={`m3-segment-item ${nutriSubView === "diary" ? "active" : ""}`}
                  onClick={() => setNutriSubView("diary")}
                >
                  <Utensils size={16} /> Diario de Macros
                </button>
                <button
                  className={`m3-segment-item ${nutriSubView === "traffic" ? "active" : ""}`}
                  onClick={() => setNutriSubView("traffic")}
                >
                  <ShieldCheck size={16} /> Semáforo de Alimentos
                </button>
                <button
                  className={`m3-segment-item ${nutriSubView === "phase_menu" ? "active" : ""}`}
                  onClick={() => setNutriSubView("phase_menu")}
                >
                  <Calendar size={16} /> Menú por Fase
                </button>
              </div>

              {/* DIARIO DE COMIDAS */}
              {nutriSubView === "diary" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Macro Progress Overview */}
                  <div className="m3-card">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
                      <div>
                        <span className="kpi-title">Proteína</span>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--md-sys-color-tertiary)" }} className="num-tabular">
                          {overview.totals.protein}g
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--md-sys-color-outline)" }}>Meta: {overview.proteinGoal}g</span>
                      </div>
                      <div>
                        <span className="kpi-title">Calorías</span>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--md-sys-color-primary)" }} className="num-tabular">
                          {overview.totals.kcal}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--md-sys-color-outline)" }}>Meta: {overview.caloriesGoal}</span>
                      </div>
                      <div>
                        <span className="kpi-title">Fibra Soluble</span>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--md-sys-color-on-surface)" }} className="num-tabular">
                          {overview.totals.fiber}g
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--md-sys-color-outline)" }}>Meta: 25g</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Food Form */}
                  <div className="m3-card">
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Añadir Alimento al Registro</h4>
                    <form onSubmit={addCustomMeal} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Descripción (ej. Pechuga de pollo, yogur griego…)"
                        value={customFoodName}
                        onChange={(e) => setCustomFoodName(e.target.value)}
                        required
                      />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "8px" }}>
                        <input
                          type="number"
                          placeholder="Proteína (g)"
                          value={customFoodProtein}
                          onChange={(e) => setCustomFoodProtein(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Kcal"
                          value={customFoodKcal}
                          onChange={(e) => setCustomFoodKcal(e.target.value)}
                        />
                        <select value={customFoodSlot} onChange={(e) => setCustomFoodSlot(e.target.value)}>
                          <option value="Desayuno">Desayuno</option>
                          <option value="Almuerzo">Almuerzo</option>
                          <option value="Cena">Cena</option>
                          <option value="Snack">Snack</option>
                        </select>
                      </div>
                      <button type="submit" className="m3-btn-filled" style={{ alignSelf: "flex-end" }}>
                        <Plus size={16} /> Registrar Alimento
                      </button>
                    </form>
                  </div>

                  {/* Meals Logged */}
                  {["Desayuno", "Almuerzo", "Cena", "Snack"].map((slotName) => {
                    const mealsInSlot = (state.nutritionByDate?.[currentDate]?.meals || []).filter(
                      (m) => m.slot === slotName
                    );
                    const slotProtein = mealsInSlot.reduce((s, m) => s + (Number(m.protein) || 0), 0);
                    return (
                      <div key={slotName} className="m3-card" style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>{slotName}</h4>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--md-sys-color-tertiary)" }}>
                            {slotProtein} g proteína
                          </span>
                        </div>

                        {mealsInSlot.length === 0 ? (
                          <span style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)" }}>
                            Sin registro en este horario
                          </span>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                            {mealsInSlot.map((meal) => (
                              <div
                                key={meal.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 10px",
                                  backgroundColor: "var(--md-sys-color-surface-container-high)",
                                  borderRadius: "var(--md-sys-shape-corner-extra-small)",
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{meal.name}</div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--md-sys-color-tertiary)" }}>
                                    {meal.protein}g proteína · {meal.kcal} kcal
                                  </div>
                                </div>
                                <button onClick={() => removeMeal(meal.id)} style={{ color: "var(--md-sys-color-outline)" }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SEMÁFORO DE ALIMENTOS */}
              {nutriSubView === "traffic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="m3-segmented-button-row">
                    <button
                      className={`m3-segment-item ${foodFilter === "green" ? "active" : ""}`}
                      onClick={() => setFoodFilter("green")}
                    >
                      Priorizar
                    </button>
                    <button
                      className={`m3-segment-item ${foodFilter === "yellow" ? "active" : ""}`}
                      onClick={() => setFoodFilter("yellow")}
                    >
                      Moderar
                    </button>
                    <button
                      className={`m3-segment-item ${foodFilter === "red" ? "active" : ""}`}
                      onClick={() => setFoodFilter("red")}
                    >
                      Evitar
                    </button>
                  </div>

                  <div className="m3-card" style={{ padding: "12px 16px", fontSize: "0.82rem", color: "var(--md-sys-color-on-surface-variant)" }}>
                    {foodFilter === "green" && (
                      <p>
                        <strong>Alimentos Recomendados:</strong> Proteínas magras y fibra hidrosoluble. Se digieren sin retrasar el vaciamiento gástrico y protegen el tejido contráctil.
                      </p>
                    )}
                    {foodFilter === "yellow" && (
                      <p>
                        <strong>Alimentos a Moderar:</strong> Grasas saludables y carbohidratos complejos. Consumir en porciones medidas tras haber ingerido la proteína base.
                      </p>
                    )}
                    {foodFilter === "red" && (
                      <p>
                        <strong>Alimentos No Aconsejados:</strong> Grasas saturadas y bebidas carbonatadas. Permanecen excesivo tiempo en el estómago provocando acidez, náusea o eructos de azufre.
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {FOOD_GUIDE.filter((f) => f.category === foodFilter).map((food) => (
                      <div key={food.id} className="clinical-food-card">
                        <div className="food-card-top">
                          <div>
                            <span className="food-card-title">{food.name}</span>
                            <span className="food-card-group">({food.group})</span>
                          </div>
                          {food.category !== "red" && (
                            <button
                              className="m3-btn-outlined"
                              style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                              onClick={() => addFoodFromGuide(food, "Almuerzo")}
                            >
                              + Añadir
                            </button>
                          )}
                        </div>

                        <div className="food-macro-strip">
                          <span>Porción: {food.portion}</span>
                          <span>Proteína: <strong className="green">{food.protein} g</strong></span>
                          <span>Kcal: {food.kcal}</span>
                        </div>

                        <div className="food-reason-text">
                          {food.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MENÚ POR FASE */}
              {nutriSubView === "phase_menu" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ fontSize: "0.82rem", color: "var(--md-sys-color-outline)" }}>
                    Estrategia de comidas adaptada a la curva farmacocinética de 7 días:
                  </div>

                  {MEAL_PLANS_BY_PHASE.map((phase) => {
                    const isCurrent = overview.cyclePhase.id === phase.id;
                    return (
                      <div
                        key={phase.id}
                        className="m3-card"
                        style={{ borderColor: isCurrent ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-outline-variant)" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span className="program-tag emerald">{phase.badge}</span>
                              {isCurrent && (
                                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--md-sys-color-tertiary)" }}>
                                  FASE DE HOY
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "4px" }}>{phase.title}</h4>
                          </div>
                        </div>

                        <p style={{ fontSize: "0.8rem", color: "var(--md-sys-color-on-surface-variant)" }}>
                          {phase.description}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                          {phase.meals.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                backgroundColor: "var(--md-sys-color-surface-container-high)",
                                padding: "10px",
                                borderRadius: "var(--md-sys-shape-corner-extra-small)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "3px",
                              }}
                            >
                              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--md-sys-color-primary)", textTransform: "uppercase" }}>
                                {m.slot}
                              </span>
                              <p style={{ fontSize: "0.8rem", color: "var(--md-sys-color-on-surface)" }}>{m.idea}</p>
                              <span style={{ fontSize: "0.72rem", color: "var(--md-sys-color-tertiary)", fontWeight: 600 }}>{m.macros}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: SEGUIMIENTO (INYECCIÓN + SÍNTOMAS + MÉTRICAS) */}
          {/* ========================================================================= */}
          {activeTab === "seguimiento" && (
            <div className="tab-pane-view">
              {/* Segmented Buttons */}
              <div className="m3-segmented-button-row">
                <button
                  className={`m3-segment-item ${trackingSubView === "injection" ? "active" : ""}`}
                  onClick={() => setTrackingSubView("injection")}
                >
                  <Syringe size={16} /> Inyección & Rotación
                </button>
                <button
                  className={`m3-segment-item ${trackingSubView === "symptoms" ? "active" : ""}`}
                  onClick={() => setTrackingSubView("symptoms")}
                >
                  <HeartPulse size={16} /> Control de Síntomas
                </button>
                <button
                  className={`m3-segment-item ${trackingSubView === "progress" ? "active" : ""}`}
                  onClick={() => setTrackingSubView("progress")}
                >
                  <TrendingUp size={16} /> Peso, Medidas e IMC
                </button>
              </div>

              {/* INYECCIÓN & ROTACIÓN */}
              {trackingSubView === "injection" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="m3-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 className="card-header-title">Rotación de 6 Sitios Anatómicos</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-outline)" }}>
                          Previene lipodistrofia subcutánea
                        </span>
                      </div>
                      <span className="treatment-active-pill">
                        Sugerido: {overview.nextSiteSuggestion.short}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
                      {INJECTION_SITES.map((site) => {
                        const isSuggested = overview.nextSiteSuggestion.id === site.id;
                        const isSelected = injSite === site.id;
                        return (
                          <div
                            key={site.id}
                            onClick={() => setInjSite(site.id)}
                            style={{
                              padding: "12px",
                              backgroundColor: "var(--md-sys-color-surface-container-high)",
                              border: isSelected
                                ? "1px solid var(--md-sys-color-primary)"
                                : isSuggested
                                ? "1px solid var(--md-sys-color-tertiary)"
                                : "1px solid var(--md-sys-color-outline-variant)",
                              borderRadius: "var(--md-sys-shape-corner-small)",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--md-sys-color-outline)", textTransform: "uppercase" }}>
                                {site.zone}
                              </span>
                              {isSuggested && (
                                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--md-sys-color-tertiary)" }}>
                                  Sugerido
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: "2px" }}>{site.label}</div>
                            <p style={{ fontSize: "0.72rem", color: "var(--md-sys-color-on-surface-variant)", marginTop: "4px" }}>{site.tip}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="m3-card">
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Registrar Dosis Semanal</h4>
                    <form onSubmit={handleAddInjection} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Dosis:</label>
                          <select value={injDose} onChange={(e) => setInjDose(e.target.value)} style={{ width: "100%" }}>
                            {currentMed.doses.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Sitio:</label>
                          <select value={injSite} onChange={(e) => setInjSite(e.target.value)} style={{ width: "100%" }}>
                            {INJECTION_SITES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Observaciones (ej. Buena tolerancia, hidratación previa)…"
                        value={injNotes}
                        onChange={(e) => setInjNotes(e.target.value)}
                      />

                      <button type="submit" className="m3-btn-filled" style={{ alignSelf: "flex-end" }}>
                        <Syringe size={16} /> Guardar Inyección
                      </button>
                    </form>
                  </div>

                  {/* Dose History */}
                  <div className="m3-card">
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Historial de Dosis</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {state.injections.map((inj) => {
                        const siteObj = INJECTION_SITES.find((s) => s.id === inj.site);
                        return (
                          <div
                            key={inj.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              backgroundColor: "var(--md-sys-color-surface-container-high)",
                              borderRadius: "var(--md-sys-shape-corner-extra-small)",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "0.85rem", color: "var(--md-sys-color-tertiary)" }}>{inj.dose}</strong>
                              <span style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", marginLeft: "8px" }}>
                                {siteObj?.label || inj.site}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-outline)" }}>{inj.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROL DE SÍNTOMAS */}
              {trackingSubView === "symptoms" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="m3-card">
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Reportar Síntoma del Día</h4>
                    <form onSubmit={handleAddSymptomLog} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Síntoma:</label>
                          <select value={selectedSymptomId} onChange={(e) => setSelectedSymptomId(e.target.value)} style={{ width: "100%" }}>
                            {SYMPTOM_CATALOG.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Severidad:</label>
                          <select value={symptomSeverity} onChange={(e) => setSymptomSeverity(e.target.value)} style={{ width: "100%" }}>
                            <option value="leve">Leve</option>
                            <option value="moderado">Moderado</option>
                            <option value="fuerte">Fuerte</option>
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Contexto o alimento previo ingerido…"
                        value={symptomNote}
                        onChange={(e) => setSymptomNote(e.target.value)}
                      />

                      <button type="submit" className="m3-btn-filled" style={{ alignSelf: "flex-end" }}>
                        <HeartPulse size={16} /> Guardar Síntoma
                      </button>
                    </form>
                  </div>

                  {/* 8 Symptoms Reference */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {SYMPTOM_CATALOG.map((sym) => (
                      <div key={sym.id} className="symptom-clinical-item">
                        <div className="symptom-item-header">
                          <span className="symptom-name-text">{sym.name}</span>
                          <span className="symptom-cat-badge">{sym.category}</span>
                        </div>

                        <div className="symptom-why-text">
                          <strong>Mecanismo fisiológico:</strong> {sym.whyItHappens}
                        </div>

                        <div className="symptom-actions-split">
                          <div className="symptom-box-eat">
                            <span className="box-title green">Medidas de alivio:</span>
                            <ul>
                              {sym.whatToEat.map((it, idx) => (
                                <li key={idx}>{it}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="symptom-box-avoid">
                            <span className="box-title red">Evitar:</span>
                            <ul>
                              {sym.whatToAvoid.map((it, idx) => (
                                <li key={idx}>{it}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESO, MEDIDAS, IMC Y HEATMAP */}
              {trackingSubView === "progress" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="metrics-twin-grid">
                    <div className="metric-kpi-card">
                      <span className="kpi-label">Peso Actual</span>
                      <div className="kpi-value-row">
                        <span className="kpi-main-number num-tabular">{overview.latestWeight}</span>
                        <span className="kpi-unit">{unitLabel}</span>
                      </div>
                      <span className="kpi-footer-sub">
                        -{overview.lostSoFar} {unitLabel} desde {overview.startWeight} {unitLabel}
                      </span>
                    </div>

                    <div className="metric-kpi-card">
                      <span className="kpi-label">Índice de Masa Corporal (IMC)</span>
                      <div className="kpi-value-row">
                        <span className="kpi-main-number num-tabular">{overview.bmi}</span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: overview.bmiColor }}>
                          {overview.bmiCategory}
                        </span>
                      </div>
                      <div className="bmi-bar-track">
                        <div
                          className="bmi-bar-fill"
                          style={{
                            width: `${Math.min(100, Math.max(10, ((overview.bmi - 15) / 25) * 100))}%`,
                            backgroundColor: overview.bmiColor,
                          }}
                        ></div>
                      </div>
                      <div className="bmi-bar-legend">
                        <span>18.5</span>
                        <span>25.0</span>
                        <span>30.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Weight Log Form */}
                  <div className="m3-card">
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Registrar Medida Corporal</h4>
                    <form onSubmit={handleAddWeight} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Peso ({unitLabel}):</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder={overview.latestWeight.toString()}
                            value={newWeightVal}
                            onChange={(e) => setNewWeightVal(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Cintura (cm):</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="cm"
                            value={newWaistCm}
                            onChange={(e) => setNewWaistCm(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "4px" }}>Cadera (cm):</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="cm"
                            value={newHipCm}
                            onChange={(e) => setNewHipCm(e.target.value)}
                          />
                        </div>
                      </div>

                      <button type="submit" className="m3-btn-filled" style={{ alignSelf: "flex-end" }}>
                        <Scale size={16} /> Guardar Medida
                      </button>
                    </form>
                  </div>

                  {/* 28-Day Consistency Heatmap */}
                  <div className="m3-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Constancia de Entrenamientos (28 Días)</h4>
                      <span className="treatment-active-pill">
                        <Zap size={12} /> {overview.weeklyWorkoutsCount} esta semana
                      </span>
                    </div>

                    <div className="heatmap-card-grid">
                      {Array.from({ length: 28 }, (_, i) => {
                        const dIso = offsetDate(todayISO(), -27 + i);
                        const hadWorkout = (state.workouts || []).some((w) => w.date === dIso);
                        return (
                          <div
                            key={dIso}
                            className={`heatmap-square ${hadWorkout ? "trained" : ""}`}
                            title={`${dIso}: ${hadWorkout ? "Entrenado" : "Descanso"}`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 3. M3 Bottom Navigation Bar (Mobile / Compact < 768px) */}
        <nav className="m3-navigation-bar" aria-label="Navegación principal inferior">
          {NAV_DESTINATIONS.map((dest) => {
            const Icon = dest.icon;
            const isActive = activeTab === dest.id;
            return (
              <button
                key={dest.id}
                className={`m3-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(dest.id)}
              >
                <div className="m3-nav-indicator">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="m3-nav-label">{dest.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* M3 Modal Sheet for Settings & Profile */}
      {settingsOpen && (
        <div className="m3-modal-scrim" onClick={() => setSettingsOpen(false)}>
          <div className="m3-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="m3-drag-handle-bar"></div>
            <div className="m3-modal-top">
              <h3 className="m3-modal-title">Perfil y Ajustes</h3>
              <button className="m3-icon-button" onClick={() => setSettingsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="m3-modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", fontWeight: 700 }}>Nombre de usuario:</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    saveState((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value },
                    }))
                  }
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", fontWeight: 700 }}>Unidad de Peso:</label>
                    <select
                      value={profile.unit}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, unit: e.target.value },
                        }))
                      }
                      style={{ width: "100%" }}
                    >
                      <option value="lb">Libras (lb)</option>
                      <option value="kg">Kilogramos (kg)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", fontWeight: 700 }}>Meta Proteína (g):</label>
                    <input
                      type="number"
                      value={profile.proteinGoalG}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, proteinGoalG: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", fontWeight: 700 }}>Peso Meta ({unitLabel}):</label>
                    <input
                      type="number"
                      value={profile.goalWeight}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, goalWeight: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", color: "var(--md-sys-color-outline)", fontWeight: 700 }}>Estatura (cm):</label>
                    <input
                      type="number"
                      value={profile.heightCm}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, heightCm: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--md-sys-color-outline-variant)", paddingTop: "14px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--md-sys-color-outline)", display: "block", marginBottom: "8px" }}>
                  Almacenamiento Local (100% Offline y Privado)
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="m3-btn-outlined" style={{ flex: 1 }} onClick={exportBackup}>
                    <Download size={16} /> Exportar JSON
                  </button>
                  <label className="m3-btn-outlined" style={{ flex: 1, cursor: "pointer" }}>
                    <Upload size={16} /> Importar JSON
                    <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <button
                className="m3-btn-tonal"
                style={{ color: "var(--md-sys-color-error)", marginTop: "6px" }}
                onClick={() => {
                  if (confirm("¿Deseas restablecer los valores de fábrica?")) {
                    saveState(defaultState());
                    showToast("Valores restablecidos");
                    setSettingsOpen(false);
                  }
                }}
              >
                <RotateCcw size={16} /> Restablecer Valores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M3 Snackbar Toast */}
      {toastMessage && (
        <div className="m3-snackbar">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
