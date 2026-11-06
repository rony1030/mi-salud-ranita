"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
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
  RefreshCw,
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
  Volume2,
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

const NAV_TABS = [
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
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export default function GymManeApp() {
  const [state, setState] = useState(null);
  const [activeTab, setActiveTab] = useState("hoy");
  const [toastMessage, setToastMessage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => todayISO());

  // Subview toggles within tabs
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

  // Program filters & Custom routine modal
  const [programFilter, setProgramFilter] = useState("all"); // 'all' | 'glp1' | 'classic' | 'custom'
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineDays, setNewRoutineDays] = useState("3 días/sem");
  const [newRoutineFocus, setNewRoutineFocus] = useState("");
  const [newRoutineExercises, setNewRoutineExercises] = useState([]);

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

  // Save to localStorage
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
          showToast("⏱️ ¡Descanso finalizado! Lista para la siguiente serie.");
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

  const allRoutines = useMemo(() => {
    const builtIn = GLP1_ROUTINES;
    const custom = state?.customRoutines || [];
    return [...builtIn, ...custom];
  }, [state?.customRoutines]);

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
    const exercisesInSession = day.exercises.map((item, idx) => {
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
    showToast(`🏋️ Sesión iniciada: ${routine.name}`);
  };

  // Complete a set in live workout
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
      // Check PR
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
          showToast(`🏆 ¡NUEVO RÉCORD PERSONAL (PR) en ${targetEx.catalog.name}! ${weightNum} ${state?.profile?.unit || "lb"}`);
        }
      }
      startRestTimer(targetEx.restSec || 60);
    }
  };

  // Finish live workout
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
    showToast(`✅ ¡Entrenamiento completado! ${totalSetsDone} series finalizadas · ${totalVolume} ${state?.profile?.unit || "lb"} de volumen.`);
  };

  // Water increment
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
    showToast("💧 +1 Vaso de agua registrado (+250 ml)");
  };

  // Electrolytes toggle
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

  // Add meal from food guide
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
    showToast(`🍴 Añadido a ${slot}: ${foodItem.name} (+${foodItem.protein}g proteína)`);
  };

  // Remove meal
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
    showToast("Eliminado del diario de hoy");
  };

  // Add custom meal
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
    showToast(`🍴 Registrado: ${newMeal.name} (+${proteinNum}g proteína)`);
  };

  // Add injection
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
    showToast(`💉 Dosis semanal de ${injDose} registrada exitosamente.`);
  };

  // Add symptom log
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
    showToast(`🩺 Síntoma registrado: ${symObj?.name} (${symptomSeverity})`);
  };

  // Add weight entry
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
    showToast(`⚖️ Peso actualizado a ${w} ${state?.profile?.unit || "lb"}`);
  };

  // Export JSON backup
  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `GymMane-GLP1-Backup-${todayISO()}.json`);
    dlAnchorElem.click();
    showToast("💾 Respaldo JSON descargado");
  };

  // Import JSON backup
  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.profile) {
          saveState(imported);
          showToast("✅ Respaldo restaurado con éxito");
          setSettingsOpen(false);
        } else {
          showToast("❌ Archivo de respaldo no válido");
        }
      } catch {
        showToast("❌ Error al leer archivo JSON");
      }
    };
    reader.readAsText(file);
  };

  if (!state || !overview) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <Dumbbell className="spin-icon" size={42} color="#FF6B35" />
          <p className="loading-text">Cargando GymMane GLP-1…</p>
        </div>
      </main>
    );
  }

  const { profile } = state;
  const currentMed = MEDICATIONS.find((m) => m.id === profile.medicationId) || MEDICATIONS[0];
  const unitLabel = profile.unit || "lb";

  return (
    <div className="app-viewport">
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="header-brand" onClick={() => setActiveTab("hoy")}>
          <div className="header-logo-badge">
            <Dumbbell size={20} color="#FF6B35" />
          </div>
          <div>
            <h1 className="header-title">GymMane</h1>
            <div className="header-subtitle-tag">
              <span className="dot-glp1"></span> GLP-1 CLINICAL
            </div>
          </div>
        </div>

        <div className="header-right-actions">
          <div className="header-user-badge" onClick={() => setSettingsOpen(true)}>
            <div className="user-avatar-circle">
              <User size={14} />
            </div>
            <div className="user-info-text">
              <span className="user-name">{profile.name}</span>
              <span className="user-weight">
                {overview.latestWeight} {unitLabel}
              </span>
            </div>
          </div>

          <button
            className="header-icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label="Ajustes de Perfil"
            title="Ajustes de Perfil"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Floating Rest Timer (Active Workout) */}
      {restActive && (
        <aside className="floating-rest-timer">
          <div className="rest-timer-left">
            <Timer className="timer-pulse" size={20} color="#FF6B35" />
            <div>
              <div className="rest-timer-label">DESCANSO ENTRE SERIES</div>
              <div className="rest-timer-countdown">
                {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
          <div className="rest-timer-actions">
            <button
              className="rest-action-btn plus"
              onClick={() => setRestSeconds((s) => s + 15)}
              title="+15 segundos"
            >
              +15s
            </button>
            <button
              className="rest-action-btn skip"
              onClick={() => {
                setRestActive(false);
                setRestSeconds(0);
              }}
            >
              Saltar
            </button>
          </div>
        </aside>
      )}

      {/* Live Workout Banner if running and user navigates elsewhere */}
      {liveWorkout && activeTab !== "entrenar" && (
        <div className="live-workout-sticky-bar" onClick={() => setActiveTab("entrenar")}>
          <div className="sticky-bar-info">
            <span className="recording-dot"></span>
            <strong>Entrenamiento activo:</strong> {liveWorkout.routineName} (
            {Math.floor(liveSeconds / 60)}:{(liveSeconds % 60).toString().padStart(2, "0")})
          </div>
          <button className="sticky-bar-btn">Ver Sesión &rarr;</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="app-main-content">
        {/* ========================================================================= */}
        {/* TAB 1: HOY (DASHBOARD) */}
        {/* ========================================================================= */}
        {activeTab === "hoy" && (
          <section className="tab-section tab-fade-in">
            {/* Treatment Hero Card */}
            <div className="treatment-hero-card">
              <div className="treatment-badge-row">
                <span className="clinical-pill">
                  <ShieldCheck size={14} /> {currentMed.name}
                </span>
                <span className="dose-pill">{profile.currentDose}</span>
                <span className="goal-pill">
                  Meta: {profile.goalWeight} {unitLabel}
                </span>
              </div>

              <div className="hero-status-message">
                <h2 className="status-title">{overview.title}</h2>
                <p className="status-caption">{overview.caption}</p>
              </div>

              {/* 7-Day Cycle Progress Bar */}
              <div className="cycle-bar-box">
                <div className="cycle-bar-header">
                  <span className="cycle-label">
                    DÍA {overview.daysSinceInjection !== null ? overview.daysSinceInjection + 1 : 1} DE 7
                  </span>
                  <span className="cycle-phase-name">{overview.cyclePhase.title.split("·")[1] || "Ciclo Semanal"}</span>
                </div>
                <div className="cycle-track">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                    const isPassed = overview.daysSinceInjection !== null && dayIdx < overview.daysSinceInjection;
                    const isCurrent = overview.daysSinceInjection === dayIdx;
                    return (
                      <div
                        key={dayIdx}
                        className={`cycle-segment ${isPassed ? "passed" : ""} ${isCurrent ? "current" : ""}`}
                        title={`Día ${dayIdx + 1}`}
                      ></div>
                    );
                  })}
                </div>
                <div className="cycle-footer-meta">
                  <span>
                    Próxima dosis en: <strong>{overview.daysUntilNextInjection} días</strong>
                  </span>
                  <span>
                    Zona sugerida: <strong>{overview.nextSiteSuggestion.short}</strong>
                  </span>
                </div>
              </div>

              <div className="hero-quick-actions">
                <button
                  className="quick-action-btn primary"
                  onClick={() => {
                    setActiveTab("seguimiento");
                    setTrackingSubView("injection");
                  }}
                >
                  <Syringe size={16} /> Registrar Dosis
                </button>
                <button
                  className="quick-action-btn secondary"
                  onClick={() => {
                    setActiveTab("seguimiento");
                    setTrackingSubView("symptoms");
                  }}
                >
                  <HeartPulse size={16} /> Reportar Síntoma
                </button>
              </div>
            </div>

            {/* Nutrition & Macro Rings */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h3 className="section-title">
                  <Flame size={18} color="#FF6B35" /> Nutrición y Macros
                </h3>
                <button className="card-link-btn" onClick={() => setActiveTab("nutricion")}>
                  Ver Diario &rarr;
                </button>
              </div>

              <div className="macro-rings-grid">
                {/* Protein - Hero Ring */}
                <div className="macro-card hero-protein">
                  <div className="macro-ring-svg-wrap">
                    <svg viewBox="0 0 36 36" className="circular-chart emerald">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${overview.proteinPct}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="ring-center-value">
                      <span className="big-num">{overview.totals.protein}g</span>
                      <span className="unit-sub">de {overview.proteinGoal}g</span>
                    </div>
                  </div>
                  <div className="macro-info-col">
                    <div className="macro-badge-row">
                      <span className="macro-name">PROTEÍNA</span>
                      <span className="macro-pct-badge">{overview.proteinPct}%</span>
                    </div>
                    <p className="macro-tip">Protege tus glúteos y masa muscular contra la flacidez.</p>
                  </div>
                </div>

                {/* Calories, Carbs, Fats Mini Rings */}
                <div className="macro-mini-row">
                  <div className="mini-macro-item">
                    <span className="mini-macro-val">{overview.totals.kcal}</span>
                    <span className="mini-macro-label">KCAL</span>
                    <div className="mini-progress-bar">
                      <div
                        className="mini-progress-fill orange"
                        style={{ width: `${Math.min(100, (overview.totals.kcal / overview.caloriesGoal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mini-macro-item">
                    <span className="mini-macro-val">{overview.totals.carbs}g</span>
                    <span className="mini-macro-label">CARBOS</span>
                    <div className="mini-progress-bar">
                      <div
                        className="mini-progress-fill cyan"
                        style={{ width: `${Math.min(100, (overview.totals.carbs / 150) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mini-macro-item">
                    <span className="mini-macro-val">{overview.totals.fat}g</span>
                    <span className="mini-macro-label">GRASAS</span>
                    <div className="mini-progress-bar">
                      <div
                        className="mini-progress-fill yellow"
                        style={{ width: `${Math.min(100, (overview.totals.fat / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Water & Electrolytes quick tracker */}
              <div className="hydration-row">
                <div className="water-glasses-col">
                  <div className="water-label-top">
                    <Droplets size={16} color="#38BDF8" />
                    <span>
                      Hidratación: <strong>{overview.waterGlasses}</strong> / {overview.waterGoal} vasos (
                      {overview.waterGlasses * 250} ml)
                    </span>
                  </div>
                  <div className="glasses-icons-list">
                    {Array.from({ length: overview.waterGoal }, (_, idx) => (
                      <span
                        key={idx}
                        className={`glass-icon ${idx < overview.waterGlasses ? "filled" : ""}`}
                        onClick={addWaterGlass}
                        title="Toca para registrar vaso"
                      >
                        💧
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hydration-buttons-col">
                  <button className="add-water-btn" onClick={addWaterGlass}>
                    <Plus size={16} /> +1 Vaso
                  </button>
                  <label className="electrolytes-checkbox">
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

            {/* Today's Workout Card */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h3 className="section-title">
                  <Dumbbell size={18} color="#FF6B35" /> Entrenamiento Programado
                </h3>
                <span className="streak-badge">
                  <Zap size={14} /> {overview.weeklyWorkoutsCount} esta semana
                </span>
              </div>

              {(() => {
                const activeProg =
                  allRoutines.find((r) => r.id === profile.activeProgramId) || GLP1_ROUTINES[0];
                const dayOne = activeProg.days[0];
                return (
                  <div className="program-preview-box">
                    <div className="program-preview-header">
                      <div>
                        <h4 className="prog-title">{activeProg.name}</h4>
                        <p className="prog-day-name">{dayOne.dayName}</p>
                      </div>
                      <span className="prog-duration-chip">
                        <Clock size={12} /> {activeProg.durationMin} min
                      </span>
                    </div>

                    <div className="prog-exercises-pill-list">
                      {dayOne.exercises.slice(0, 4).map((exItem) => {
                        const exData = getExerciseById(exItem.id);
                        return (
                          <span key={exItem.id} className="exercise-pill">
                            {exData?.name || "Ejercicio"}
                          </span>
                        );
                      })}
                      {dayOne.exercises.length > 4 && (
                        <span className="exercise-pill more">+{dayOne.exercises.length - 4} más</span>
                      )}
                    </div>

                    <div className="prog-actions-row">
                      <button
                        className="start-workout-cta-btn"
                        onClick={() => startWorkoutFromRoutine(activeProg, 0)}
                      >
                        <Play size={16} fill="currentColor" /> Iniciar Sesión de Hoy
                      </button>
                      <button
                        className="browse-all-btn"
                        onClick={() => {
                          setActiveTab("programas");
                        }}
                      >
                        Cambiar Programa
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Symptom Relief Pill (If any symptom today) */}
            <div className="dashboard-card symptom-relief-card">
              <div className="card-header-row">
                <h3 className="section-title">
                  <Sparkles size={18} color="#10B981" /> Alivio y Digestión GLP-1
                </h3>
                <button
                  className="card-link-btn"
                  onClick={() => {
                    setActiveTab("seguimiento");
                    setTrackingSubView("symptoms");
                  }}
                >
                  Catálogo Clínico &rarr;
                </button>
              </div>

              <div className="symptom-quick-chips">
                {SYMPTOM_CATALOG.slice(0, 4).map((sym) => (
                  <button
                    key={sym.id}
                    className="symptom-quick-chip"
                    onClick={() => {
                      setActiveTab("seguimiento");
                      setTrackingSubView("symptoms");
                      setSelectedSymptomId(sym.id);
                    }}
                  >
                    <span>{sym.icon}</span>
                    <span>{sym.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ENTRENAR (GYMMANE WORKOUT + BODYMAP + 115 EXERCISES) */}
        {/* ========================================================================= */}
        {activeTab === "entrenar" && (
          <section className="tab-section tab-fade-in">
            {/* View Selector Tabs */}
            <div className="subview-nav-bar">
              <button
                className={`subview-nav-btn ${trainSubView === "library" ? "active" : ""}`}
                onClick={() => setTrainSubView("library")}
              >
                <Dumbbell size={16} /> Biblioteca & Mapa Corporal
              </button>
              <button
                className={`subview-nav-btn ${trainSubView === "live" ? "active" : ""}`}
                onClick={() => setTrainSubView("live")}
              >
                <Activity size={16} /> Sesión en Vivo {liveWorkout ? "(1 activa)" : ""}
              </button>
            </div>

            {/* SUBVIEW A: LIVE WORKOUT */}
            {trainSubView === "live" && (
              <div className="live-workout-container">
                {!liveWorkout ? (
                  <div className="empty-live-box">
                    <Dumbbell size={48} color="#FF6B35" />
                    <h3>No hay un entrenamiento activo</h3>
                    <p>Elige una rutina de los programas o selecciona ejercicios de la biblioteca para comenzar.</p>
                    <button
                      className="cta-primary-btn"
                      onClick={() => {
                        const defaultProg = GLP1_ROUTINES[0];
                        startWorkoutFromRoutine(defaultProg, 0);
                      }}
                    >
                      <Play size={16} fill="currentColor" /> Iniciar Rutina Recomendada GLP-1
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Live Workout Header */}
                    <div className="live-header-card">
                      <div className="live-header-top">
                        <div>
                          <span className="live-status-pill">
                            <span className="recording-dot"></span> EN VIVO
                          </span>
                          <h2 className="live-routine-title">{liveWorkout.routineName}</h2>
                          <p className="live-day-title">{liveWorkout.dayName}</p>
                        </div>
                        <div className="live-clock-box">
                          <Timer size={18} color="#FF6B35" />
                          <span className="live-timer-digits">
                            {Math.floor(liveSeconds / 60)}:{(liveSeconds % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      <div className="live-header-actions">
                        <button className="finish-workout-btn" onClick={finishLiveWorkout}>
                          <CheckCircle2 size={16} /> Finalizar Entrenamiento
                        </button>
                      </div>
                    </div>

                    {/* Exercises In Live Session */}
                    <div className="live-exercises-list">
                      {liveWorkout.exercises.map((exItem, exIdx) => {
                        return (
                          <div key={exItem.id} className="live-exercise-card">
                            <div className="live-ex-header">
                              <div className="live-ex-art-thumb">
                                <ExerciseArt slug={exItem.catalog.art} height={70} live={true} />
                              </div>
                              <div className="live-ex-info">
                                <h3 className="live-ex-name">{exItem.catalog.name}</h3>
                                <div className="live-ex-badges">
                                  <span className="badge-pill orange">
                                    {MUSCLE_LABELS[exItem.catalog.primary]?.name || exItem.catalog.primary}
                                  </span>
                                  <span className="badge-pill neutral">{exItem.catalog.equipment}</span>
                                </div>
                                {exItem.note && <p className="live-ex-note">💡 {exItem.note}</p>}
                              </div>
                            </div>

                            {/* Sets Table */}
                            <div className="sets-table-wrapper">
                              <table className="sets-table">
                                <thead>
                                  <tr>
                                    <th>SERIE</th>
                                    <th>PESO ({unitLabel.toUpperCase()})</th>
                                    <th>REPS</th>
                                    <th>RPE</th>
                                    <th>✓</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exItem.sets.map((setObj, sIdx) => (
                                    <tr key={sIdx} className={setObj.completed ? "set-row-completed" : ""}>
                                      <td className="set-num-cell">{setObj.setNumber}</td>
                                      <td>
                                        <input
                                          type="number"
                                          placeholder="0"
                                          className="set-input weight"
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
                                          className="set-input reps"
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
                                          className="set-select rpe"
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
                                          className={`set-check-btn ${setObj.completed ? "checked" : ""}`}
                                          onClick={() => toggleSetComplete(exIdx, sIdx)}
                                        >
                                          <Check size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <div className="add-set-row">
                                <button
                                  className="add-set-btn"
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
                                  <Plus size={14} /> Agregar Serie
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBVIEW B: LIBRARY & BODYMAP */}
            {trainSubView === "library" && (
              <div className="exercise-library-container">
                {/* Search & Filter Bar */}
                <div className="search-filter-card">
                  <div className="search-input-wrap">
                    <Search size={18} color="#9CA3AF" />
                    <input
                      type="text"
                      placeholder="Buscar ejercicio por nombre en español o inglés…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Equipment Pills */}
                  <div className="equipment-chips-row">
                    <button
                      className={`equipment-chip ${selectedEquipment === "all" ? "active" : ""}`}
                      onClick={() => setSelectedEquipment("all")}
                    >
                      Todos los equipos
                    </button>
                    {Object.entries(EQUIPMENT_LABELS).map(([k, label]) => (
                      <button
                        key={k}
                        className={`equipment-chip ${selectedEquipment === k ? "active" : ""}`}
                        onClick={() => setSelectedEquipment(k)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive BodyMap */}
                <div className="bodymap-container-card">
                  <div className="bodymap-header-row">
                    <div>
                      <h3 className="section-title">Mapa Muscular Anatómico</h3>
                      <p className="section-subtitle">Toca un músculo para filtrar los 115 ejercicios.</p>
                    </div>

                    <div className="sex-toggle-group">
                      <button
                        className={`sex-toggle-btn ${anatomySex === "female" ? "active" : ""}`}
                        onClick={() => setAnatomySex("female")}
                      >
                        Femenino
                      </button>
                      <button
                        className={`sex-toggle-btn ${anatomySex === "male" ? "active" : ""}`}
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
                    <div className="active-muscles-chips">
                      <span>Músculos seleccionados:</span>
                      {selectedMuscles.map((mId) => (
                        <span key={mId} className="active-muscle-chip">
                          {MUSCLE_LABELS[mId]?.name || mId}
                          <X
                            size={12}
                            onClick={() => setSelectedMuscles((prev) => prev.filter((id) => id !== mId))}
                          />
                        </span>
                      ))}
                      <button className="clear-all-muscles" onClick={() => setSelectedMuscles([])}>
                        Limpiar filtro
                      </button>
                    </div>
                  )}
                </div>

                {/* Exercise Cards Grid */}
                <div className="exercises-results-header">
                  <span>
                    Mostrando <strong>{filteredExercises.length}</strong> de 115 ejercicios
                  </span>
                </div>

                <div className="exercise-cards-grid">
                  {filteredExercises.slice(0, 30).map((exercise) => {
                    return (
                      <div
                        key={exercise.id}
                        className="exercise-card"
                        onClick={() => setActiveExerciseModal(exercise)}
                      >
                        <div className="exercise-card-art">
                          <ExerciseArt slug={exercise.art} height={120} live={false} />
                        </div>
                        <div className="exercise-card-body">
                          <h4 className="ex-title">{exercise.name}</h4>
                          <span className="ex-name-en">{exercise.nameEn}</span>
                          <div className="ex-tags-row">
                            <span className="ex-badge primary">
                              {MUSCLE_LABELS[exercise.primary]?.name || exercise.primary}
                            </span>
                            <span className="ex-badge eq">{exercise.equipment}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Exercise Detail Modal */}
            {activeExerciseModal && (
              <div className="modal-overlay" onClick={() => setActiveExerciseModal(null)}>
                <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">{activeExerciseModal.name}</h3>
                      <p className="modal-subtitle">{activeExerciseModal.nameEn}</p>
                    </div>
                    <button className="modal-close-btn" onClick={() => setActiveExerciseModal(null)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="modal-art-stage">
                    <ExerciseArt slug={activeExerciseModal.art} height={220} live={true} />
                  </div>

                  <div className="modal-body-content">
                    <div className="modal-meta-grid">
                      <div className="meta-box">
                        <span className="meta-label">MÚSCULO PRINCIPAL</span>
                        <span className="meta-val orange">
                          {MUSCLE_LABELS[activeExerciseModal.primary]?.name || activeExerciseModal.primary}
                        </span>
                      </div>
                      <div className="meta-box">
                        <span className="meta-label">EQUIPAMIENTO</span>
                        <span className="meta-val">{activeExerciseModal.equipment}</span>
                      </div>
                      <div className="meta-box">
                        <span className="meta-label">DIFICULTAD</span>
                        <span className="meta-val">
                          {DIFFICULTY_LABELS[activeExerciseModal.difficulty] || activeExerciseModal.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="modal-steps-section">
                      <h4 className="steps-title">Instrucciones Paso a Paso:</h4>
                      <ol className="steps-list">
                        {activeExerciseModal.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="modal-actions-footer">
                      <button
                        className="modal-action-btn primary"
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
                        <Play size={16} fill="currentColor" /> Entrenar Este Ejercicio Ahora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROGRAMAS (12 RUTINAS: 8 GYMMANE + 4 GLP-1 + CREADOR) */}
        {/* ========================================================================= */}
        {activeTab === "programas" && (
          <section className="tab-section tab-fade-in">
            {/* Filter Chips */}
            <div className="filter-chips-bar">
              <button
                className={`filter-chip ${programFilter === "all" ? "active" : ""}`}
                onClick={() => setProgramFilter("all")}
              >
                Todos (12)
              </button>
              <button
                className={`filter-chip ${programFilter === "glp1" ? "active" : ""}`}
                onClick={() => setProgramFilter("glp1")}
              >
                Especiales GLP-1 (4)
              </button>
              <button
                className={`filter-chip ${programFilter === "classic" ? "active" : ""}`}
                onClick={() => setProgramFilter("classic")}
              >
                Clásicos GymMane (8)
              </button>
              <button
                className={`filter-chip ${programFilter === "custom" ? "active" : ""}`}
                onClick={() => setProgramFilter("custom")}
              >
                Mis Rutinas ({state.customRoutines?.length || 0})
              </button>
            </div>

            {/* Routines Grid */}
            <div className="programs-grid">
              {allRoutines
                .filter((r) => {
                  if (programFilter === "glp1") return r.category === "glp1";
                  if (programFilter === "classic") return r.category === "classic";
                  if (programFilter === "custom") return r.isCustom === true;
                  return true;
                })
                .map((routine) => {
                  const isCurrentActive = profile.activeProgramId === routine.id;
                  return (
                    <div key={routine.id} className={`program-card ${isCurrentActive ? "is-active-program" : ""}`}>
                      <div className="program-card-header">
                        <div>
                          <div className="program-badge-row">
                            <span className={`program-cat-badge ${routine.category === "glp1" ? "emerald" : "orange"}`}>
                              {routine.badge}
                            </span>
                            {isCurrentActive && <span className="active-label">PROGRAMA ACTIVO</span>}
                          </div>
                          <h3 className="program-title">{routine.name}</h3>
                          <p className="program-focus">{routine.focus}</p>
                        </div>
                        <div className="program-duration-box">
                          <Clock size={14} />
                          <span>{routine.durationMin} min</span>
                        </div>
                      </div>

                      {routine.glp1Tip && (
                        <div className="program-glp1-tip">
                          <strong>Consejo Clínico:</strong> {routine.glp1Tip}
                        </div>
                      )}

                      {/* Days preview */}
                      <div className="program-days-accordion">
                        {routine.days.map((d, dIdx) => (
                          <div key={dIdx} className="program-day-item">
                            <div className="day-item-header">
                              <span className="day-name">{d.dayName}</span>
                              <span className="day-ex-count">{d.exercises.length} ejercicios</span>
                            </div>
                            <div className="day-actions">
                              <button
                                className="start-day-btn"
                                onClick={() => startWorkoutFromRoutine(routine, dIdx)}
                              >
                                <Play size={14} fill="currentColor" /> Iniciar Día
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="program-card-footer">
                        <button
                          className="set-active-program-btn"
                          onClick={() => {
                            saveState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, activeProgramId: routine.id },
                            }));
                            showToast(`🌟 ${routine.name} fijado como programa principal.`);
                          }}
                        >
                          {isCurrentActive ? "Programa Principal Fijado" : "Fijar como Mi Programa"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NUTRICIÓN (DIARIO + SEMÁFORO GLP-1 + MENÚ POR FASE) */}
        {/* ========================================================================= */}
        {activeTab === "nutricion" && (
          <section className="tab-section tab-fade-in">
            {/* View Selector */}
            <div className="subview-nav-bar">
              <button
                className={`subview-nav-btn ${nutriSubView === "diary" ? "active" : ""}`}
                onClick={() => setNutriSubView("diary")}
              >
                <Utensils size={16} /> Diario y Macros
              </button>
              <button
                className={`subview-nav-btn ${nutriSubView === "traffic" ? "active" : ""}`}
                onClick={() => setNutriSubView("traffic")}
              >
                <ShieldCheck size={16} /> Semáforo GLP-1
              </button>
              <button
                className={`subview-nav-btn ${nutriSubView === "phase_menu" ? "active" : ""}`}
                onClick={() => setNutriSubView("phase_menu")}
              >
                <Calendar size={16} /> Menú por Fase (7 Días)
              </button>
            </div>

            {/* SUBVIEW A: DIARIO DE COMIDAS */}
            {nutriSubView === "diary" && (
              <div className="nutrition-diary-wrap">
                {/* Hero Macro Cards */}
                <div className="diary-macro-summary-card">
                  <div className="diary-rings-row">
                    <div className="diary-macro-circle emerald">
                      <span className="circle-val">{overview.totals.protein}g</span>
                      <span className="circle-lbl">PROTEÍNA</span>
                      <span className="circle-sub">Meta: {overview.proteinGoal}g</span>
                    </div>
                    <div className="diary-macro-circle orange">
                      <span className="circle-val">{overview.totals.kcal}</span>
                      <span className="circle-lbl">CALORÍAS</span>
                      <span className="circle-sub">Meta: {overview.caloriesGoal}</span>
                    </div>
                    <div className="diary-macro-circle cyan">
                      <span className="circle-val">{overview.totals.carbs}g</span>
                      <span className="circle-lbl">CARBOS</span>
                      <span className="circle-sub">Fibra: {overview.totals.fiber}g</span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Custom Food Form */}
                <div className="add-food-card">
                  <h4 className="card-subtitle">Registrar Comida Rápida</h4>
                  <form onSubmit={addCustomMeal} className="add-food-form">
                    <input
                      type="text"
                      placeholder="Ej: Pechuga a la plancha, Avena con chía…"
                      value={customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      className="form-input"
                      required
                    />
                    <div className="form-row-multi">
                      <input
                        type="number"
                        placeholder="Proteína (g)"
                        value={customFoodProtein}
                        onChange={(e) => setCustomFoodProtein(e.target.value)}
                        className="form-input"
                      />
                      <input
                        type="number"
                        placeholder="Calorías (kcal)"
                        value={customFoodKcal}
                        onChange={(e) => setCustomFoodKcal(e.target.value)}
                        className="form-input"
                      />
                      <select
                        value={customFoodSlot}
                        onChange={(e) => setCustomFoodSlot(e.target.value)}
                        className="form-select"
                      >
                        <option value="Desayuno">Desayuno</option>
                        <option value="Almuerzo">Almuerzo</option>
                        <option value="Cena">Cena</option>
                        <option value="Merienda / Snack">Merienda / Snack</option>
                      </select>
                    </div>
                    <button type="submit" className="submit-food-btn">
                      <Plus size={16} /> Añadir al Diario de Hoy
                    </button>
                  </form>
                </div>

                {/* Logged Meals by Slot */}
                <div className="logged-meals-section">
                  {["Desayuno", "Almuerzo", "Cena", "Merienda / Snack"].map((slotName) => {
                    const mealsInSlot = (state.nutritionByDate?.[currentDate]?.meals || []).filter(
                      (m) => m.slot === slotName
                    );
                    const slotProtein = mealsInSlot.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
                    return (
                      <div key={slotName} className="slot-group-card">
                        <div className="slot-group-header">
                          <h4 className="slot-title">{slotName}</h4>
                          <span className="slot-protein-sum">{slotProtein}g proteína</span>
                        </div>

                        {mealsInSlot.length === 0 ? (
                          <p className="empty-slot-msg">Sin comidas registradas en este bloque.</p>
                        ) : (
                          <div className="meals-in-slot-list">
                            {mealsInSlot.map((meal) => (
                              <div key={meal.id} className="meal-log-item">
                                <div className="meal-item-info">
                                  <span className="meal-name">{meal.name}</span>
                                  <div className="meal-macros-chips">
                                    <span className="macro-tag green">{meal.protein}g proteína</span>
                                    <span className="macro-tag neutral">{meal.kcal} kcal</span>
                                  </div>
                                </div>
                                <button
                                  className="remove-meal-btn"
                                  onClick={() => removeMeal(meal.id)}
                                  title="Eliminar"
                                >
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
              </div>
            )}

            {/* SUBVIEW B: SEMÁFORO DE ALIMENTOS GLP-1 */}
            {nutriSubView === "traffic" && (
              <div className="traffic-light-container">
                <div className="traffic-nav-tabs">
                  <button
                    className={`traffic-tab green ${foodFilter === "green" ? "active" : ""}`}
                    onClick={() => setFoodFilter("green")}
                  >
                    🟢 Priorizar Siempre
                  </button>
                  <button
                    className={`traffic-tab yellow ${foodFilter === "yellow" ? "active" : ""}`}
                    onClick={() => setFoodFilter("yellow")}
                  >
                    🟡 Moderar (Porción Medida)
                  </button>
                  <button
                    className={`traffic-tab red ${foodFilter === "red" ? "active" : ""}`}
                    onClick={() => setFoodFilter("red")}
                  >
                    🔴 Evitar Estrictamente
                  </button>
                </div>

                <div className="traffic-explanation-banner">
                  {foodFilter === "green" && (
                    <p>
                      🟢 <strong>Alimentos Verdes:</strong> Proteínas magras de digestión rápida y fibra soluble.
                      Preservan masa muscular sin sobrecargar el estómago ralentizado por Mounjaro u Ozempic.
                    </p>
                  )}
                  {foodFilter === "yellow" && (
                    <p>
                      🟡 <strong>Alimentos Amarillos:</strong> Grasas saludables y carbohidratos nobles. Consúmelos en
                      porciones medidas tras comerte primero tu proteína para evitar saciedad precoz sin nutrición.
                    </p>
                  )}
                  {foodFilter === "red" && (
                    <p>
                      🔴 <strong>Alimentos Rojos:</strong> Frituras, grasas saturadas, azúcares densos y bebidas con
                      gas. El vaciado gástrico lento hace que fermenten, provocando náuseas severas, reflujo o eructos
                      de azufre.
                    </p>
                  )}
                </div>

                <div className="food-cards-list">
                  {FOOD_GUIDE.filter((f) => f.category === foodFilter).map((food) => (
                    <div key={food.id} className={`food-guide-card ${food.category}`}>
                      <div className="food-guide-top">
                        <span className="food-icon">{food.icon}</span>
                        <div className="food-titles">
                          <h4 className="food-title">{food.name}</h4>
                          <span className="food-group-pill">{food.group}</span>
                        </div>
                        {food.category !== "red" && (
                          <button
                            className="add-to-diary-btn"
                            onClick={() => addFoodFromGuide(food, "Almuerzo")}
                            title="Añadir a mi almuerzo de hoy"
                          >
                            <Plus size={14} /> Añadir
                          </button>
                        )}
                      </div>

                      <div className="food-macros-line">
                        <span>
                          Porción: <strong>{food.portion}</strong>
                        </span>
                        <span>
                          Proteína: <strong className="green">{food.protein}g</strong>
                        </span>
                        <span>
                          Calorías: <strong>{food.kcal} kcal</strong>
                        </span>
                      </div>

                      <div className="food-clinical-reason">
                        <strong>¿Por qué con GLP-1?</strong> {food.reason}
                      </div>

                      <div className="food-best-for">
                        <span>⏰ Momento ideal: {food.bestFor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBVIEW C: MENÚ POR FASE DEL CICLO SEMANAL */}
            {nutriSubView === "phase_menu" && (
              <div className="phase-menu-container">
                <div className="phase-menu-intro">
                  <h3 className="section-title">Estrategia Nutricional en los 7 Días del Ciclo</h3>
                  <p className="section-subtitle">
                    Tu apetito y velocidad de digestión cambian día a día con la inyección. Adapta tus comidas según la
                    fase actual:
                  </p>
                </div>

                <div className="phase-plans-list">
                  {MEAL_PLANS_BY_PHASE.map((phase) => {
                    const isCurrentPhase = overview.cyclePhase.id === phase.id;
                    return (
                      <div key={phase.id} className={`phase-plan-card ${isCurrentPhase ? "current-phase-card" : ""}`}>
                        <div className="phase-plan-header">
                          <div className="phase-badge-line">
                            <span className="phase-badge">{phase.badge}</span>
                            {isCurrentPhase && <span className="current-phase-indicator">FASE ACTUAL DE HOY</span>}
                          </div>
                          <h4 className="phase-title">{phase.title}</h4>
                          <p className="phase-desc">{phase.description}</p>
                        </div>

                        <div className="phase-meals-grid">
                          {phase.meals.map((mealItem, idx) => (
                            <div key={idx} className="phase-meal-box">
                              <span className="phase-slot-label">{mealItem.slot}</span>
                              <p className="phase-meal-idea">{mealItem.idea}</p>
                              <span className="phase-meal-macros">{mealItem.macros}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SEGUIMIENTO (INYECCIÓN SEMANAL + SÍNTOMAS + PROGRESO CORPORAL) */}
        {/* ========================================================================= */}
        {activeTab === "seguimiento" && (
          <section className="tab-section tab-fade-in">
            {/* View Selector */}
            <div className="subview-nav-bar">
              <button
                className={`subview-nav-btn ${trackingSubView === "injection" ? "active" : ""}`}
                onClick={() => setTrackingSubView("injection")}
              >
                <Syringe size={16} /> Inyección & Rotación
              </button>
              <button
                className={`subview-nav-btn ${trackingSubView === "symptoms" ? "active" : ""}`}
                onClick={() => setTrackingSubView("symptoms")}
              >
                <HeartPulse size={16} /> Control de Síntomas
              </button>
              <button
                className={`subview-nav-btn ${trackingSubView === "progress" ? "active" : ""}`}
                onClick={() => setTrackingSubView("progress")}
              >
                <TrendingUp size={16} /> Peso, Medidas e IMC
              </button>
            </div>

            {/* SUBVIEW A: INYECCIÓN SEMANAL Y ROTACIÓN */}
            {trackingSubView === "injection" && (
              <div className="injection-tracker-wrap">
                {/* Anatomical Rotation Diagram */}
                <div className="rotation-map-card">
                  <div className="card-header-row">
                    <div>
                      <h3 className="section-title">Mapa de Rotación de 6 Zonas</h3>
                      <p className="section-subtitle">
                        Rotar el sitio de inyección cada semana evita endurecimiento del tejido graso (lipodistrofia).
                      </p>
                    </div>
                    <span className="suggested-site-badge">
                      Sugerida: <strong>{overview.nextSiteSuggestion.short}</strong>
                    </span>
                  </div>

                  {/* Interactive Site Grid */}
                  <div className="injection-sites-grid">
                    {INJECTION_SITES.map((site) => {
                      const isSuggested = overview.nextSiteSuggestion.id === site.id;
                      const isSelected = injSite === site.id;
                      return (
                        <div
                          key={site.id}
                          className={`site-card ${isSuggested ? "suggested" : ""} ${isSelected ? "selected" : ""}`}
                          onClick={() => setInjSite(site.id)}
                        >
                          <div className="site-card-top">
                            <span className="site-zone-tag">{site.zone}</span>
                            {isSuggested && <span className="site-recom-chip">Recomendada</span>}
                          </div>
                          <h4 className="site-name">{site.label}</h4>
                          <p className="site-tip">{site.tip}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Log Dose Form */}
                <div className="log-dose-card">
                  <h4 className="card-subtitle">Registrar Inyección Semanal</h4>
                  <form onSubmit={handleAddInjection} className="log-dose-form">
                    <div className="form-row-multi">
                      <div>
                        <label className="form-label">Medicamento:</label>
                        <select
                          className="form-select"
                          value={state.profile.medicationId}
                          onChange={(e) => {
                            const val = e.target.value;
                            saveState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, medicationId: val },
                            }));
                          }}
                        >
                          {MEDICATIONS.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Dosis:</label>
                        <select
                          className="form-select"
                          value={injDose}
                          onChange={(e) => setInjDose(e.target.value)}
                        >
                          {currentMed.doses.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Sitio de Inyección:</label>
                        <select
                          className="form-select"
                          value={injSite}
                          onChange={(e) => setInjSite(e.target.value)}
                        >
                          {INJECTION_SITES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Peso del día ({unitLabel}):</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder={overview.latestWeight.toString()}
                          value={injWeight}
                          onChange={(e) => setInjWeight(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-row-full">
                      <label className="form-label">Notas u observaciones (opcional):</label>
                      <input
                        type="text"
                        placeholder="Ej: Sin dolor, buena hidratación, leve ardor que cedió en 2 min…"
                        value={injNotes}
                        onChange={(e) => setInjNotes(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <button type="submit" className="submit-dose-btn">
                      <Syringe size={16} /> Guardar Registro de Dosis
                    </button>
                  </form>
                </div>

                {/* History of Doses */}
                <div className="dose-history-card">
                  <h4 className="card-subtitle">Historial de Aplicaciones</h4>
                  {state.injections?.length === 0 ? (
                    <p className="empty-msg">No hay dosis registradas aún.</p>
                  ) : (
                    <div className="dose-history-list">
                      {state.injections.map((inj) => {
                        const siteObj = INJECTION_SITES.find((s) => s.id === inj.site);
                        return (
                          <div key={inj.id} className="dose-history-item">
                            <div className="dose-item-left">
                              <span className="dose-date">{inj.date}</span>
                              <strong className="dose-amount">{inj.dose}</strong>
                              <span className="dose-site-tag">{siteObj?.label || inj.site}</span>
                            </div>
                            <div className="dose-item-right">
                              {inj.weight && (
                                <span className="dose-weight">
                                  {inj.weight} {unitLabel}
                                </span>
                              )}
                              {inj.notes && <p className="dose-note-text">"{inj.notes}"</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBVIEW B: CONTROL DE SÍNTOMAS */}
            {trackingSubView === "symptoms" && (
              <div className="symptoms-tracker-wrap">
                {/* Clinical Log Form */}
                <div className="log-symptom-card">
                  <h4 className="card-subtitle">Reportar Síntoma de Hoy</h4>
                  <form onSubmit={handleAddSymptomLog} className="log-symptom-form">
                    <div className="form-row-multi">
                      <div>
                        <label className="form-label">Síntoma:</label>
                        <select
                          className="form-select"
                          value={selectedSymptomId}
                          onChange={(e) => setSelectedSymptomId(e.target.value)}
                        >
                          {SYMPTOM_CATALOG.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.icon} {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Intensidad:</label>
                        <select
                          className="form-select"
                          value={symptomSeverity}
                          onChange={(e) => setSymptomSeverity(e.target.value)}
                        >
                          <option value="leve">Leve (Casi imperceptible)</option>
                          <option value="moderado">Moderado (Molesto pero manejable)</option>
                          <option value="fuerte">Fuerte (Requiere atención médica si persiste)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-full">
                      <label className="form-label">Detalles o comida previa:</label>
                      <input
                        type="text"
                        placeholder="Ej: Apareció 1 hora después de comer fuera de casa…"
                        value={symptomNote}
                        onChange={(e) => setSymptomNote(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <button type="submit" className="submit-symptom-btn">
                      <HeartPulse size={16} /> Registrar en Bitácora
                    </button>
                  </form>
                </div>

                {/* 8 Symptoms Comprehensive Relief Catalog */}
                <div className="symptom-catalog-section">
                  <h4 className="card-subtitle">Guía de Alivio Inmediato para los 8 Síntomas Más Frecuentes</h4>
                  <div className="symptom-cards-list">
                    {SYMPTOM_CATALOG.map((sym) => (
                      <div key={sym.id} className="symptom-catalog-card">
                        <div className="sym-card-header">
                          <span className="sym-icon">{sym.icon}</span>
                          <div>
                            <h4 className="sym-name">{sym.name}</h4>
                            <span className="sym-category-tag">{sym.category}</span>
                          </div>
                        </div>

                        <div className="sym-why-box">
                          <strong>¿Por qué ocurre con GLP-1?</strong> {sym.whyItHappens}
                        </div>

                        <div className="sym-actions-grid">
                          <div className="sym-action-col eat">
                            <span className="action-col-title green">✓ QUÉ CONSUMIR O HACER HOY:</span>
                            <ul>
                              {sym.whatToEat.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="sym-action-col avoid">
                            <span className="action-col-title red">✗ QUÉ EVITAR:</span>
                            <ul>
                              {sym.whatToAvoid.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBVIEW C: PESO, MEDIDAS, IMC Y HEATMAP */}
            {trackingSubView === "progress" && (
              <div className="progress-tracker-wrap">
                {/* Weight & BMI Card */}
                <div className="progress-hero-grid">
                  <div className="progress-metric-card">
                    <span className="metric-label">PESO ACTUAL</span>
                    <div className="metric-val-row">
                      <span className="metric-large">{overview.latestWeight}</span>
                      <span className="metric-unit">{unitLabel}</span>
                    </div>
                    <span className="metric-diff-tag">
                      Perdido: -{overview.lostSoFar} {unitLabel} de {overview.startWeight} {unitLabel} iniciales
                    </span>
                  </div>

                  {/* BMI Visual Gauge */}
                  <div className="progress-metric-card bmi-card">
                    <span className="metric-label">ÍNDICE DE MASA CORPORAL (IMC)</span>
                    <div className="metric-val-row">
                      <span className="metric-large">{overview.bmi}</span>
                      <span className="bmi-cat-pill" style={{ backgroundColor: `${overview.bmiColor}22`, color: overview.bmiColor, borderColor: overview.bmiColor }}>
                        {overview.bmiCategory}
                      </span>
                    </div>
                    <div className="bmi-gauge-track">
                      <div className="bmi-gauge-fill" style={{ width: `${Math.min(100, Math.max(10, ((overview.bmi - 15) / 25) * 100))}%`, backgroundColor: overview.bmiColor }}></div>
                    </div>
                    <div className="bmi-gauge-scale">
                      <span>18.5</span>
                      <span>25.0</span>
                      <span>30.0</span>
                    </div>
                  </div>
                </div>

                {/* Log Weight and Measurements */}
                <div className="log-weight-card">
                  <h4 className="card-subtitle">Registrar Peso y Medidas</h4>
                  <form onSubmit={handleAddWeight} className="log-weight-form">
                    <div className="form-row-multi">
                      <div>
                        <label className="form-label">Nuevo Peso ({unitLabel}):</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder={overview.latestWeight.toString()}
                          value={newWeightVal}
                          onChange={(e) => setNewWeightVal(e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Cintura (cm):</label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="cm"
                          value={newWaistCm}
                          onChange={(e) => setNewWaistCm(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Cadera (cm):</label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="cm"
                          value={newHipCm}
                          onChange={(e) => setNewHipCm(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="form-row-full">
                      <input
                        type="text"
                        placeholder="Nota (ej. Tomado en ayunas tras el baño)…"
                        value={newWeightNote}
                        onChange={(e) => setNewWeightNote(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <button type="submit" className="submit-weight-btn">
                      <Scale size={16} /> Guardar Medida
                    </button>
                  </form>
                </div>

                {/* Weight Evolution List */}
                <div className="weight-history-card">
                  <h4 className="card-subtitle">Historial de Peso y Medidas</h4>
                  <div className="weights-table-wrapper">
                    <table className="weights-table">
                      <thead>
                        <tr>
                          <th>FECHA</th>
                          <th>PESO</th>
                          <th>CINTURA</th>
                          <th>CADERA</th>
                          <th>NOTAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...(state.weights || [])].reverse().map((w) => (
                          <tr key={w.id}>
                            <td className="w-date-cell">{w.date}</td>
                            <td className="w-weight-cell">
                              <strong>
                                {w.weight} {unitLabel}
                              </strong>
                            </td>
                            <td>{w.waistCm ? `${w.waistCm} cm` : "—"}</td>
                            <td>{w.hipCm ? `${w.hipCm} cm` : "—"}</td>
                            <td className="w-note-cell">{w.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monthly Workout Heatmap */}
                <div className="heatmap-card">
                  <div className="card-header-row">
                    <h4 className="card-subtitle">Constancia de Entrenamientos (Últimos 28 Días)</h4>
                    <span className="heatmap-streak">
                      <Zap size={14} color="#FF6B35" /> Racha Activa
                    </span>
                  </div>

                  <div className="heatmap-grid">
                    {Array.from({ length: 28 }, (_, i) => {
                      const dIso = offsetDate(todayISO(), -27 + i);
                      const hadWorkout = (state.workouts || []).some((w) => w.date === dIso);
                      return (
                        <div
                          key={dIso}
                          className={`heatmap-cell ${hadWorkout ? "active" : ""}`}
                          title={`${dIso}: ${hadWorkout ? "Entrenamiento completado" : "Descanso"}`}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="heatmap-legend-row">
                    <span>Menos activo</span>
                    <div className="heatmap-legend-dots">
                      <span className="dot-level l0"></span>
                      <span className="dot-level l1"></span>
                    </div>
                    <span>Día entrenado</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Settings / Profile Modal */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal-sheet settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Mi Perfil y Ajustes</h3>
              <button className="modal-close-btn" onClick={() => setSettingsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="settings-section">
                <h4 className="settings-group-title">Datos Personales y Tratamiento</h4>
                <div className="form-row-multi">
                  <div>
                    <label className="form-label">Nombre:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.name}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, name: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Estatura (cm):</label>
                    <input
                      type="number"
                      className="form-input"
                      value={profile.heightCm}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, heightCm: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Unidad de Peso:</label>
                    <select
                      className="form-select"
                      value={profile.unit}
                      onChange={(e) =>
                        saveState((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, unit: e.target.value },
                        }))
                      }
                    >
                      <option value="lb">Libras (lb)</option>
                      <option value="kg">Kilogramos (kg)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-multi">
                  <div>
                    <label className="form-label">Peso Meta ({unitLabel}):</label>
                    <input
                      type="number"
                      className="form-input"
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
                    <label className="form-label">Meta de Proteína Diaria (g):</label>
                    <input
                      type="number"
                      className="form-input"
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
              </div>

              <div className="settings-section">
                <h4 className="settings-group-title">Privacidad y Respaldo de Datos (100% Offline)</h4>
                <p className="settings-note">
                  Todos tus registros médicos, fotos y entrenamientos se guardan exclusivamente en la memoria de tu
                  dispositivo sin subir a ningún servidor.
                </p>

                <div className="backup-actions-row">
                  <button className="backup-btn export" onClick={exportBackup}>
                    <Download size={16} /> Exportar Respaldo JSON
                  </button>
                  <label className="backup-btn import">
                    <Upload size={16} /> Importar Respaldo
                    <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <button
                  className="reset-demo-btn"
                  onClick={() => {
                    if (confirm("¿Deseas reiniciar los datos a la configuración inicial de fábrica?")) {
                      const init = defaultState();
                      saveState(init);
                      showToast("Datos reiniciados");
                      setSettingsOpen(false);
                    }
                  }}
                >
                  <RotateCcw size={16} /> Reiniciar Datos a Valores por Defecto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Bottom Navigation (5 Tabs) */}
      <nav className="bottom-nav-bar" aria-label="Navegación principal">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="nav-label">{tab.label}</span>
              {isActive && <span className="active-indicator-dot"></span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
