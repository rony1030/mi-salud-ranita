"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Award,
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
  LayoutDashboard,
  Menu,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Syringe,
  Trash2,
  Upload,
  Utensils,
  Volume2,
  X,
} from "lucide-react";
import RanitaMascot from "./RanitaMascot.jsx";
import BodyMap from "./BodyMap.jsx";
import ExerciseArt from "./ExerciseArt.jsx";
import { EXERCISES } from "../lib/exercise-catalog.mjs";
import {
  STORAGE_KEY,
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
} from "../lib/glp1-data.mjs";

const NAV_ITEMS = [
  { id: "home", label: "Mi resumen", short: "Resumen", icon: LayoutDashboard },
  { id: "diet", label: "Dieta GLP-1", short: "Dieta", icon: Utensils },
  { id: "symptoms", label: "Control síntomas", short: "Síntomas", icon: HeartPulse },
  { id: "weekly", label: "Dosis y peso", short: "Semanal", icon: Syringe },
  { id: "train", label: "Entrenar (GymMane)", short: "Ejercicios", icon: Dumbbell },
  { id: "settings", label: "Mi perfil y datos", short: "Perfil", icon: SettingsIcon },
];

function playBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
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
    // Ignore audio errors if blocked by browser
  }
}

export default function SaludApp() {
  const [state, setState] = useState(null);
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [currentDate, setCurrentDate] = useState(() => todayISO());

  // Diet state
  const [foodFilter, setFoodFilter] = useState("green");
  const [foodQuery, setFoodQuery] = useState("");
  const [customMealName, setCustomMealName] = useState("");
  const [customMealProtein, setCustomMealProtein] = useState("");
  const [customMealKcal, setCustomMealKcal] = useState("");
  const [customMealSlot, setCustomMealSlot] = useState("Almuerzo");

  // Symptoms state
  const [selectedSymptomId, setSelectedSymptomId] = useState("nauseas");
  const [symptomSeverity, setSymptomSeverity] = useState("leve");
  const [symptomNote, setSymptomNote] = useState("");

  // Weekly injection & weight state
  const [injDose, setInjDose] = useState("");
  const [injSite, setInjSite] = useState("");
  const [injDate, setInjDate] = useState(() => todayISO());
  const [injNotes, setInjNotes] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newWaist, setNewWaist] = useState("");
  const [newHip, setNewHip] = useState("");
  const [weightNote, setWeightNote] = useState("");

  // Training / GymMane state
  const [trainTab, setTrainTab] = useState("routines"); // "routines" | "bodymap" | "session"
  const [selectedMuscles, setSelectedMuscles] = useState(["glutes", "quads"]);
  const [equipmentFilter, setEquipmentFilter] = useState("ALL");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [activeExerciseModal, setActiveExerciseModal] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [restSeconds, setRestSeconds] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...defaultState(), ...parsed });
      } else {
        const init = defaultState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        setState(init);
      }
    } catch {
      setState(defaultState());
    }
  }, []);

  // Save helper
  const updateState = (updater, message = "") => {
    setState((prev) => {
      const base = prev || defaultState();
      const next = typeof updater === "function" ? updater(base) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
    if (message) {
      setToast(message);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Rest countdown timer
  useEffect(() => {
    if (restSeconds <= 0) return;
    const t = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          playBeep();
          setToast("⏰ ¡Descanso terminado! Lista para la siguiente serie 💪");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restSeconds]);

  const summary = useMemo(
    () => computeWellnessOverview(state || defaultState(), currentDate),
    [state, currentDate],
  );

  // Sync default injection form fields when summary loads
  useEffect(() => {
    if (!state) return;
    if (!injDose) setInjDose(state.profile.currentDose || "2.5 mg");
    if (!injSite) setInjSite(summary.nextSiteSuggestion?.id || "muslo_der");
  }, [state, summary.nextSiteSuggestion, injDose, injSite]);

  if (!state) {
    return (
      <main className="loading-screen">
        <div className="loading-card">
          <RanitaMascot state="green" size={72} showBubble={false} />
          <h2>Cargando Mi Salud · Ranita GLP-1…</h2>
        </div>
      </main>
    );
  }

  const { profile } = state;
  const currentMed =
    MEDICATIONS.find((m) => m.id === profile.medicationId) || MEDICATIONS[0];
  const dayNutrition = state.nutritionByDate?.[currentDate] || {
    waterGlasses: 0,
    electrolytes: false,
    meals: [],
  };

  // Actions
  const handleAddWater = (delta = 1) => {
    updateState((prev) => {
      const cur = prev.nutritionByDate?.[currentDate] || {
        waterGlasses: 0,
        electrolytes: false,
        meals: [],
      };
      const nextGlasses = Math.max(0, (Number(cur.waterGlasses) || 0) + delta);
      return {
        ...prev,
        nutritionByDate: {
          ...prev.nutritionByDate,
          [currentDate]: {
            ...cur,
            waterGlasses: nextGlasses,
          },
        },
      };
    }, delta > 0 ? "💧 +1 vaso de agua registrado" : "Vasos de agua actualizados");
  };

  const handleToggleElectrolytes = () => {
    updateState((prev) => {
      const cur = prev.nutritionByDate?.[currentDate] || {
        waterGlasses: 0,
        electrolytes: false,
        meals: [],
      };
      return {
        ...prev,
        nutritionByDate: {
          ...prev.nutritionByDate,
          [currentDate]: {
            ...cur,
            electrolytes: !cur.electrolytes,
          },
        },
      };
    }, "⚡ Estado de electrolitos actualizado");
  };

  const handleLogFoodItem = (food, slot = "Comida") => {
    updateState((prev) => {
      const cur = prev.nutritionByDate?.[currentDate] || {
        waterGlasses: 0,
        electrolytes: false,
        meals: [],
      };
      const newMeal = {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        foodId: food.id,
        name: food.name,
        slot,
        protein: food.protein,
        kcal: food.kcal,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
        category: food.category || "green",
      };
      return {
        ...prev,
        nutritionByDate: {
          ...prev.nutritionByDate,
          [currentDate]: {
            ...cur,
            meals: [newMeal, ...(cur.meals || [])],
          },
        },
      };
    }, `🍽️ Agregado: ${food.name} (+${food.protein}g proteína)`);
  };

  const handleAddCustomMeal = (e) => {
    e.preventDefault();
    if (!customMealName.trim()) return;
    handleLogFoodItem(
      {
        id: `custom-${Date.now()}`,
        name: customMealName.trim(),
        protein: Number(customMealProtein) || 0,
        kcal: Number(customMealKcal) || 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        category: "green",
      },
      customMealSlot,
    );
    setCustomMealName("");
    setCustomMealProtein("");
    setCustomMealKcal("");
  };

  const handleDeleteMeal = (mealId) => {
    updateState((prev) => {
      const cur = prev.nutritionByDate?.[currentDate] || {
        waterGlasses: 0,
        electrolytes: false,
        meals: [],
      };
      return {
        ...prev,
        nutritionByDate: {
          ...prev.nutritionByDate,
          [currentDate]: {
            ...cur,
            meals: (cur.meals || []).filter((m) => m.id !== mealId),
          },
        },
      };
    }, "Registro de comida eliminado");
  };

  const handleLogSymptom = (e) => {
    e.preventDefault();
    const sym = SYMPTOM_CATALOG.find((s) => s.id === selectedSymptomId);
    if (!sym) return;
    updateState((prev) => {
      const entry = {
        id: `sym-${Date.now()}`,
        date: currentDate,
        symptomId: sym.id,
        name: sym.name,
        icon: sym.icon,
        severity: symptomSeverity,
        note: symptomNote.trim(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        symptomLogs: [entry, ...(prev.symptomLogs || [])],
      };
    }, `🩺 Síntoma registrado: ${sym.name} (${symptomSeverity})`);
    setSymptomNote("");
  };

  const handleLogInjection = (e) => {
    e.preventDefault();
    const siteObj =
      INJECTION_SITES.find((s) => s.id === injSite) ||
      summary.nextSiteSuggestion;
    updateState((prev) => {
      const entry = {
        id: `inj-${Date.now()}`,
        date: injDate || currentDate,
        medicationId: prev.profile.medicationId,
        dose: injDose || prev.profile.currentDose,
        site: siteObj.id,
        weight: prev.profile.currentWeight,
        notes: injNotes.trim() || "Aplicación semanal registrada.",
      };
      return {
        ...prev,
        profile: {
          ...prev.profile,
          currentDose: entry.dose,
        },
        injections: [entry, ...(prev.injections || [])],
      };
    }, `💉 Dosis ${injDose || profile.currentDose} registrada en ${siteObj.label}`);
    setInjNotes("");
  };

  const handleLogWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!Number.isFinite(w) || w <= 0) return;
    updateState((prev) => {
      const entry = {
        id: `w-${Date.now()}`,
        date: currentDate,
        weight: w,
        waistCm: parseFloat(newWaist) || null,
        hipCm: parseFloat(newHip) || null,
        note: weightNote.trim() || "Control semanal",
      };
      return {
        ...prev,
        profile: {
          ...prev.profile,
          currentWeight: w,
        },
        weights: [...(prev.weights || []), entry],
      };
    }, `⚖️ Peso actualizado a ${w} ${profile.unit}`);
    setNewWeight("");
    setNewWaist("");
    setNewHip("");
    setWeightNote("");
  };

  const startRoutineSession = (routine, dayIdx = 0) => {
    const day = routine.days[dayIdx] || routine.days[0];
    const items = day.exercises
      .map((item) => {
        const ex = getExerciseById(item.id);
        if (!ex) return null;
        return {
          exercise: ex,
          note: item.note,
          restSec: item.restSec || 60,
          sets: Array.from({ length: item.sets || 3 }, (_, idx) => ({
            setNumber: idx + 1,
            reps: item.reps || "12",
            weight: "",
            done: false,
          })),
        };
      })
      .filter(Boolean);

    setActiveSession({
      title: `${routine.name} · ${day.dayName}`,
      startedAt: new Date().toISOString(),
      items,
    });
    setTrainTab("session");
    setPage("train");
    setToast(`🏋️‍♀️ Sesión iniciada: ${day.dayName}`);
  };

  const startCustomMuscleSession = () => {
    const pool = EXERCISES.filter((ex) =>
      selectedMuscles.includes(ex.primary),
    ).slice(0, 5);
    if (!pool.length) return;
    const items = pool.map((ex) => ({
      exercise: ex,
      note: "Mantén buena postura y controla la bajada 2 segundos",
      restSec: 60,
      sets: [
        { setNumber: 1, reps: "12", weight: "", done: false },
        { setNumber: 2, reps: "12", weight: "", done: false },
        { setNumber: 3, reps: "10-12", weight: "", done: false },
      ],
    }));
    setActiveSession({
      title: `Sesión Mapa Corporal (${selectedMuscles
        .map((m) => MUSCLE_LABELS[m]?.name.split(" ")[0] || m)
        .join(" + ")})`,
      startedAt: new Date().toISOString(),
      items,
    });
    setTrainTab("session");
    setToast("🏋️‍♀️ Sesión creada desde el Mapa Corporal");
  };

  const toggleSessionSet = (itemIdx, setIdx) => {
    if (!activeSession) return;
    const nextItems = activeSession.items.map((item, i) => {
      if (i !== itemIdx) return item;
      const nextSets = item.sets.map((s, j) => {
        if (j !== setIdx) return s;
        const nextDone = !s.done;
        if (nextDone) {
          setRestSeconds(item.restSec || 60);
        }
        return { ...s, done: nextDone };
      });
      return { ...item, sets: nextSets };
    });
    setActiveSession({ ...activeSession, items: nextItems });
  };

  const finishWorkoutSession = () => {
    if (!activeSession) return;
    const completedSets = activeSession.items.reduce(
      (sum, it) => sum + it.sets.filter((s) => s.done).length,
      0,
    );
    updateState((prev) => ({
      ...prev,
      workouts: [
        {
          id: `wk-${Date.now()}`,
          date: currentDate,
          title: activeSession.title,
          completedSets: Math.max(1, completedSets),
          exercisesCount: activeSession.items.length,
        },
        ...(prev.workouts || []),
      ],
    }), "🎉 ¡Entrenamiento guardado! Tu masa muscular te lo agradece 🐸💪");
    setActiveSession(null);
    setRestSeconds(0);
    setTrainTab("routines");
  };

  const toggleMuscle = (muscleId) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscleId)
        ? prev.filter((m) => m !== muscleId)
        : [...prev, muscleId],
    );
  };

  const filteredFoods = useMemo(() => {
    return FOOD_GUIDE.filter((f) => {
      if (foodFilter !== "all" && f.category !== foodFilter) return false;
      if (!foodQuery.trim()) return true;
      const q = foodQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.group.toLowerCase().includes(q) ||
        f.reason.toLowerCase().includes(q)
      );
    });
  }, [foodFilter, foodQuery]);

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      if (
        selectedMuscles.length > 0 &&
        !selectedMuscles.includes(ex.primary) &&
        !ex.secondary?.some((s) => selectedMuscles.includes(s))
      ) {
        return false;
      }
      if (equipmentFilter !== "ALL" && ex.equipment !== equipmentFilter) {
        return false;
      }
      if (exerciseSearch.trim()) {
        const q = exerciseSearch.toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.nameEn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedMuscles, equipmentFilter, exerciseSearch]);

  const activeSymptomGuide =
    SYMPTOM_CATALOG.find((s) => s.id === selectedSymptomId) ||
    SYMPTOM_CATALOG[0];

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mi-salud-ranita-${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("📦 Copia de seguridad descargada");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && parsed.profile) {
          updateState(parsed, "✅ Respaldo restaurado correctamente");
        }
      } catch {
        setToast("⚠️ El archivo no es un respaldo válido");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-shell">
      {/* Desktop Sidebar (same layout structure as Mi Finanza) */}
      <aside className="sidebar" aria-label="Menú principal">
        <a
          href="#home"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setPage("home");
          }}
        >
          <div className="brand-mark">
            🐸
            <span />
          </div>
          <div>
            Mi Salud
            <small>Ranita GLP-1 · GymMane</small>
          </div>
        </a>

        <div className="workspace-label">
          <span className="personal-dot" />
          <span>
            Perfil: <strong>{profile.name}</strong> · {currentMed.brand.split(" ")[0]}
          </span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => {
                  setPage(item.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === "train" && activeSession && <b>En vivo</b>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="disclaimer-mini">
            <Info size={14} />
            <span>
              Guía informativa gratuita. No reemplaza la indicación de tu médico.
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <div>
              <strong className="topbar-title">
                Mi Salud · Ranita GLP-1
              </strong>
              <span className="topbar-sub">
                {profile.name} · {currentMed.name} ({profile.currentDose})
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <input
              type="date"
              className="date-picker"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value || todayISO())}
              aria-label="Fecha activa"
            />
            <button
              type="button"
              className="water-pill-btn"
              onClick={() => handleAddWater(1)}
              title="Sumar 1 vaso de agua"
            >
              <Droplets size={15} />
              <span>
                {summary.waterGlasses}/{summary.waterGoal} vasos
              </span>
              <b>+1</b>
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {menuOpen && (
          <div className="mobile-drawer-backdrop" onClick={() => setMenuOpen(false)}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-head">
                <strong>🐸 Mi Salud · Ranita</strong>
                <button type="button" onClick={() => setMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${page === item.id ? "active" : ""}`}
                    onClick={() => {
                      setPage(item.id);
                      setMenuOpen(false);
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Rest Timer Floating Banner */}
        {restSeconds > 0 && (
          <div className="rest-timer-banner" role="status">
            <Clock size={18} />
            <span>
              Descanso activo: <strong>{restSeconds}s</strong> — Respira profundo y toma un sorbo de agua
            </span>
            <button
              type="button"
              className="rest-skip-btn"
              onClick={() => setRestSeconds(0)}
            >
              Saltar
            </button>
          </div>
        )}

        <main className="page-container">
          {/* Educational Non-Medical Notice Banner */}
          <div className="info-banner">
            <ShieldCheck size={18} />
            <p>
              <strong>Información gratuita de bienestar:</strong> Recopilamos las guías de nutrición, hidratación, alivio de síntomas y ejercicios que otras aplicaciones cobran, totalmente gratis para ti. No recetamos medicamentos; sigue siempre la pauta de tu médico.
            </p>
          </div>

          {/* ==================== PAGE: HOME (MI RESUMEN) ==================== */}
          {page === "home" && (
            <>
              <section className="greeting">
                <div>
                  <h1>Hola {profile.name}, cuidemos tu cuerpo hoy.</h1>
                  <p>
                    {summary.cyclePhase.badge} · {summary.cyclePhase.title}
                  </p>
                </div>
                <button
                  type="button"
                  className="button primary desktop-action"
                  onClick={() => setPage("weekly")}
                >
                  <Syringe size={17} />
                  Registrar dosis o peso
                </button>
              </section>

              <div className="overview-layout">
                {/* Main Navy/Emerald Wellness Card with Semaphore & Ranita Mascot (Just like Mi Finanza!) */}
                <section
                  className={`money-panel semaphore-${summary.color}`}
                  aria-label="Semáforo de bienestar GLP-1"
                >
                  <div className="money-title">
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Scale size={18} /> {summary.title}
                    </span>
                    <span className={`semaphore-badge badge-${summary.color}`}>
                      {summary.badge}
                    </span>
                  </div>

                  <div className="hero-weight-row">
                    <div>
                      <div className="available-amount">
                        {summary.latestWeight} <small>{profile.unit}</small>
                      </div>
                      <span className="weight-delta-pill">
                        {summary.lostSoFar > 0
                          ? `🎉 −${summary.lostSoFar} ${profile.unit} desde el inicio (${summary.startWeight} ${profile.unit})`
                          : `Meta: ${summary.goalWeight} ${profile.unit}`}
                      </span>
                    </div>
                    <RanitaMascot state={summary.color} size={66} />
                  </div>

                  <p className="money-caption">{summary.caption}</p>

                  {/* 2x2 Breakdown Grid identical in spirit to Mi Finanza */}
                  <div className="money-breakdown">
                    <div>
                      <span>🥩 Proteína de hoy</span>
                      <strong
                        style={{
                          color:
                            summary.proteinPct >= 80 ? "#bbf7d0" : "#fde68a",
                        }}
                      >
                        {summary.totals.protein}g / {summary.proteinGoal}g
                      </strong>
                    </div>
                    <div>
                      <span>💧 Agua de hoy</span>
                      <strong
                        style={{
                          color: summary.waterPct >= 75 ? "#bbf7d0" : "#bae6fd",
                        }}
                      >
                        {summary.waterGlasses} / {summary.waterGoal} vasos
                      </strong>
                    </div>
                    <div>
                      <span>💉 Próxima dosis ({profile.currentDose})</span>
                      <strong>
                        {summary.daysUntilNextInjection === 0
                          ? "¡Toca hoy!"
                          : `En ${summary.daysUntilNextInjection} días`}
                      </strong>
                    </div>
                    <div>
                      <span>🏋️‍♀️ Fuerza esta semana</span>
                      <strong>
                        {summary.weeklyWorkoutsCount} / 3 sesiones
                      </strong>
                    </div>
                  </div>

                  {/* Quick Actions 2x2 inside Hero Panel */}
                  <div className="quick-actions">
                    <button
                      type="button"
                      className="quick-action income"
                      onClick={() => setPage("diet")}
                    >
                      <Utensils size={16} />
                      <span>Qué comer hoy</span>
                    </button>
                    <button
                      type="button"
                      className="quick-action expense"
                      onClick={() => setPage("symptoms")}
                    >
                      <HeartPulse size={16} />
                      <span>Tengo un síntoma</span>
                    </button>
                    <button
                      type="button"
                      className="quick-action bill"
                      onClick={() => setPage("weekly")}
                    >
                      <Syringe size={16} />
                      <span>Inyección y peso</span>
                    </button>
                    <button
                      type="button"
                      className="quick-action pantry"
                      onClick={() => setPage("train")}
                    >
                      <Dumbbell size={16} />
                      <span>Ejercicios anti-flacidez</span>
                    </button>
                  </div>
                </section>

                {/* Right Side Summary Panel: Today's Cycle Guide + Hydration & Protein Meters */}
                <section className="panel stack-panel">
                  <div className="panel-head">
                    <h2>Tu guía para el día de hoy</h2>
                    <span className="chip-tag">{summary.cyclePhase.badge}</span>
                  </div>
                  <p className="muted-text">{summary.cyclePhase.description}</p>

                  <div className="meter-group">
                    <div className="meter-label-row">
                      <span>
                        <strong>Meta de Proteína</strong> (Evita caída de cabello y flacidez)
                      </span>
                      <strong>{summary.proteinPct}%</strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill green"
                        style={{ width: `${summary.proteinPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="meter-group">
                    <div className="meter-label-row">
                      <span>
                        <strong>Meta de Agua</strong> (Previene estreñimiento y náuseas)
                      </span>
                      <strong>{summary.waterPct}%</strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill blue"
                        style={{ width: `${summary.waterPct}%` }}
                      />
                    </div>
                    <div className="water-quick-row">
                      <button
                        type="button"
                        className="button secondary small"
                        onClick={() => handleAddWater(1)}
                      >
                        <Droplets size={14} /> +1 Vaso de agua
                      </button>
                      <button
                        type="button"
                        className={`button small ${
                          dayNutrition.electrolytes ? "primary" : "secondary"
                        }`}
                        onClick={handleToggleElectrolytes}
                      >
                        <Sparkles size={14} />{" "}
                        {dayNutrition.electrolytes
                          ? "Electrolitos tomados ✓"
                          : "Marcar electrolitos"}
                      </button>
                    </div>
                  </div>

                  <div className="phase-meals-preview">
                    <h3>Sugerencia de menú para hoy:</h3>
                    {summary.cyclePhase.meals.slice(0, 3).map((m, i) => (
                      <div key={i} className="mini-meal-card">
                        <div>
                          <strong>{m.slot}:</strong> {m.idea}
                        </div>
                        <small>{m.macros}</small>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Lower Grid: Today's Logged Meals & Rotation Reminder */}
              <div className="lower-grid">
                <section className="panel">
                  <div className="panel-head">
                    <h2>Comidas registradas hoy ({dayNutrition.meals?.length || 0})</h2>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setPage("diet")}
                    >
                      Ir al semáforo de dieta <ChevronRight size={15} />
                    </button>
                  </div>
                  {dayNutrition.meals?.length ? (
                    <div className="item-list">
                      {dayNutrition.meals.map((m) => (
                        <div className="item-row" key={m.id}>
                          <div>
                            <strong>{m.name}</strong>
                            <span className="row-sub">
                              {m.slot} · {m.kcal} kcal
                            </span>
                          </div>
                          <div className="item-row-right">
                            <span className="protein-badge">
                              +{m.protein}g proteína
                            </span>
                            <button
                              type="button"
                              className="icon-delete-btn"
                              onClick={() => handleDeleteMeal(m.id)}
                              aria-label={`Borrar ${m.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-hint">
                      Aún no has anotado comidas hoy. Ve a <strong>Dieta GLP-1</strong> para elegir opciones suaves y ricas en proteína.
                    </p>
                  )}
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <h2>Seguimiento Semanal y Rotación</h2>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setPage("weekly")}
                    >
                      Ver historial <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="rotation-summary-box">
                    <div className="rotation-row">
                      <span>Última inyección:</span>
                      <strong>
                        {summary.lastInjection
                          ? `${summary.lastInjection.date} (${summary.lastInjection.dose})`
                          : "Sin registro"}
                      </strong>
                    </div>
                    <div className="rotation-row">
                      <span>Última zona usada:</span>
                      <strong>
                        {INJECTION_SITES.find(
                          (s) => s.id === summary.lastInjection?.site,
                        )?.label || "Ninguna"}
                      </strong>
                    </div>
                    <div className="rotation-row highlight">
                      <span>Próxima zona sugerida:</span>
                      <strong>
                        🎯 {summary.nextSiteSuggestion.label}
                      </strong>
                    </div>
                    <p className="small-note">
                      💡 {summary.nextSiteSuggestion.tip}
                    </p>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ==================== PAGE: DIET (QUÉ COMER Y QUÉ EVITAR) ==================== */}
          {page === "diet" && (
            <>
              <section className="greeting">
                <div>
                  <h1>Guía de Dieta para Mounjaro y Ozempic</h1>
                  <p>
                    Qué comer y qué evitar bajo sugerencia informativa para bajar de peso sin malestar estomacal ni perder músculo.
                  </p>
                </div>
              </section>

              {/* Golden Rules Card */}
              <section className="panel golden-rules-panel">
                <h2>🐸 Las 4 Reglas de Oro de la Ranita al Comer</h2>
                <div className="rules-grid">
                  <div className="rule-card">
                    <strong>1️⃣ Primero la Proteína (50%)</strong>
                    <p>
                      Como te llenas con pocos bocados, cómete SIEMPRE primero el pollo, pescado, huevo o yogur griego antes de tocar el arroz o el plátano.
                    </p>
                  </div>
                  <div className="rule-card">
                    <strong>2️⃣ Cero Frituras y Grasa Pesada</strong>
                    <p>
                      Mounjaro y Ozempic enlentecen el estómago. Lo frito se queda horas fermentando y provoca náuseas, acidez y eructos fuertes.
                    </p>
                  </div>
                  <div className="rule-card">
                    <strong>3️⃣ Agua Separada de la Comida</strong>
                    <p>
                      Bebe tus 8 vasos de agua a sorbitos durante el día, pero evita tomar vasos grandes junto con el almuerzo para no llenarte solo de líquido.
                    </p>
                  </div>
                  <div className="rule-card">
                    <strong>4️⃣ Porciones Pequeñas y Temprano</strong>
                    <p>
                      Para en cuanto sientas la primera señal de saciedad y cena al menos 2.5 a 3 horas antes de acostarte.
                    </p>
                  </div>
                </div>
              </section>

              {/* Traffic Light Filter & Search */}
              <section className="panel">
                <div className="panel-head">
                  <h2>Semáforo de Alimentos (Toca para anotar en tu día)</h2>
                  <div className="search-input-wrap">
                    <Search size={16} />
                    <input
                      type="search"
                      placeholder="Buscar pollo, plátano, avena, fritura…"
                      value={foodQuery}
                      onChange={(e) => setFoodQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="traffic-tabs">
                  <button
                    type="button"
                    className={`traffic-tab green ${
                      foodFilter === "green" ? "active" : ""
                    }`}
                    onClick={() => setFoodFilter("green")}
                  >
                    🟢 Qué Comer (Ideales)
                  </button>
                  <button
                    type="button"
                    className={`traffic-tab yellow ${
                      foodFilter === "yellow" ? "active" : ""
                    }`}
                    onClick={() => setFoodFilter("yellow")}
                  >
                    🟡 Con Moderación (Porción chica)
                  </button>
                  <button
                    type="button"
                    className={`traffic-tab red ${
                      foodFilter === "red" ? "active" : ""
                    }`}
                    onClick={() => setFoodFilter("red")}
                  >
                    🔴 Qué Evitar (Dan malestar)
                  </button>
                  <button
                    type="button"
                    className={`traffic-tab ${
                      foodFilter === "all" ? "active" : ""
                    }`}
                    onClick={() => setFoodFilter("all")}
                  >
                    Ver todos ({FOOD_GUIDE.length})
                  </button>
                </div>

                <div className="food-cards-grid">
                  {filteredFoods.map((food) => (
                    <article
                      key={food.id}
                      className={`food-guide-card cat-${food.category}`}
                    >
                      <div className="food-card-top">
                        <span className="food-emoji">{food.icon}</span>
                        <div>
                          <span className="food-group-tag">{food.group}</span>
                          <h3>{food.name}</h3>
                        </div>
                      </div>

                      <div className="food-macros-strip">
                        <span>
                          <strong>{food.protein}g</strong> proteína
                        </span>
                        <span>{food.kcal} kcal</span>
                        <span>Porción: {food.portion}</span>
                      </div>

                      <p className="food-reason">{food.reason}</p>

                      <div className="food-card-foot">
                        <small>{food.bestFor}</small>
                        {food.category !== "red" ? (
                          <button
                            type="button"
                            className="button secondary small"
                            onClick={() => handleLogFoodItem(food, "Comida")}
                          >
                            <Plus size={14} /> Anotar hoy
                          </button>
                        ) : (
                          <span className="avoid-pill">⚠️ Evitar</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Weekly Cycle Meal Plans + Custom Meal Form */}
              <div className="lower-grid">
                <section className="panel">
                  <h2>Menús Sugeridos según el Día de tu Dosis</h2>
                  <div className="phase-accordion-list">
                    {MEAL_PLANS_BY_PHASE.map((phase) => (
                      <div key={phase.id} className="phase-plan-box">
                        <div className="phase-plan-head">
                          <strong>{phase.title}</strong>
                          <span className="chip-tag">{phase.badge}</span>
                        </div>
                        <p className="muted-text">{phase.description}</p>
                        <div className="phase-meals-list">
                          {phase.meals.map((m, idx) => (
                            <div key={idx} className="mini-meal-card">
                              <div>
                                <strong>{m.slot}:</strong> {m.idea}
                              </div>
                              <small>{m.macros}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h2>Anotar otra comida o batido de hoy</h2>
                  <form className="form-stack" onSubmit={handleAddCustomMeal}>
                    <label>
                      Nombre del plato o alimento
                      <input
                        type="text"
                        placeholder="Ej. Pollo guisado sin grasa con ensalada"
                        value={customMealName}
                        onChange={(e) => setCustomMealName(e.target.value)}
                        required
                      />
                    </label>
                    <div className="two-col-inputs">
                      <label>
                        Momento del día
                        <select
                          value={customMealSlot}
                          onChange={(e) => setCustomMealSlot(e.target.value)}
                        >
                          <option value="Desayuno">Desayuno</option>
                          <option value="Merienda mañana">Merienda mañana</option>
                          <option value="Almuerzo">Almuerzo</option>
                          <option value="Merienda tarde">Merienda tarde</option>
                          <option value="Cena">Cena</option>
                        </select>
                      </label>
                      <label>
                        Proteína estimada (g)
                        <input
                          type="number"
                          placeholder="Ej. 25"
                          value={customMealProtein}
                          onChange={(e) => setCustomMealProtein(e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      Calorías estimadas (opcional)
                      <input
                        type="number"
                        placeholder="Ej. 280"
                        value={customMealKcal}
                        onChange={(e) => setCustomMealKcal(e.target.value)}
                      />
                    </label>
                    <button type="submit" className="button primary">
                      <Plus size={16} /> Guardar en mi registro de hoy
                    </button>
                  </form>
                </section>
              </div>
            </>
          )}

          {/* ==================== PAGE: SYMPTOMS (CONTROL DE SÍNTOMAS) ==================== */}
          {page === "symptoms" && (
            <>
              <section className="greeting">
                <div>
                  <h1>Control de Síntomas y Alivio Sugerido</h1>
                  <p>
                    Selecciona lo que sientes para ver qué alimentos te ayudan a aliviarlo y llevar tu control semanal.
                  </p>
                </div>
              </section>

              <div className="overview-layout">
                {/* Left: Symptom Selector & Relief Guide */}
                <section className="panel">
                  <h2>1. ¿Qué síntoma sientes hoy?</h2>
                  <div className="symptom-chips-grid">
                    {SYMPTOM_CATALOG.map((sym) => (
                      <button
                        key={sym.id}
                        type="button"
                        className={`symptom-select-card ${
                          selectedSymptomId === sym.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedSymptomId(sym.id)}
                      >
                        <span className="sym-emoji">{sym.icon}</span>
                        <div>
                          <strong>{sym.name}</strong>
                          <small>{sym.category}</small>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Detailed Relief Card for Selected Symptom */}
                  <div className="symptom-relief-box">
                    <div className="relief-header">
                      <span className="sym-emoji-lg">{activeSymptomGuide.icon}</span>
                      <div>
                        <h3>Guía de alivio: {activeSymptomGuide.name}</h3>
                        <p>{activeSymptomGuide.whyItHappens}</p>
                      </div>
                    </div>

                    <div className="relief-columns">
                      <div className="relief-col good">
                        <h4>🟢 Qué comer y hacer ahora (Sugerido)</h4>
                        <ul>
                          {activeSymptomGuide.whatToEat.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="relief-col avoid">
                        <h4>🔴 Qué evitar mientras tengas este síntoma</h4>
                        <ul>
                          {activeSymptomGuide.whatToAvoid.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Right: Log Symptom Form & History */}
                <section className="panel stack-panel">
                  <h2>2. Guardar en mi diario semanal</h2>
                  <form className="form-stack" onSubmit={handleLogSymptom}>
                    <label>
                      Síntoma seleccionado
                      <input
                        type="text"
                        value={`${activeSymptomGuide.icon} ${activeSymptomGuide.name}`}
                        readOnly
                      />
                    </label>
                    <label>
                      Intensidad del síntoma
                      <div className="severity-pills">
                        {[
                          { id: "leve", label: "🟢 Leve (Tolerable)" },
                          { id: "moderado", label: "🟡 Moderado (Molesto)" },
                          { id: "fuerte", label: "🔴 Fuerte (Requiere reposo)" },
                        ].map((sev) => (
                          <button
                            key={sev.id}
                            type="button"
                            className={`severity-pill ${sev.id} ${
                              symptomSeverity === sev.id ? "active" : ""
                            }`}
                            onClick={() => setSymptomSeverity(sev.id)}
                          >
                            {sev.label}
                          </button>
                        ))}
                      </div>
                    </label>
                    <label>
                      Nota opcional (ej. qué comiste antes o cuántos días llevas post-inyección)
                      <input
                        type="text"
                        placeholder="Ej. Día 2 después de la dosis de 5mg"
                        value={symptomNote}
                        onChange={(e) => setSymptomNote(e.target.value)}
                      />
                    </label>
                    <button type="submit" className="button primary">
                      <Check size={16} /> Registrar síntoma en mi historial
                    </button>
                  </form>

                  <div className="Alert-medical-box">
                    <AlertTriangle size={16} />
                    <small>
                      <strong>Aviso importante:</strong> Si presentas dolor abdominal severo y persistente que se irradia a la espalda, vómitos continuos que impiden beber líquidos por más de 24h o fiebre, acude de inmediato a tu médico.
                    </small>
                  </div>

                  <h3>Historial reciente de síntomas</h3>
                  {state.symptomLogs?.length ? (
                    <div className="item-list">
                      {state.symptomLogs.slice(0, 8).map((log) => (
                        <div className="item-row" key={log.id}>
                          <div>
                            <strong>
                              {log.icon} {log.name}
                            </strong>
                            <span className="row-sub">
                              {log.date} {log.note ? `· ${log.note}` : ""}
                            </span>
                          </div>
                          <span className={`sev-tag sev-${log.severity}`}>
                            {log.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-hint">
                      No hay síntomas registrados todavía. ¡Excelente señal! 🐸✨
                    </p>
                  )}
                </section>
              </div>
            </>
          )}

          {/* ==================== PAGE: WEEKLY (SEGUIMIENTO SEMANAL · DOSIS Y PESO) ==================== */}
          {page === "weekly" && (
            <>
              <section className="greeting">
                <div>
                  <h1>Seguimiento Semanal · Inyecciones y Peso</h1>
                  <p>
                    Controla tus dosis semanales de Mounjaro u Ozempic, rota tu zona de aplicación y mide tu avance real.
                  </p>
                </div>
              </section>

              <div className="overview-layout">
                {/* Left: Weekly Injection Tracker & Site Rotation Map */}
                <section className="panel">
                  <div className="panel-head">
                    <h2>💉 Registro de Inyección Semanal</h2>
                    <span className="chip-tag">{currentMed.name}</span>
                  </div>

                  <div className="site-rotation-visual">
                    <div className="rotation-header">
                      <strong>Mapa de Rotación de Zonas (Evita irritación)</strong>
                      <small>
                        Sugerida hoy:{" "}
                        <b style={{ color: "#059669" }}>
                          {summary.nextSiteSuggestion.label}
                        </b>
                      </small>
                    </div>
                    <div className="sites-grid">
                      {INJECTION_SITES.map((s) => {
                        const isSuggested =
                          summary.nextSiteSuggestion.id === s.id;
                        const isLast = summary.lastInjection?.site === s.id;
                        const isSelected = injSite === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className={`site-card ${
                              isSelected ? "selected" : ""
                            } ${isSuggested ? "suggested" : ""}`}
                            onClick={() => setInjSite(s.id)}
                          >
                            <div className="site-card-top">
                              <strong>{s.label}</strong>
                              {isSuggested && (
                                <span className="site-badge next">
                                  Toca hoy
                                </span>
                              )}
                              {isLast && !isSuggested && (
                                <span className="site-badge last">
                                  Última vez
                                </span>
                              )}
                            </div>
                            <small>{s.tip}</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form className="form-stack" onSubmit={handleLogInjection}>
                    <div className="two-col-inputs">
                      <label>
                        Dosis aplicada
                        <select
                          value={injDose}
                          onChange={(e) => setInjDose(e.target.value)}
                        >
                          {currentMed.doses.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Fecha de aplicación
                        <input
                          type="date"
                          value={injDate}
                          onChange={(e) => setInjDate(e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      Notas de la aplicación
                      <input
                        type="text"
                        placeholder="Ej. Sacada de la nevera 15 min antes, cero dolor"
                        value={injNotes}
                        onChange={(e) => setInjNotes(e.target.value)}
                      />
                    </label>
                    <button type="submit" className="button primary">
                      <Syringe size={16} /> Guardar dosis semanal
                    </button>
                  </form>

                  <h3 style={{ marginTop: "20px" }}>
                    Historial de aplicaciones ({state.injections?.length || 0})
                  </h3>
                  <div className="item-list">
                    {(state.injections || []).map((inj) => {
                      const siteLabel =
                        INJECTION_SITES.find((s) => s.id === inj.site)?.label ||
                        inj.site;
                      return (
                        <div className="item-row" key={inj.id}>
                          <div>
                            <strong>
                              Dosis {inj.dose} · {siteLabel}
                            </strong>
                            <span className="row-sub">
                              {inj.date} · {inj.notes}
                            </span>
                          </div>
                          <span className="protein-badge">{inj.dose}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Right: Weekly Weight & Body Measurements */}
                <section className="panel stack-panel">
                  <div className="panel-head">
                    <h2>⚖️ Control Semanal de Peso y Medidas</h2>
                    <span className="chip-tag">
                      Meta: {profile.goalWeight} {profile.unit}
                    </span>
                  </div>

                  <div className="weight-progress-card">
                    <div className="weight-stats-row">
                      <div>
                        <span>Inicio</span>
                        <strong>
                          {summary.startWeight} {profile.unit}
                        </strong>
                      </div>
                      <div>
                        <span>Actual</span>
                        <strong className="highlight-emerald">
                          {summary.latestWeight} {profile.unit}
                        </strong>
                      </div>
                      <div>
                        <span>Perdido</span>
                        <strong className="highlight-emerald">
                          −{summary.lostSoFar} {profile.unit}
                        </strong>
                      </div>
                      <div>
                        <span>Meta</span>
                        <strong>
                          {summary.goalWeight} {profile.unit}
                        </strong>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill green"
                        style={{ width: `${summary.weightProgressPct}%` }}
                      />
                    </div>
                    <small className="muted-text">
                      Has completado el <strong>{summary.weightProgressPct}%</strong> de tu meta de peso.
                    </small>
                  </div>

                  <form className="form-stack" onSubmit={handleLogWeight}>
                    <div className="three-col-inputs">
                      <label>
                        Peso hoy ({profile.unit})
                        <input
                          type="number"
                          step="0.1"
                          placeholder={`Ej. ${summary.latestWeight}`}
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Cintura (cm)
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Opcional"
                          value={newWaist}
                          onChange={(e) => setNewWaist(e.target.value)}
                        />
                      </label>
                      <label>
                        Cadera/Glúteo (cm)
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Opcional"
                          value={newHip}
                          onChange={(e) => setNewHip(e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      Nota de la semana
                      <input
                        type="text"
                        placeholder="Ej. La ropa me queda más suelta en la cintura"
                        value={weightNote}
                        onChange={(e) => setWeightNote(e.target.value)}
                      />
                    </label>
                    <button type="submit" className="button primary">
                      <Scale size={16} /> Registrar peso y medidas
                    </button>
                  </form>

                  <h3>Evolución semanal</h3>
                  <div className="item-list">
                    {[...(state.weights || [])]
                      .reverse()
                      .slice(0, 8)
                      .map((w) => (
                        <div className="item-row" key={w.id}>
                          <div>
                            <strong>
                              {w.weight} {profile.unit}
                              {w.waistCm ? ` · Cintura: ${w.waistCm} cm` : ""}
                              {w.hipCm ? ` · Cadera: ${w.hipCm} cm` : ""}
                            </strong>
                            <span className="row-sub">
                              {w.date} {w.note ? `· ${w.note}` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ==================== PAGE: TRAIN (GYMMANE BODY MAP & WORKOUTS) ==================== */}
          {page === "train" && (
            <>
              <section className="greeting">
                <div>
                  <h1>Entrenamiento y Mapa Corporal (GymMane)</h1>
                  <p>
                    Ejercicios pensados para rebajar grasa protegiendo glúteos, piernas, brazos y evitando la flacidez en Mounjaro / Ozempic.
                  </p>
                </div>
              </section>

              <div className="train-subtabs">
                <button
                  type="button"
                  className={`traffic-tab ${
                    trainTab === "routines" ? "active green" : ""
                  }`}
                  onClick={() => setTrainTab("routines")}
                >
                  📋 Rutinas Especiales GLP-1
                </button>
                <button
                  type="button"
                  className={`traffic-tab ${
                    trainTab === "bodymap" ? "active green" : ""
                  }`}
                  onClick={() => setTrainTab("bodymap")}
                >
                  🧍‍♀️ Mapa del Cuerpo (+110 Ejercicios)
                </button>
                <button
                  type="button"
                  className={`traffic-tab ${
                    trainTab === "session" ? "active green" : ""
                  }`}
                  onClick={() => setTrainTab("session")}
                >
                  ⏱️ Sesión en Vivo{" "}
                  {activeSession ? `(${activeSession.items.length})` : ""}
                </button>
              </div>

              {/* SUBTAB 1: GLP-1 CURATED ROUTINES */}
              {trainTab === "routines" && (
                <div className="routines-grid">
                  {GLP1_ROUTINES.map((routine) => (
                    <section key={routine.id} className="panel routine-card">
                      <div className="panel-head">
                        <span className="chip-tag">{routine.badge}</span>
                        <small>{routine.durationMin} min</small>
                      </div>
                      <h2>{routine.name}</h2>
                      <p className="muted-text">{routine.focus}</p>
                      <div className="glp1-routine-tip">
                        🐸 <strong>Consejo Ranita:</strong> {routine.glp1Tip}
                      </div>

                      {routine.days.map((d, dIdx) => (
                        <div key={dIdx} className="routine-day-box">
                          <div className="routine-day-head">
                            <strong>{d.dayName}</strong>
                            <button
                              type="button"
                              className="button primary small"
                              onClick={() => startRoutineSession(routine, dIdx)}
                            >
                              <Play size={14} /> Empezar rutina
                            </button>
                          </div>
                          <div className="routine-ex-list">
                            {d.exercises.map((item, i) => {
                              const ex = getExerciseById(item.id);
                              if (!ex) return null;
                              return (
                                <div
                                  key={i}
                                  className="routine-ex-row"
                                  onClick={() => setActiveExerciseModal(ex)}
                                >
                                  <div>
                                    <strong>{ex.name}</strong>
                                    <small>
                                      {item.sets} series × {item.reps} · Descanso{" "}
                                      {item.restSec}s
                                    </small>
                                  </div>
                                  <span className="view-anim-link">
                                    Ver animación ▶
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              )}

              {/* SUBTAB 2: INTERACTIVE BODY MAP & EXERCISE LIBRARY */}
              {trainTab === "bodymap" && (
                <div className="overview-layout">
                  <section className="panel">
                    <div className="panel-head">
                      <h2>Toca los músculos que quieres trabajar</h2>
                      <div className="sex-toggle">
                        <button
                          type="button"
                          className={`sex-btn ${
                            profile.sex === "female" ? "active" : ""
                          }`}
                          onClick={() =>
                            updateState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, sex: "female" },
                            }))
                          }
                        >
                          👩 Femenino
                        </button>
                        <button
                          type="button"
                          className={`sex-btn ${
                            profile.sex === "male" ? "active" : ""
                          }`}
                          onClick={() =>
                            updateState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, sex: "male" },
                            }))
                          }
                        >
                          👨 Masculino
                        </button>
                      </div>
                    </div>

                    <BodyMap
                      sex={profile.sex || "female"}
                      selectedMuscles={selectedMuscles}
                      onToggleMuscle={toggleMuscle}
                      highlightPriority
                    />

                    <div className="bodymap-actions-bar">
                      <button
                        type="button"
                        className="button primary"
                        onClick={startCustomMuscleSession}
                        disabled={!selectedMuscles.length}
                      >
                        <Play size={16} /> Crear sesión con músculos marcados (
                        {selectedMuscles.length})
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => setSelectedMuscles([])}
                      >
                        Ver todos los músculos
                      </button>
                    </div>
                  </section>

                  <section className="panel">
                    <div className="panel-head">
                      <h2>
                        Biblioteca con Animación ({filteredExercises.length})
                      </h2>
                      <select
                        className="equip-select"
                        value={equipmentFilter}
                        onChange={(e) => setEquipmentFilter(e.target.value)}
                      >
                        <option value="ALL">Todo el material (Casa y Gym)</option>
                        <option value="Bodyweight">🏠 Peso corporal (En casa)</option>
                        <option value="Dumbbell">🏋️‍♀️ Mancuernas</option>
                        <option value="Band">🎗️ Bandas elásticas</option>
                        <option value="Machine">⚙️ Máquinas de gimnasio</option>
                        <option value="Cable">🔗 Polea</option>
                        <option value="Barbell">🏋️ Barra</option>
                      </select>
                    </div>

                    <div className="search-input-wrap" style={{ marginBottom: 14 }}>
                      <Search size={16} />
                      <input
                        type="search"
                        placeholder="Buscar sentadilla, glúteo, remo, abdomen…"
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                      />
                    </div>

                    <div className="exercise-cards-grid">
                      {filteredExercises.slice(0, 18).map((ex) => (
                        <article
                          key={ex.id}
                          className="exercise-card"
                          onClick={() => setActiveExerciseModal(ex)}
                        >
                          <ExerciseArt slug={ex.art} height={140} live />
                          <div className="exercise-card-body">
                            <span className="muscle-mini-tag">
                              {MUSCLE_LABELS[ex.primary]?.icon}{" "}
                              {MUSCLE_LABELS[ex.primary]?.name || ex.primary}
                            </span>
                            <h3>{ex.name}</h3>
                            <small>
                              {EQUIPMENT_LABELS[ex.equipment] || ex.equipment} ·{" "}
                              {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* SUBTAB 3: LIVE WORKOUT SESSION WITH REST TIMER */}
              {trainTab === "session" && (
                <section className="panel">
                  {activeSession ? (
                    <>
                      <div className="panel-head">
                        <div>
                          <h2>{activeSession.title}</h2>
                          <p className="muted-text">
                            Marca cada serie al terminarla para activar el reloj de descanso automático.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="button primary"
                          onClick={finishWorkoutSession}
                        >
                          <CheckCircle2 size={16} /> Terminar y guardar entreno
                        </button>
                      </div>

                      <div className="session-items-stack">
                        {activeSession.items.map((item, itemIdx) => (
                          <div key={item.exercise.id} className="session-ex-block">
                            <div className="session-ex-header">
                              <ExerciseArt
                                slug={item.exercise.art}
                                height={110}
                                live
                                className="session-thumb"
                              />
                              <div>
                                <h3>{item.exercise.name}</h3>
                                <p className="muted-text">{item.note}</p>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    setActiveExerciseModal(item.exercise)
                                  }
                                >
                                  Ver instrucciones paso a paso
                                </button>
                              </div>
                            </div>

                            <div className="sets-table">
                              {item.sets.map((s, setIdx) => (
                                <div
                                  key={s.setNumber}
                                  className={`set-row ${s.done ? "done" : ""}`}
                                >
                                  <span className="set-num">
                                    Serie {s.setNumber}
                                  </span>
                                  <span className="set-reps">
                                    Meta: <strong>{s.reps}</strong> reps
                                  </span>
                                  <button
                                    type="button"
                                    className={`set-check-btn ${
                                      s.done ? "checked" : ""
                                    }`}
                                    onClick={() =>
                                      toggleSessionSet(itemIdx, setIdx)
                                    }
                                  >
                                    <Check size={15} />
                                    {s.done
                                      ? "Completada ✓"
                                      : `Marcar (+${item.restSec}s descanso)`}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-session-box">
                      <Dumbbell size={36} />
                      <h3>No tienes una sesión en curso</h3>
                      <p>
                        Elige una de las <strong>Rutinas Especiales GLP-1</strong> o toca músculos en el <strong>Mapa Corporal</strong> para empezar.
                      </p>
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => setTrainTab("routines")}
                      >
                        Ver rutinas recomendadas
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* ==================== PAGE: SETTINGS (PERFIL Y DATOS) ==================== */}
          {page === "settings" && (
            <>
              <section className="greeting">
                <div>
                  <h1>Mi Perfil y Respaldo de Datos</h1>
                  <p>
                    Personaliza tus metas de Mounjaro / Ozempic. Tus datos se guardan gratis y en privado en tu dispositivo.
                  </p>
                </div>
              </section>

              <div className="overview-layout">
                <section className="panel">
                  <h2>Configuración personal y medicación</h2>
                  <div className="form-stack">
                    <div className="two-col-inputs">
                      <label>
                        Tu nombre
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, name: e.target.value },
                            }))
                          }
                        />
                      </label>
                      <label>
                        Mapa anatómico
                        <select
                          value={profile.sex}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, sex: e.target.value },
                            }))
                          }
                        >
                          <option value="female">Femenino</option>
                          <option value="male">Masculino</option>
                        </select>
                      </label>
                    </div>

                    <div className="two-col-inputs">
                      <label>
                        Medicación o plan actual
                        <select
                          value={profile.medicationId}
                          onChange={(e) => {
                            const med =
                              MEDICATIONS.find((m) => m.id === e.target.value) ||
                              MEDICATIONS[0];
                            updateState((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                medicationId: med.id,
                                currentDose: med.doses[0],
                              },
                            }));
                          }}
                        >
                          {MEDICATIONS.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Dosis actual
                        <select
                          value={profile.currentDose}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                currentDose: e.target.value,
                              },
                            }))
                          }
                        >
                          {currentMed.doses.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="three-col-inputs">
                      <label>
                        Peso inicial ({profile.unit})
                        <input
                          type="number"
                          step="0.1"
                          value={profile.startWeight}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                startWeight: Number(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </label>
                      <label>
                        Peso meta ({profile.unit})
                        <input
                          type="number"
                          step="0.1"
                          value={profile.goalWeight}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                goalWeight: Number(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </label>
                      <label>
                        Unidad de peso
                        <select
                          value={profile.unit}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, unit: e.target.value },
                            }))
                          }
                        >
                          <option value="lb">Libras (lb)</option>
                          <option value="kg">Kilogramos (kg)</option>
                        </select>
                      </label>
                    </div>

                    <div className="two-col-inputs">
                      <label>
                        Meta diaria de proteína (g)
                        <input
                          type="number"
                          value={profile.proteinGoalG}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                proteinGoalG: Number(e.target.value) || 90,
                              },
                            }))
                          }
                        />
                      </label>
                      <label>
                        Meta diaria de agua (vasos)
                        <input
                          type="number"
                          value={profile.waterGoalGlasses}
                          onChange={(e) =>
                            updateState((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                waterGoalGlasses: Number(e.target.value) || 8,
                              },
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </section>

                <section className="panel stack-panel">
                  <h2>Tus datos y copias de seguridad</h2>
                  <p className="muted-text">
                    Igual que en GymMane y Mi Finanza, tus datos son 100% tuyos. Puedes descargar una copia JSON o restaurarla en otro teléfono.
                  </p>
                  <div className="backup-actions">
                    <button
                      type="button"
                      className="button primary"
                      onClick={handleExportBackup}
                    >
                      <Download size={16} /> Descargar respaldo (.json)
                    </button>
                    <label className="button secondary upload-label">
                      <Upload size={16} /> Restaurar respaldo
                      <input
                        type="file"
                        accept="application/json"
                        onChange={handleImportBackup}
                        hidden
                      />
                    </label>
                  </div>

                  <div className="credits-box">
                    <h3>Créditos y Licencia Abierta</h3>
                    <p>
                      Basado en la arquitectura de <strong>Mi Finanza</strong> y en el motor de entrenamiento y mapas anatómicos de{" "}
                      <a
                        href="https://github.com/InlitX/GymMane"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GymMane por InlitX
                      </a>{" "}
                      (GPL-3.0). Ilustraciones de ejercicios bajo licencia CC BY-SA 4.0 (Workout Guide / Everkinetic).
                    </p>
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal for Step-by-Step Animated Exercise Detail */}
      {activeExerciseModal && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveExerciseModal(null)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="chip-tag">
                  {MUSCLE_LABELS[activeExerciseModal.primary]?.icon}{" "}
                  {MUSCLE_LABELS[activeExerciseModal.primary]?.name}
                </span>
                <h2>{activeExerciseModal.name}</h2>
              </div>
              <button
                type="button"
                className="icon-close-btn"
                onClick={() => setActiveExerciseModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <ExerciseArt slug={activeExerciseModal.art} height={220} live />

            <div className="modal-meta-pills">
              <span>
                Material:{" "}
                <strong>
                  {EQUIPMENT_LABELS[activeExerciseModal.equipment] ||
                    activeExerciseModal.equipment}
                </strong>
              </span>
              <span>
                Nivel:{" "}
                <strong>
                  {DIFFICULTY_LABELS[activeExerciseModal.difficulty] ||
                    activeExerciseModal.difficulty}
                </strong>
              </span>
            </div>

            <div className="modal-steps">
              <h3>Pasos para hacerlo bien y cuidar tus articulaciones:</h3>
              <ol>
                {(activeExerciseModal.steps?.length
                  ? activeExerciseModal.steps
                  : [
                      "Mantén la espalda neutra y el abdomen activado durante todo el movimiento.",
                      "Inhala al bajar de forma controlada (2 segundos) y exhala al empujar o subir.",
                    ]
                ).map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-banner" role="status">
          <span>{toast}</span>
        </div>
      )}

      {/* Mobile Floating Dock (5 main destinations, matching Mi Finanza) */}
      <nav className="mobile-dock" aria-label="Navegación móvil">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`dock-btn ${active ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={20} />
              <span>{item.short}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
