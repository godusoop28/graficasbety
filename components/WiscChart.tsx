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
const SCALE_STEPS = SCALE_MAX - SCALE_MIN;

const LEFT_AXIS_W = 40;
const RIGHT_AXIS_W = 40;
const COL_W = 56;
const ROW_H = 26;
const CHART_H = SCALE_STEPS * ROW_H;
const N = defaultSubtests.length;
const CHART_INNER_W = N * COL_W;
const SVG_W = LEFT_AXIS_W + CHART_INNER_W + RIGHT_AXIS_W;

const LABEL_H = 148;
const BOX_SIZE = 40;
const CARD_PAD_X = 24;

function valueToY(val: number): number {
  return ((SCALE_MAX - val) / SCALE_STEPS) * CHART_H;
}

const YELLOW_Y_TOP = valueToY(10.5);
const YELLOW_Y_BOT = valueToY(9.5);
const YELLOW_H = YELLOW_Y_BOT - YELLOW_Y_TOP;

const BORDER = "1.5px solid #1f2937";

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

  const points = subtests.map((s, i) => {
    const num = parseFloat(s.value);
    const valid = !isNaN(num) && num >= SCALE_MIN && num <= SCALE_MAX;
    return {
      x: LEFT_AXIS_W + i * COL_W + COL_W / 2,
      y: valid ? valueToY(num) : -1,
      valid,
    };
  });

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        padding: "32px 12px 40px",
        backgroundColor: "#f1f3f5",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Export button — outside chartRef, never captured */}
      <button
        onClick={handleExport}
        style={{
          marginBottom: 24,
          padding: "10px 28px",
          backgroundColor: "#1f2937",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.05em",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#374151")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#1f2937")
        }
      >
        Exportar como PNG
      </button>

      {/* Scrollable wrapper — allows horizontal scroll on mobile */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "visible",
        }}
      >
        {/* Centering flex row inside scroll area */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minWidth: "max-content",
          }}
        >
          {/* Shadow ring (not captured) */}
          <div
            style={{
              borderRadius: 10,
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* ── Printable card — captured by html-to-image ── */}
            <div
              ref={chartRef}
              style={{
                backgroundColor: "#ffffff",
                padding: `28px ${CARD_PAD_X}px 24px`,
                display: "inline-block",
              }}
            >
              {/* Title */}
              <h1
                style={{
                  margin: "0 0 18px 0",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: "#111827",
                  lineHeight: 1.4,
                  textTransform: "uppercase",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                Perfil de Puntuaciones Escalares por Subprueba WISC-IV
              </h1>

              {/* ── Header: vertical labels + score boxes ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: LEFT_AXIS_W,
                  marginRight: RIGHT_AXIS_W,
                  borderTop: BORDER,
                  borderLeft: BORDER,
                  borderRight: BORDER,
                  borderBottom: BORDER,
                }}
              >
                {subtests.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      width: COL_W,
                      flexShrink: 0,
                      borderRight:
                        i < subtests.length - 1
                          ? "1px solid #d1d5db"
                          : "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {/* Vertical subtest label */}
                    <div
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        fontSize: 8.5,
                        fontWeight: 700,
                        textAlign: "center",
                        color: "#1f2937",
                        paddingTop: 8,
                        paddingBottom: 6,
                        height: LABEL_H,
                        lineHeight: 1.25,
                        whiteSpace: "pre-line",
                        userSelect: "none",
                        letterSpacing: "0.025em",
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      {s.label}
                    </div>

                    {/* Score input box */}
                    <div
                      style={{
                        width: BOX_SIZE,
                        height: BOX_SIZE,
                        border: "1.5px solid #374151",
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 5,
                        marginBottom: 8,
                        backgroundColor: "#f3f4f6",
                        boxSizing: "border-box",
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
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#111827",
                          outline: "none",
                          padding: 0,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── SVG Chart ── */}
              <svg
                width={SVG_W}
                height={CHART_H}
                viewBox={`0 0 ${SVG_W} ${CHART_H}`}
                style={{
                  display: "block",
                  border: BORDER,
                  borderTop: "none",
                }}
              >
                {/* Yellow band: score 10 range */}
                <rect
                  x={LEFT_AXIS_W}
                  y={YELLOW_Y_TOP}
                  width={CHART_INNER_W}
                  height={YELLOW_H}
                  fill="#fef9c3"
                  opacity={0.85}
                />

                {/* Horizontal grid lines + left/right scale labels */}
                {Array.from({ length: SCALE_STEPS + 1 }, (_, i) => {
                  const scaleVal = SCALE_MAX - i;
                  const y = valueToY(scaleVal);
                  const isMid = scaleVal === 10;
                  return (
                    <g key={scaleVal}>
                      <line
                        x1={LEFT_AXIS_W}
                        y1={y}
                        x2={LEFT_AXIS_W + CHART_INNER_W}
                        y2={y}
                        stroke={isMid ? "#9ca3af" : "#e5e7eb"}
                        strokeWidth={isMid ? 1.1 : 0.6}
                      />
                      <text
                        x={LEFT_AXIS_W - 7}
                        y={y + 4}
                        textAnchor="end"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fontSize={9.5}
                        fontWeight={700}
                        fill="#374151"
                      >
                        {scaleVal}
                      </text>
                      <text
                        x={LEFT_AXIS_W + CHART_INNER_W + 7}
                        y={y + 4}
                        textAnchor="start"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fontSize={9.5}
                        fontWeight={700}
                        fill="#374151"
                      >
                        {scaleVal}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical grid lines */}
                {subtests.map((_, i) => (
                  <line
                    key={i}
                    x1={LEFT_AXIS_W + i * COL_W}
                    y1={0}
                    x2={LEFT_AXIS_W + i * COL_W}
                    y2={CHART_H}
                    stroke="#e5e7eb"
                    strokeWidth={0.6}
                  />
                ))}
                {/* Right inner border line */}
                <line
                  x1={LEFT_AXIS_W + CHART_INNER_W}
                  y1={0}
                  x2={LEFT_AXIS_W + CHART_INNER_W}
                  y2={CHART_H}
                  stroke="#e5e7eb"
                  strokeWidth={0.6}
                />

                {/* Connecting line segments */}
                {segments.map((seg, i) => (
                  <line
                    key={i}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke="#111827"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Data point circles */}
                {points.map((p, i) =>
                  p.valid ? (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={5.5}
                      fill="white"
                      stroke="#111827"
                      strokeWidth={2}
                    />
                  ) : null
                )}
              </svg>
            </div>
            {/* ── end printable card ── */}
          </div>
        </div>
      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 11,
          color: "#9ca3af",
          textAlign: "center",
          letterSpacing: "0.04em",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Ingresa valores del 1 al 19 · La gráfica se actualiza automáticamente
      </p>
    </div>
  );
}
