export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Hand-sketched frame: slightly wobbly double-stroked box */}
      <path
        d="M3.4 2.8 C 9 2.2, 16 3.3, 20.8 2.9 C 21.4 8, 20.6 15, 21.1 20.9 C 15 21.6, 8 20.7, 3.1 21.2 C 2.6 15.5, 3.3 8.5, 3.4 2.8 Z"
        stroke="#1A1A2E"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sketched rising score bars */}
      <path
        d="M7.2 17.3 C 7.1 16, 7.3 14.6, 7.1 13.4"
        stroke="#1A1A2E"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12.1 17.2 C 12 14.4, 12.2 11.6, 12 9.1"
        stroke="#8B4513"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.9 17.3 C 17 15.2, 16.8 12.9, 17 10.9"
        stroke="#1A1A2E"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Annotation tick above the tallest bar */}
      <path
        d="M10.6 6.9 C 11.2 6.4, 12.6 6.2, 13.5 6.6"
        stroke="#8B4513"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span className="font-serif text-[1.15rem] font-semibold tracking-tight">
        <span className="text-accent-600">LLM</span>
        <span className="text-ink">Score</span>
      </span>
    </span>
  );
}
