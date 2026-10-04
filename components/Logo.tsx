export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Score bars in a rounded square */}
      <rect width="24" height="24" rx="6" fill="#3D63DD" />
      <path d="M7 16V12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 16V8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 16v-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span className="text-[1.05rem] font-semibold tracking-tight">
        <span className="text-accent-500">LLM</span>
        <span className="text-gray-500">Score</span>
      </span>
    </span>
  );
}
