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
      {/* Simple quotation mark in a rounded square */}
      <rect width="24" height="24" rx="6" fill="#3D63DD" />
      <path
        d="M9.5 8H7.75A1.75 1.75 0 0 0 6 9.75v4.5A1.75 1.75 0 0 0 7.75 16H9.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.5 8h1.75A1.75 1.75 0 0 1 18 9.75v4.5A1.75 1.75 0 0 1 16.25 16H14.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span className="text-[1.05rem] font-semibold tracking-tight text-gray-900">
        Citable
      </span>
    </span>
  );
}
