"use client";
import { useState } from "react";
export function MathLab() {
  const [a, setA] = useState(1),
    [b, setB] = useState(0),
    [c, setC] = useState(0);
  const points = Array.from({ length: 201 }, (_, i) => {
    const x = -5 + i / 20;
    return `${250 + x * 40},${150 - (a * x * x + b * x + c) * 12}`;
  }).join(" ");
  return (
    <div className="card">
      <h2>A formula you can explore.</h2>
      <p>
        Change the coefficients and watch the parabola respond. This chart is
        calculated locally.
      </p>
      <p>
        <b>
          y = {a}x² + {b}x + {c}
        </b>
      </p>
      <div className="coefficient-controls">
        {[
          ["a", a, setA],
          ["b", b, setB],
          ["c", c, setC],
        ].map(([label, value, set]) => (
          <label key={String(label)}>
            {String(label)} = {Number(value)}
            <input
              aria-label={`Coefficient ${label}`}
              type="range"
              min={-3}
              max={3}
              step={0.25}
              value={Number(value)}
              onChange={(e) =>
                (set as (n: number) => void)(Number(e.target.value))
              }
            />
          </label>
        ))}
      </div>
      <svg
        className="math-chart"
        viewBox="0 0 500 300"
        role="img"
        aria-label={`Graph of y equals ${a} x squared plus ${b} x plus ${c}. Horizontal range minus 5 to 5; vertical range minus 12.5 to 12.5.`}
      >
        <defs>
          <clipPath id="plot">
            <rect width="500" height="300" />
          </clipPath>
        </defs>
        {[-4, -2, 0, 2, 4].map((x) => (
          <g key={x}>
            <line
              x1={250 + x * 40}
              y1={0}
              x2={250 + x * 40}
              y2={300}
              stroke="var(--border)"
            />
            <text
              x={250 + x * 40 + 4}
              y={166}
              fill="var(--muted)"
              fontSize={10}
            >
              {x}
            </text>
          </g>
        ))}
        {[-10, -5, 0, 5, 10].map((y) => (
          <g key={y}>
            <line
              x1={0}
              y1={150 - y * 12}
              x2={500}
              y2={150 - y * 12}
              stroke="var(--border)"
            />
            <text x={255} y={146 - y * 12} fill="var(--muted)" fontSize={10}>
              {y}
            </text>
          </g>
        ))}
        <line x1={0} y1={150} x2={500} y2={150} stroke="var(--muted)" />
        <line x1={250} y1={0} x2={250} y2={300} stroke="var(--muted)" />
        <polyline
          clipPath="url(#plot)"
          fill="none"
          points={points}
          stroke="var(--accent)"
          strokeWidth={3}
        />
      </svg>
    </div>
  );
}
