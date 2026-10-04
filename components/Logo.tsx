export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rounded square */}
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0E1420" />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        stroke="url(#lg)"
        strokeWidth="1.5"
      />
      {/* Citation brackets */}
      <path
        d="M12 9.5H9.5a1.5 1.5 0 0 0-1.5 1.5v10a1.5 1.5 0 0 0 1.5 1.5H12"
        stroke="#49E3FF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M20 9.5h2.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H20"
        stroke="#49E3FF"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Superscript citation dot */}
      <circle cx="16" cy="16" r="2.6" fill="#49E3FF" />
      <defs>
        <linearGradient id="lg" x1="1" y1="1" x2="31" y2="31">
          <stop stopColor="#49E3FF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#49E3FF" stopOpacity="0.12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-[1.15rem] font-semibold tracking-tight text-paper">
        citable
        <sup className="ml-0.5 font-mono text-[0.6rem] font-medium text-cite-400">
          [1]
        </sup>
      </span>
    </span>
  );
}
