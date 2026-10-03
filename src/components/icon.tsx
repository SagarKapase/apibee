// Line icons, 24px grid, drawn to match Lucide's stroke style.
const paths = {
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />,
  externalLink: <path d="M15 3h6v6m0-6-9 9m6 1v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />,
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
