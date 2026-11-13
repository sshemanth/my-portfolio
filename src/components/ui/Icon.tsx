import { logos } from "@/content/logos";

const strokes: Record<string, React.ReactNode> = {
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
  "arrow-down": <path d="M12 5v14M6 13l6 6 6-6" />,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>),
  linkedin: (<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V17M8 7.5v.01M12 17v-3.5a2 2 0 0 1 4 0V17M12 10.5V17" /></>),
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

/** Decorative icon. Pair it with visible text or an aria-label on the parent control. */
export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  if (name === "github") return <Logo name="_github" size={size} />;
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {strokes[name]}
    </svg>
  );
}

export function Logo({ name, size = 18 }: { name: string; size?: number }) {
  const logo = logos[name];
  if (!logo) return <span className="logo-dot" aria-hidden="true" />;
  return (
    <svg className="icon" width={size} height={size} viewBox={logo.viewBox} fill="currentColor" aria-hidden="true" focusable="false">
      {logo.d.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
