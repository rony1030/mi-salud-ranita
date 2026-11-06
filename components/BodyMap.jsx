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
          <span>Vista Frontal</span>
          <span>Vista Posterior</span>
        </div>
        <svg
          viewBox={`0 0 ${bodyViewW} ${bodyViewH}`}
          className="bodymap-svg"
          role="img"
          aria-label="Mapa anatómico interactivo GymMane"
        >
          {/* Base anatomical silhouette in dark theme */}
          <g className="bodymap-base-main">
            {baseMain.map((d, i) => (
              <path key={`bm-${i}`} d={d} fill="#272730" stroke="#16161A" strokeWidth="0.5" />
            ))}
          </g>
          <g className="bodymap-base-lite">
            {baseLite.map((d, i) => (
              <path key={`bl-${i}`} d={d} fill="#32323E" />
            ))}
          </g>
          {headPaths.length > 0 && (
            <g className="bodymap-head">
              {headPaths.map((d, i) => (
                <path key={`bh-${i}`} d={d} fill="#272730" />
              ))}
            </g>
          )}

          {/* Interactive Muscle Groups */}
          {Object.entries(fills).map(([muscleId, paths]) => {
            const isSelected = selectedSet.has(muscleId);
            const isPriority = highlightPriority && MUSCLE_LABELS[muscleId]?.priorityGlp1;

            let fillColor = "#3F3F4E";
            let strokeColor = "transparent";
            let strokeWidth = "0.4";

            if (isSelected) {
              fillColor = "#FF6B35"; // GymMane athletic orange
              strokeColor = "#FFA07A";
              strokeWidth = "1.8";
            } else if (isPriority) {
              fillColor = "#1E3A34"; // Dark emerald base
              strokeColor = "#10B981"; // Emerald border
              strokeWidth = "1.2";
            }

            return (
              <g
                key={muscleId}
                className={`bodymap-muscle ${isSelected ? "selected" : ""} ${isPriority ? "priority-glp1" : ""}`}
                onClick={() => onToggleMuscle?.(muscleId)}
                style={{ cursor: "pointer" }}
              >
                <title>
                  {MUSCLE_LABELS[muscleId]?.name || muscleId} — Toca para filtrar
                </title>
                {paths.map((d, idx) => (
                  <path
                    key={`${muscleId}-${idx}`}
                    d={d}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    style={{
                      transition: "fill 0.18s ease, stroke 0.18s ease, transform 0.18s ease",
                    }}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        <div className="bodymap-legend">
          <div className="legend-item">
            <span className="legend-dot orange"></span>
            <span>Seleccionado</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot emerald"></span>
            <span>Prioridad Anti-Flacidez</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot neutral"></span>
            <span>Músculo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
