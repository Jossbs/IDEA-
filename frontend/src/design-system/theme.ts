/**
 * Typed accessors for the CSS design tokens (see `tokens.css`).
 * Use these in inline styles / JS so the palette stays consistent and the
 * 60-30-10 rule is enforced from a single source.
 */
export const theme = {
  color: {
    surface: 'var(--color-surface)',
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
    success: 'var(--color-success)',
    danger: 'var(--color-danger)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    onPrimary: 'var(--color-on-primary)',
    onAccent: 'var(--color-on-accent)',
    border: 'var(--color-border)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
  },
  space: {
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
  },
  shadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
  },
} as const
