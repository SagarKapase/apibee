// The bee mark: code brackets, a hexagon body with a check, and a striped tail.
// Brackets and antennae use currentColor so they follow the theme's text color;
// the check stays dark because it always sits on the amber body.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 312"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M104 18Q127 28 131 74M216 18Q193 28 189 74" strokeWidth="12" />
        <path d="M71 96 20 146 71 196M249 96 300 146 249 196" strokeWidth="24" />
      </g>
      <circle cx="104" cy="18" r="13" fill="currentColor" />
      <circle cx="216" cy="18" r="13" fill="currentColor" />
      <g fill="#f59e0b" stroke="#f59e0b" strokeLinejoin="round">
        <path d="M87 141 123.5 77.8H196.5L233 141 196.5 204.2H123.5Z" strokeWidth="14" />
        <path d="M106 226H214L204 246H116Z" strokeWidth="8" />
        <path d="M131 267H189L160 299Z" strokeWidth="8" />
      </g>
      <path
        d="M127 141 148 162 194 117"
        fill="none"
        stroke="#292524"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Mark plus the "testingapis.com" wordmark, set in Poppins Bold with "apis" in amber.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-7 w-auto shrink-0" />
      <span className="font-brand text-[19px] font-bold leading-none tracking-[-0.02em]">
        testing<span className="text-[#f59e0b]">apis</span>.com
      </span>
    </span>
  );
}
