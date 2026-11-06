"use client";

import { useState } from "react";

const RANITA_PHRASES = {
  green: [
    "¡Así mismo mi reina! Proteína arriba y cero flacidez 🐸💪",
    "¡Vas bajando bonito y cuidando ese músculo! ✨",
    "¡Hidratada y alante alante, cero estrés! 💧🐸",
    "¡Esa dosis va haciendo su trabajo, y tú el tuyo! 🙌",
    "¡Glúteos firmes y estómago tranquilo hoy! 🍑✨",
    "¡Salto a salto llegamos a la meta! 🐸🌿",
  ],
  yellow: [
    "¡Ojo con el agua hoy! Bebe a sorbitos aunque no dé sed 💧",
    "Primero la proteína en el plato, deja el arroz pa'l final 🍗",
    "Come despacio y en porciones chiquitas hoy 🍵🐸",
    "¿Ya hiciste tus 20 min de fuerza hoy? ¡Cuida el músculo! 💪",
    "Nada de frituras hoy pa' que no te dé acidez 🛑",
    "Chequea tu agüita con electrolitos, mi amor 👀💧",
  ],
  red: [
    "¡Suave hoy! Caldito claro, jengibre y mucha calma 🐸🍵",
    "Cero grasa ni refrescos hoy, cuida ese estómago 🚨",
    "No te acuestes recién comida, camina 10 minutitos 🌿",
    "Si tienes náuseas fuertes, prueba proteína fría o gelatina 🧊",
    "Recuerda rotar el sitio de tu inyección cada semana 💉",
    "Si un síntoma sigue muy fuerte, consulta a tu médico 🩺",
  ],
};

export default function RanitaMascot({
  state = "green",
  size = 64,
  showBubble = true,
}) {
  const [index, setIndex] = useState(0);
  const [isPopping, setIsPopping] = useState(false);

  const isGreen = state === "green";
  const isYellow = state === "yellow";
  const isRed = state === "red";

  const phrases = RANITA_PHRASES[state] || RANITA_PHRASES.green;
  const currentPhrase = phrases[index % phrases.length];

  const handleMascotClick = (e) => {
    e.stopPropagation();
    setIsPopping(true);
    setIndex((prev) => (prev + 1) % phrases.length);
    setTimeout(() => setIsPopping(false), 380);
  };

  return (
    <div
      className={`ranita-interactive-unit ranita-${state} ${
        isPopping ? "ranita-popping" : ""
      }`}
      onClick={handleMascotClick}
      title="¡Toca a la Ranita para otro consejo!"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleMascotClick(e);
      }}
      aria-label={`Ranita: ${currentPhrase}`}
    >
      {showBubble && (
        <div className={`ranita-speech-bubble bubble-${state}`}>
          <span>{currentPhrase}</span>
          <span className="bubble-tail" />
        </div>
      )}

      <div
        className="ranita-svg-wrap"
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground shadow */}
          <ellipse cx="50" cy="93" rx="30" ry="5" fill="rgba(0,0,0,0.22)" />

          {/* Little Frog Feet */}
          <ellipse
            cx="28"
            cy="88"
            rx="11"
            ry="5.5"
            fill="#22c55e"
            stroke="#14532d"
            strokeWidth="2.6"
          />
          <ellipse
            cx="72"
            cy="88"
            rx="11"
            ry="5.5"
            fill="#22c55e"
            stroke="#14532d"
            strokeWidth="2.6"
          />

          {/* Frog Body / Belly */}
          <ellipse
            cx="50"
            cy="68"
            rx="31"
            ry="23"
            fill="#4ade80"
            stroke="#14532d"
            strokeWidth="2.8"
          />
          <ellipse cx="50" cy="71" rx="21" ry="15" fill="#dcfce7" />

          {/* Belly heart / wellness badge */}
          <path
            d="M50 75 C46 71 43 68 43 65.5 C43 63.5 44.6 62 46.6 62 C48 62 49.2 62.8 50 64 C50.8 62.8 52 62 53.4 62 C55.4 62 57 63.5 57 65.5 C57 68 54 71 50 75 Z"
            fill={isRed ? "#f43f5e" : isYellow ? "#f59e0b" : "#10b981"}
            opacity="0.85"
          />

          {/* Big Frog Eye Domes */}
          <g className="ranita-eyes">
            <circle
              cx="31"
              cy="28"
              r="14"
              fill="#4ade80"
              stroke="#14532d"
              strokeWidth="2.8"
            />
            <circle
              cx="69"
              cy="28"
              r="14"
              fill="#4ade80"
              stroke="#14532d"
              strokeWidth="2.8"
            />
          </g>

          {/* Frog Head */}
          <ellipse
            cx="50"
            cy="46"
            rx="35"
            ry="23"
            fill="#4ade80"
            stroke="#14532d"
            strokeWidth="2.8"
          />

          {/* Sporty Sweatband on Forehead */}
          <path
            d="M18 39 Q50 32 82 39 L81 44 Q50 37 19 44 Z"
            fill={isRed ? "#fb7185" : isYellow ? "#fbbf24" : "#38bdf8"}
            stroke="#14532d"
            strokeWidth="1.8"
          />

          {/* Eye Whites & Pupils */}
          <circle
            cx="31"
            cy="27"
            r="9.5"
            fill="#ffffff"
            stroke="#14532d"
            strokeWidth="2.2"
          />
          <circle
            cx="69"
            cy="27"
            r="9.5"
            fill="#ffffff"
            stroke="#14532d"
            strokeWidth="2.2"
          />

          <g className="ranita-pupils">
            <circle cx="32" cy="27" r="4.8" fill="#0f172a" />
            <circle cx="33.8" cy="25" r="1.8" fill="#ffffff" />
            <circle cx="68" cy="27" r="4.8" fill="#0f172a" />
            <circle cx="69.8" cy="25" r="1.8" fill="#ffffff" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse
            cx="24"
            cy="51"
            rx="6.5"
            ry="4"
            fill="#fda4af"
            opacity="0.78"
          />
          <ellipse
            cx="76"
            cy="51"
            rx="6.5"
            ry="4"
            fill="#fda4af"
            opacity="0.78"
          />

          {/* Nostrils */}
          <circle cx="46" cy="43" r="1.5" fill="#14532d" />
          <circle cx="54" cy="43" r="1.5" fill="#14532d" />

          {/* Expressions */}
          {isGreen && (
            <g>
              <path
                d="M36 51 Q50 63 64 51"
                stroke="#14532d"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="#fda4af"
              />
            </g>
          )}

          {isYellow && (
            <g>
              <path
                d="M40 54 Q50 51 60 54"
                stroke="#14532d"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Water drop reminder */}
              <path
                className="sweat-drop"
                d="M85 20 C85 16 89 12 89 12 C89 12 93 16 93 20 C93 22.5 91.2 24.5 89 24.5 C86.8 24.5 85 22.5 85 20 Z"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1.2"
              />
            </g>
          )}

          {isRed && (
            <g>
              <path
                d="M39 56 Q50 49 61 56"
                stroke="#14532d"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                className="sweat-drop"
                d="M14 22 C14 18 18 14 18 14 C18 14 22 18 22 22 C22 24.5 20.2 26.5 18 26.5 C15.8 26.5 14 24.5 14 22 Z"
                fill="#67e8f9"
                stroke="#0284c7"
                strokeWidth="1.2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
