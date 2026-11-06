"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";

const artCache = new Map();
const POSE_MS = 650;

function loadFrames(slug) {
  if (!artCache.has(slug)) {
    const bundled = window.__EXERCISE_ART__?.[slug];
    const request = bundled
      ? Promise.resolve(bundled)
      : fetch(`./art/${slug}.txt`).then(async (response) => {
          if (!response.ok) throw new Error("No se encontró la ilustración");
          return (await response.text()).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        });
    artCache.set(slug, request.catch((error) => {
      artCache.delete(slug);
      throw error;
    }));
  }
  return artCache.get(slug);
}

export default function ExerciseArt({ slug }) {
  const [art, setArt] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlaying(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    loadFrames(slug).then(
      (frames) => { if (!cancelled) setArt({ slug, frames }); },
      () => { if (!cancelled) setArt({ slug, frames: [] }); },
    );
    return () => { cancelled = true; };
  }, [slug]);

  const frames = art?.slug === slug ? art.frames : null;
  if (!frames?.length) {
    return (
      <p className="exercise-art-message" role="status">
        {slug && !frames ? "Cargando demostración…" : "Ilustración no disponible. Consulta los pasos del ejercicio."}
      </p>
    );
  }

  // Preserve the source poses. Contours differ across drawings, so morphing their
  // points could distort the posture. Replay them in both directions with a dissolve.
  const sequence = [...frames, ...frames.slice(1, -1).reverse()];
  const animated = sequence.length === 2 || sequence.length === 4;

  return (
    <div className="exercise-art">
      <svg viewBox="0 0 500 500" role="img" aria-label="Demostración de la técnica del ejercicio">
        {(animated ? sequence : frames.slice(0, 1)).map((pose, index) => (
          <path
            key={index}
            d={pose}
            fill="currentColor"
            fillRule="evenodd"
            className={animated ? `exercise-pose exercise-pose-${sequence.length}` : undefined}
            style={animated ? {
              animationDuration: `${sequence.length * POSE_MS}ms`,
              animationDelay: `${(index - sequence.length) * POSE_MS}ms`,
              animationPlayState: playing ? "running" : "paused",
            } : undefined}
          />
        ))}
      </svg>
      {animated && (
        <button type="button" className="gm-pill-btn" onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {playing ? "Pausar demostración" : "Reproducir demostración"}
        </button>
      )}
    </div>
  );
}
