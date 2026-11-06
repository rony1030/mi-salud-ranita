"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

const artCache = new Map();

function computeViewBox(frames) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const firstFrame = frames[0] || "";
  const tokenRegex = /([MLC])\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/g;
  let match;
  while ((match = tokenRegex.exec(firstFrame)) !== null) {
    const x = parseFloat(match[2]);
    const y = parseFloat(match[3]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (!Number.isFinite(minX) || maxX <= minX) {
    return "0 0 500 500";
  }
  const pad = 35;
  return `0 0 ${Math.max(460, Math.ceil(maxX + pad))} ${Math.max(460, Math.ceil(maxY + pad))}`;
}

export default function ExerciseArt({
  slug,
  height = 170,
  live = true,
  className = "",
}) {
  const [data, setData] = useState(() => (slug ? artCache.get(slug) || null : null));
  const [frameIdx, setFrameIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (artCache.has(slug)) {
      setData(artCache.get(slug));
      setFailed(false);
      return;
    }
    if (typeof window !== "undefined" && window.__EXERCISE_ART__?.[slug]) {
      const frames = window.__EXERCISE_ART__[slug];
      const parsed = { frames, viewBox: computeViewBox(frames) };
      artCache.set(slug, parsed);
      setData(parsed);
      setFailed(false);
      return;
    }
    let cancelled = false;
    fetch(`./art/${slug}.txt`)
      .then((r) => {
        if (!r.ok) throw new Error("No art");
        return r.text();
      })
      .then((txt) => {
        if (cancelled) return;
        const frames = txt
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (!frames.length) throw new Error("Empty art");
        const parsed = { frames, viewBox: computeViewBox(frames) };
        artCache.set(slug, parsed);
        setData(parsed);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!live || !data || data.frames.length < 2) return;
    const total = data.frames.length;
    const sequence = [];
    for (let i = 0; i < total; i++) sequence.push(i);
    for (let i = total - 2; i > 0; i--) sequence.push(i);
    let step = 0;
    const timer = setInterval(() => {
      step = (step + 1) % sequence.length;
      setFrameIdx(sequence[step]);
    }, 620);
    return () => clearInterval(timer);
  }, [live, data]);

  if (!slug || failed || !data) {
    return (
      <div
        className={`exercise-art-box fallback ${className}`}
        style={{ height }}
      >
        <Dumbbell size={32} />
      </div>
    );
  }

  const currentPath = data.frames[frameIdx % data.frames.length] || data.frames[0];

  return (
    <div className={`exercise-art-box ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={currentPath} fill="#0c094e" fillRule="evenodd" />
      </svg>
      {data.frames.length > 1 && (
        <span className="exercise-art-badge">
          {live ? `Animado · ${frameIdx + 1}/${data.frames.length}` : "Guía visual"}
        </span>
      )}
    </div>
  );
}
