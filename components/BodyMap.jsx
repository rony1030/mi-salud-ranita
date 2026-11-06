"use client";

import {
  bodyViewW,
  bodyViewH,
  bodyBaseMain,
  bodyBaseLite,
  muscleFills,
  femaleBaseMain,
  femaleBaseLite,
  femaleFills,
  femaleHead,
} from "../lib/body-svg-data.mjs";
import { MUSCLE_LABELS } from "../lib/glp1-data.mjs";

export default function BodyMap({
  sex = "female",
  selectedMuscles = [],
  onToggleMuscle,
  highlightPriority = false,
}) {
  const isFemale = sex === "female";
  const baseMain = isFemale ? femaleBaseMain : bodyBaseMain;
  const baseLite = isFemale ? femaleBaseLite : bodyBaseLite;
  const fills = isFemale ? femaleFills : muscleFills;
  const headPaths = isFemale ? femaleHead : [];

  const selectedSet = new Set(selectedMuscles);

  return (
    <div className="bodymap-wrapper">
      <div className="bodymap-stage">
        <div className="bodymap-labels-top">
          <span>Frente</span>
          <span>Espalda</span>
        </div>
        <svg
          viewBox={`0 0 ${bodyViewW} ${bodyViewH}`}
          className="bodymap-svg"
          role="img"
          aria-label="Mapa anatómico muscular interactivo de frente y espalda"
        >
          {/* Base silhouette */}
          <g className="bodymap-base-main">
            {baseMain.map((d, i) => (
              <path key={`bm-${i}`} d={d} fill="#cbd5e1" />
            ))}
          </g>
          <g className="bodymap-base-lite">
            {baseLite.map((d, i) => (
              <path key={`bl-${i}`} d={d} fill="#e2e8f0" />
            ))}
          </g>
          {headPaths.length > 0 && (
            <g className="bodymap-head">
              {headPaths.map((d, i) => (
                <path key={`bh-${i}`} d={d} fill="#cbd5e1" />
              ))}
            </g>
          )}

          {/* Interactive Muscle Groups */}
          {Object.entries(fills).map(([muscleId, paths]) => {
            const isSelected = selectedSet.has(muscleId);
            const isPriority =
              highlightPriority && MUSCLE_LABELS[muscleId]?.priorityGlp1;
            const fillColor = isSelected
              ? "#059669"
              : isPriority
                ? "#6ee7b7"
                : "#94a3b8";
            const strokeColor = isSelected ? "#064e3b" : "transparent";

            return (
              <g
                key={muscleId}
                className={`bodymap-muscle ${isSelected ? "selected" : ""}`}
                onClick={() => onToggleMuscle?.(muscleId)}
                style={{ cursor: "pointer" }}
              >
                <title>
                  {MUSCLE_LABELS[muscleId]?.name || muscleId} — Toca para
                  seleccionar
                </title>
                {paths.map((d, idx) => (
                  <path
                    key={`${muscleId}-${idx}`}
                    d={d}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? "1.6" : "0.4"}
                    style={{
                      transition: "fill 0.18s ease, transform 0.18s ease",
                    }}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="bodymap-chips">
        {Object.entries(MUSCLE_LABELS).map(([id, info]) => {
          const active = selectedSet.has(id);
          return (
            <button
              key={id}
              type="button"
              className={`muscle-chip ${active ? "active" : ""} ${
                info.priorityGlp1 ? "priority-glp1" : ""
              }`}
              onClick={() => onToggleMuscle?.(id)}
            >
              <span>{info.icon}</span>
              <span>{info.name}</span>
              {info.priorityGlp1 && (
                <small className="glp1-tag" title="Prioridad anti-flacidez GLP-1">
                  Clave GLP-1
                </small>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
