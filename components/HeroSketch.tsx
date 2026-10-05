/**
 * HeroSketch — a cartographer's audit.
 *
 * In the style of hand-drawn historical town maps: a site is sketched
 * as a settlement, streets branch to its pages, and a surveyor's
 * annotations score each part. Pure SVG + CSS, draws once on load.
 */

const ink = "#1A1A2E";
const sepia = "#55724E";
const redWash = "#9B3B2E";
const amberWash = "#B8860B";
const greenWash = "#55724E";

function d(delay: number, duration?: number) {
  return {
    animationDelay: `${delay}s`,
    ...(duration ? { animationDuration: `${duration}s` } : {}),
  } as React.CSSProperties;
}

export default function HeroSketch() {
  return (
    <div className="sketch-anim relative mx-auto w-full max-w-[560px]">
      <svg
        viewBox="0 0 560 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Hand-drawn map of a website audit: pages branch from a central site and each receives an AI-readiness score, totalling 64 out of 100."
        className="h-auto w-full"
      >
        {/* ---- survey frame ---- */}
        <path
          className="draw"
          style={d(0.1, 1.2)}
          pathLength={1}
          d="M14 12 C 150 7, 420 16, 548 11 C 552 130, 545 330, 549 449 C 400 453, 140 446, 12 450 C 8 320, 16 130, 14 12 Z"
          stroke={ink}
          strokeOpacity="0.35"
          strokeWidth="1.3"
        />
        <text
          className="appear"
          style={{ ...d(0.5), fontFamily: "var(--font-hand)" }}
          x="30"
          y="38"
          fontSize="17"
          fill={ink}
          fillOpacity="0.65"
        >
          survey of yourdomain.com — AD 2026
        </text>

        {/* ---- central site (the town) ---- */}
        <path
          className="draw"
          style={d(0.9, 1.3)}
          pathLength={1}
          d="M216 196 C 256 192, 306 198, 344 194 C 348 222, 344 252, 347 278 C 308 282, 254 277, 214 281 C 211 252, 217 224, 216 196 Z"
          stroke={ink}
          strokeWidth="2"
        />
        {/* roof hatching on the town */}
        <path
          className="scribble"
          style={d(1.6)}
          pathLength={1}
          d="M224 205 L 240 199 M236 213 L 258 202 M250 218 L 278 203 M268 220 L 296 204"
          stroke={ink}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <text
          className="appear"
          style={d(1.9)}
          x="280"
          y="234"
          textAnchor="middle"
          fontSize="15"
          fontFamily="var(--font-serif)"
          fontWeight="600"
          fill={ink}
        >
          yourdomain.com
        </text>
        <text
          className="appear"
          style={{ ...d(2.1), fontFamily: "var(--font-hand)" }}
          x="280"
          y="258"
          textAnchor="middle"
          fontSize="14"
          fill={ink}
          fillOpacity="0.6"
        >
          340 pages surveyed
        </text>

        {/* ---- streets branching out ---- */}
        {/* to llms.txt (north-west) */}
        <path
          className="draw"
          style={d(2.4, 0.8)}
          pathLength={1}
          d="M226 196 C 200 170, 172 148, 142 128"
          stroke={ink}
          strokeWidth="1.4"
          strokeDasharray="1"
        />
        {/* to /docs (north-east) */}
        <path
          className="draw"
          style={d(2.7, 0.8)}
          pathLength={1}
          d="M336 196 C 362 172, 392 152, 422 134"
          stroke={ink}
          strokeWidth="1.4"
        />
        {/* to /pricing (south-west) */}
        <path
          className="draw"
          style={d(3.0, 0.8)}
          pathLength={1}
          d="M224 280 C 198 304, 170 324, 140 342"
          stroke={ink}
          strokeWidth="1.4"
        />
        {/* to /blog (south-east) */}
        <path
          className="draw"
          style={d(3.3, 0.8)}
          pathLength={1}
          d="M338 280 C 364 302, 394 324, 424 342"
          stroke={ink}
          strokeWidth="1.4"
        />

        {/* ---- llms.txt plot (problem area) ---- */}
        <path
          className="draw"
          style={d(3.2, 0.9)}
          pathLength={1}
          d="M76 92 C 110 89, 152 94, 186 91 C 189 108, 186 124, 188 139 C 154 142, 110 138, 78 141 C 75 125, 79 107, 76 92 Z"
          stroke={ink}
          strokeWidth="1.6"
        />
        <text
          className="appear"
          style={d(3.8)}
          x="132"
          y="112"
          textAnchor="middle"
          fontSize="13"
          fontFamily="var(--font-serif)"
          fontWeight="600"
          fill={ink}
        >
          llms.txt
        </text>
        <text
          className="appear"
          style={{ ...d(4.3), fontFamily: "var(--font-hand)" }}
          x="132"
          y="130"
          textAnchor="middle"
          fontSize="15"
          fill={redWash}
        >
          40/100 — 14 dead paths
        </text>
        {/* surveyor's cross mark */}
        <path
          className="scribble"
          style={d(4.5)}
          pathLength={1}
          d="M62 86 L 76 100 M76 86 L 62 100"
          stroke={redWash}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ---- /docs plot (healthy) ---- */}
        <path
          className="draw"
          style={d(3.6, 0.9)}
          pathLength={1}
          d="M382 96 C 414 93, 454 98, 486 95 C 489 112, 486 128, 488 143 C 456 146, 414 142, 384 145 C 381 129, 385 111, 382 96 Z"
          stroke={ink}
          strokeWidth="1.6"
        />
        <text
          className="appear"
          style={d(4.2)}
          x="434"
          y="116"
          textAnchor="middle"
          fontSize="13"
          fontFamily="var(--font-serif)"
          fontWeight="600"
          fill={ink}
        >
          /docs
        </text>
        <text
          className="appear"
          style={{ ...d(4.7), fontFamily: "var(--font-hand)" }}
          x="434"
          y="134"
          textAnchor="middle"
          fontSize="15"
          fill={greenWash}
        >
          85/100 — sound
        </text>
        {/* check mark */}
        <path
          className="scribble"
          style={d(4.9)}
          pathLength={1}
          d="M496 88 C 499 92, 501 95, 503 98 C 507 91, 511 85, 516 80"
          stroke={greenWash}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ---- /pricing plot ---- */}
        <path
          className="draw"
          style={d(4.0, 0.9)}
          pathLength={1}
          d="M74 356 C 108 353, 150 358, 184 355 C 187 372, 184 388, 186 403 C 152 406, 108 402, 76 405 C 73 389, 77 371, 74 356 Z"
          stroke={ink}
          strokeWidth="1.6"
        />
        <text
          className="appear"
          style={d(4.6)}
          x="130"
          y="376"
          textAnchor="middle"
          fontSize="13"
          fontFamily="var(--font-serif)"
          fontWeight="600"
          fill={ink}
        >
          /pricing
        </text>
        <text
          className="appear"
          style={{ ...d(5.1), fontFamily: "var(--font-hand)" }}
          x="130"
          y="394"
          textAnchor="middle"
          fontSize="15"
          fill={amberWash}
        >
          60/100 — schema thin
        </text>

        {/* ---- /blog plot ---- */}
        <path
          className="draw"
          style={d(4.4, 0.9)}
          pathLength={1}
          d="M380 356 C 414 353, 456 358, 490 355 C 493 372, 490 388, 492 403 C 458 406, 414 402, 382 405 C 379 389, 383 371, 380 356 Z"
          stroke={ink}
          strokeWidth="1.6"
        />
        <text
          className="appear"
          style={d(5.0)}
          x="436"
          y="376"
          textAnchor="middle"
          fontSize="13"
          fontFamily="var(--font-serif)"
          fontWeight="600"
          fill={ink}
        >
          /blog
        </text>
        <text
          className="appear"
          style={{ ...d(5.5), fontFamily: "var(--font-hand)" }}
          x="436"
          y="394"
          textAnchor="middle"
          fontSize="15"
          fill={amberWash}
        >
          55/100 — no TL;DRs
        </text>

        {/* ---- surveyor's fix note with arrow ---- */}
        <path
          className="draw"
          style={d(5.8, 0.8)}
          pathLength={1}
          d="M160 66 C 152 72, 144 79, 138 86"
          stroke={sepia}
          strokeWidth="1.4"
        />
        <path
          className="scribble"
          style={d(6.4)}
          pathLength={1}
          d="M142 78 C 141 81, 139 84, 138 86 C 141 86, 145 86, 148 87"
          stroke={sepia}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <text
          className="appear"
          style={{ ...d(6.0), fontFamily: "var(--font-hand)" }}
          x="30"
          y="64"
          fontSize="16"
          fill={sepia}
        >
          rebuild this first
        </text>
        <text
          className="appear"
          style={{ ...d(6.0), fontFamily: "var(--font-hand)" }}
          x="30"
          y="82"
          fontSize="16"
          fill={sepia}
        >
          — biggest gain
        </text>

        {/* ---- overall score seal ---- */}
        <path
          className="draw"
          style={d(6.6, 1.0)}
          pathLength={1}
          d="M280 62 C 280 44, 296 32, 313 34 C 330 36, 340 50, 338 66 C 336 82, 322 92, 306 90 C 290 88, 280 78, 280 62 Z"
          stroke={sepia}
          strokeWidth="2"
        />
        <path
          className="draw"
          style={d(7.0, 0.8)}
          pathLength={1}
          d="M285 62 C 286 48, 298 38, 312 40 C 325 42, 334 52, 333 65 C 332 78, 320 86, 307 85 C 294 84, 284 74, 285 62 Z"
          stroke={sepia}
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        <text
          className="appear"
          style={d(7.2)}
          x="309"
          y="68"
          textAnchor="middle"
          fontSize="20"
          fontFamily="var(--font-serif)"
          fontWeight="700"
          fill={ink}
        >
          64
        </text>
        <text
          className="appear"
          style={{ ...d(7.5), fontFamily: "var(--font-hand)" }}
          x="309"
          y="112"
          textAnchor="middle"
          fontSize="15"
          fill={sepia}
        >
          of 100 — needs work
        </text>

        {/* ---- compass rose, bottom centre ---- */}
        <g className="appear" style={d(7.8)}>
          <path
            d="M280 408 L 280 436 M266 422 L 294 422"
            stroke={ink}
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle
            cx="280"
            cy="422"
            r="9"
            stroke={ink}
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
          <text
            x="280"
            y="400"
            textAnchor="middle"
            fontSize="12"
            fontFamily="var(--font-hand)"
            fill={ink}
            fillOpacity="0.55"
          >
            N
          </text>
        </g>
      </svg>
    </div>
  );
}
