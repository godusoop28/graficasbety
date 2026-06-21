"use client";

import { useRef, useState } from "react";

const defaultSubtests = [
  { label: "SEMEJANZAS", value: "11" },
  { label: "VOCABULARIO", value: "7" },
  { label: "COMPRENSIÓN", value: "7" },
  { label: "INFORMACIÓN", value: "9" },
  { label: "PALABRAS EN CONTEXTO\n(PISTAS)", value: "10" },
  { label: "DISEÑO CON CUBOS", value: "8" },
  { label: "CONCEPTOS CON DIBUJOS", value: "9" },
  { label: "MATRICES", value: "7" },
  { label: "FIGURAS INCOMPLETAS", value: "10" },
  { label: "RETENCIÓN DE DÍGITOS", value: "9" },
  { label: "SUCESIÓN DE NÚMEROS Y\nLETRAS", value: "8" },
  { label: "ARITMÉTICA", value: "13" },
  { label: "CLAVES", value: "7" },
  { label: "BÚSQUEDA DE SÍMBOLOS", value: "10" },
  { label: "REGISTROS", value: "9" },
];

const SCALE_MIN = 1;
const SCALE_MAX = 19;
const SCALE_STEPS = SCALE_MAX - SCALE_MIN; // 18

// SVG chart dimensions
const LEFT_AXIS_W = 36;
const RIGHT_AXIS_W = 36;
const COL_W = 56;
const ROW_H = 26;
const CHART_H = SCALE_STEPS * ROW_H; // 18 * 26 = 468
const N = defaultSubtests.length; // 15
const CHART_INNER_W = N * COL_W;
const SVG_W = LEFT_AXIS_W + CHART_INNER_W + RIGHT_AXIS_W;
const SVG_H = CHART_H;

// Convert a scale value (1–19) to a Y coordinate in the SVG
function valueToY(val: number): number {
  // y=0 at top = scale 19, y=CHART_H at bottom = scale 1
  return ((SCALE_MAX - val) / SCALE_STEPS) * CHART_H;
}

// Yellow band: covers score 10 row (from 9.5 to 10.5 in scale terms)
const YELLOW_Y_TOP = valueToY(10.5);
const YELLOW_Y_BOT = valueToY(9.5);
const YELLOW_H = YELLOW_Y_BOT - YELLOW_Y_TOP;

export default function WiscChart() {
  const [subtests, setSubtests] = useState(
    defaultSubtests.map((s) => ({ ...s }))
  );
  const chartRef = useRef<HTMLDivElement>(null);

  function handleChange(index: number, raw: string) {
    setSubtests((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value: raw };
      return next;
    });
  }

  async function handleExport() {
    if (!chartRef.current) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(chartRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    const link = document.createElement("a");
    link.download = "perfil-wisc-iv.png";
    link.href = dataUrl;
    link.click();
  }

  // Build SVG polyline points
  const points: { x: number; y: number; valid: boolean }[] = subtests.map(
    (s, i) => {
      const num = parseFloat(s.value);
      const valid = !isNaN(num) && num >= SCALE_MIN && num <= SCALE_MAX;
      const cx = LEFT_AXIS_W + i * COL_W + COL_W / 2;
      const cy = valid ? valueToY(num) : -1;
      return { x: cx, y: cy, valid };
    }
  );

  // Build polyline segments (only connect consecutive valid points)
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].valid && points[i + 1].valid) {
      segments.push({
        x1: points[i].x,
        y1: points[i].y,
        x2: points[i + 1].x,
        y2: points[i + 1].y,
      });
    }
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-6 px-2 bg-gray-100">
      {/* Export button — above chart, never overlapping */}
      <button
        onClick={handleExport}
        className="mb-5 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-base shadow-md transition-colors"
      >
        Generar imagen PNG
      </button>

      {/* Printable card */}
      <div
        ref={chartRef}
        className="bg-white shadow-lg"
        style={{
          padding: "24px 16px 20px",
          display: "inline-block",
          minWidth: SVG_W + 32,
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 15,
            fontWeight: 900,
            textAlign: "center",
            letterSpacing: "0.04em",
            marginBottom: 8,
            color: "#000",
          }}
        >
          PERFIL DE PUNTUACIONES ESCALARES POR SUBPRUEBA WISC-IV
        </h1>

        {/* Header row: vertical labels + score boxes */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginLeft: LEFT_AXIS_W,
            marginRight: RIGHT_AXIS_W,
            borderTop: "2px solid #000",
            borderLeft: "2px solid #000",
            borderRight: "2px solid #000",
          }}
        >
          {subtests.map((s, i) => (
            <div
              key={i}
              style={{
                width: COL_W,
                flexShrink: 0,
                borderRight: i < subtests.length - 1 ? "1px solid #888" : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Vertical label */}
              <div
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  textAlign: "center",
                  color: "#000",
                  paddingTop: 6,
                  paddingBottom: 4,
                  height: 140,
                  lineHeight: 1.2,
                  whiteSpace: "pre-line",
                  userSelect: "none",
                }}
              >
                {s.label}
              </div>

              {/* Score box */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  border: "2px solid #000",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  marginTop: 2,
                  background: "#f5f5f5",
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={s.value}
                  onChange={(e) => handleChange(i, e.target.value)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    textAlign: "center",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#000",
                    outline: "none",
                    padding: 0,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* SVG Chart */}
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: "block", border: "2px solid #000", borderTop: "none" }}
        >
          {/* Yellow band at score ~10 */}
          <rect
            x={LEFT_AXIS_W}
            y={YELLOW_Y_TOP}
            width={CHART_INNER_W}
            height={YELLOW_H}
            fill="#f5f0a0"
            opacity={0.85}
          />

          {/* Horizontal grid lines + left/right scale labels */}
          {Array.from({ length: SCALE_STEPS + 1 }, (_, i) => {
            const scaleVal = SCALE_MAX - i;
            const y = valueToY(scaleVal);
            return (
              <g key={scaleVal}>
                {/* Grid line */}
                <line
                  x1={LEFT_AXIS_W}
                  y1={y}
                  x2={LEFT_AXIS_W + CHART_INNER_W}
                  y2={y}
                  stroke={scaleVal === 10 ? "#aaa" : "#ddd"}
                  strokeWidth={scaleVal === 10 ? 1.2 : 0.8}
                />
                {/* Left label */}
                <text
                  x={LEFT_AXIS_W - 4}
                  y={y + 4}
                  textAnchor="end"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={10}
                  fontWeight={700}
                  fill="#000"
                >
                  {scaleVal}
                </text>
                {/* Right label */}
                <text
                  x={LEFT_AXIS_W + CHART_INNER_W + 4}
                  y={y + 4}
                  textAnchor="start"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={10}
                  fontWeight={700}
                  fill="#000"
                >
                  {scaleVal}
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines */}
          {subtests.map((_, i) => {
            const x = LEFT_AXIS_W + i * COL_W;
            return (
              <line
                key={i}
                x1={x}
                y1={0}
                x2={x}
                y2={CHART_H}
                stroke="#ddd"
                strokeWidth={0.8}
              />
            );
          })}
          {/* Right border vertical */}
          <line
            x1={LEFT_AXIS_W + CHART_INNER_W}
            y1={0}
            x2={LEFT_AXIS_W + CHART_INNER_W}
            y2={CHART_H}
            stroke="#ddd"
            strokeWidth={0.8}
          />

          {/* Line segments */}
          {segments.map((seg, i) => (
            <line
              key={i}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#000"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ))}

          {/* Data points */}
          {points.map((p, i) =>
            p.valid ? (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={5}
                fill="white"
                stroke="#000"
                strokeWidth={2}
              />
            ) : null
          )}
        </svg>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Ingresa valores del 1 al 19 · La gráfica se actualiza automáticamente
      </p>
    </div>
  );
}
