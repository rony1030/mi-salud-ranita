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
  highlightPriority = true,
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
        <div className="bodymap-header-row">
          <span className="bodymap-view-label">FRENTE</span>
          <span className="bodymap-view-label">ESPALDA</span>
        </div>

        <svg
          viewBox={`0 0 ${bodyViewW} ${bodyViewH}`}
          className="bodymap-svg"
          role="img"
          aria-label="Mapa anatómico interactivo GymMane"
        >
          {/* Base anatomical silhouette in deep dark slate */}
          <g className="bodymap-base-main">
            {baseMain.map((d, i) => (
              <path key={`bm-${i}`} d={d} fill="#18181D" stroke="#0E0E12" strokeWidth="0.8" />
            ))}
          </g>
          <g className="bodymap-base-lite">
            {baseLite.map((d, i) => (
              <path key={`bl-${i}`} d={d} fill="#24242C" />
            ))}
          </g>
          {headPaths.length > 0 && (
            <g className="bodymap-head">
              {headPaths.map((d, i) => (
                <path key={`bh-${i}`} d={d} fill="#18181D" />
              ))}
            </g>
          )}

          {/* Interactive Muscle Groups */}
          {Object.entries(fills).map(([muscleId, paths]) => {
            const isSelected = selectedSet.has(muscleId);
            const isPriority = highlightPriority && MUSCLE_LABELS[muscleId]?.priorityGlp1;

            let fillColor = "#2C2C36";
            let strokeColor = "#1A1A22";
            let strokeWidth = "0.5";

            if (isSelected) {
              fillColor = "#FFFFFF"; // High-contrast crisp white like GymMane original
              strokeColor = "#FF8A65";
              strokeWidth = "1.5";
            } else if (isPriority) {
              fillColor = "#1D2F28"; // Subtle emerald tint
              strokeColor = "rgba(16, 185, 129, 0.4)";
              strokeWidth = "1";
            }

            return (
              <g
                key={muscleId}
                className={`bodymap-muscle ${isSelected ? "selected" : ""} ${isPriority ? "priority-glp1" : ""}`}
                onClick={() => onToggleMuscle?.(muscleId)}
                style={{ cursor: "pointer" }}
              >
                <title>
                  {MUSCLE_LABELS[muscleId]?.name || muscleId} — Toca para seleccionar
                </title>
                {paths.map((d, idx) => (
                  <path
                    key={`${muscleId}-${idx}`}
                    d={d}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    style={{
                      transition: "fill 0.15s ease, stroke 0.15s ease, filter 0.15s ease",
                      filter: isSelected ? "drop-shadow(0 0 6px rgba(255,255,255,0.4))" : "none",
                    }}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        <div className="bodymap-mini-legend">
          <div className="mini-legend-item">
            <span className="dot white"></span>
            <span>Seleccionado</span>
          </div>
          <div className="mini-legend-item">
            <span className="dot emerald"></span>
            <span>Prioridad GLP-1</span>
          </div>
          <div className="mini-legend-item">
            <span className="dot slate"></span>
            <span>Músculo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
