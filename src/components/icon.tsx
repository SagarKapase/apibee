// Line icons, 24px grid, drawn to match Lucide's stroke style.
const paths = {
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 16,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
