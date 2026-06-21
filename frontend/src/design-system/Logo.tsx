import logoMarkup from '@/design-system/assets/logo.svg?raw'

type LogoProps = {
  size?: number | string
  className?: string
}

/**
 * Brand logo. The underlying SVG uses `fill="currentColor"`, so its color
 * follows the CSS `color` of the surrounding element — recolor it with any
 * design token (e.g. place it on a primary bar and set `color` to on-primary).
 */
export function Logo({ size = 40, className }: LogoProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: dimension, height: dimension, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: logoMarkup }}
    />
  )
}
