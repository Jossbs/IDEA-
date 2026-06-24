type BrandLockupProps = {
  /** Forwarded to the <svg> (sizing is driven by the parent's height + aspect ratio). */
  className?: string
  /** Accessible label; the wordmark + tagline are decorative text inside the art. */
  title?: string
}

/**
 * Full IDEA brand lockup — bookmark icon + "IDEA" wordmark + tagline.
 * Uses the brand palette directly (navy #1A365D + cyan #00B4D8 + muted #64748B),
 * so it is meant for LIGHT surfaces. The SVG fills its parent at 100% × 100%;
 * size it by giving the parent a height and the `aspect-[350/100]` ratio.
 */
export function BrandLockup({
  className,
  title = 'IDEA — Interfaz Digital para Evaluaciones Académicas',
}: BrandLockupProps) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 350 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <g transform="translate(10, 20)">
        <rect x="0" y="0" width="45" height="55" rx="6" fill="none" stroke="#1A365D" strokeWidth="4" />
        <line x1="10" y1="12" x2="35" y2="12" stroke="#1A365D" strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="24" x2="25" y2="24" stroke="#1A365D" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M 18 35 L 32 48 L 60 12"
          fill="none"
          stroke="#00B4D8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="85"
        y="58"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="42"
        fontWeight="800"
        fill="#1A365D"
        letterSpacing="1.5"
      >
        IDEA
      </text>
      <text
        x="88"
        y="78"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="#64748B"
        letterSpacing="0.5"
      >
        INTERFAZ DIGITAL PARA EVALUACIONES ACADÉMICAS
      </text>
    </svg>
  )
}
