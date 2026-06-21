import { Logo } from '@/design-system/Logo'
import { theme } from '@/design-system/theme'

function App() {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Primary bar — the dominant 60% brand color */}
      <header
        style={{
          background: theme.color.primary,
          color: theme.color.onPrimary,
          padding: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          boxShadow: theme.shadow.md,
        }}
      >
        {/* Logo inherits `currentColor` → renders in on-primary over the bar */}
        <Logo size={44} />
        <div>
          <strong style={{ fontSize: 'var(--font-size-lg)' }}>IDEA</strong>
          <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.85 }}>
            Digital Interface for Academic Evaluation
          </div>
        </div>
      </header>

      {/* Surface body */}
      <main
        style={{
          flex: 1,
          padding: 'var(--space-6)',
          display: 'grid',
          gap: 'var(--space-4)',
          placeContent: 'start',
        }}
      >
        <h1 style={{ color: theme.color.secondary, fontSize: 'var(--font-size-xl)' }}>
          Design system ready
        </h1>
        <p style={{ color: theme.color.textMuted, maxWidth: '40ch' }}>
          Visual identity wired with the 60-30-10 rule. Every color comes from a
          single token source.
        </p>

        {/* Accent CTA — the 10% */}
        <button
          style={{
            background: theme.color.accent,
            color: theme.color.onAccent,
            border: 'none',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: theme.radius.md,
            cursor: 'pointer',
            width: 'fit-content',
            boxShadow: theme.shadow.sm,
          }}
        >
          Accent action
        </button>

        {/* Feedback chips */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <span
            style={{
              background: theme.color.success,
              color: '#fff',
              padding: '2px 10px',
              borderRadius: theme.radius.sm,
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Success
          </span>
          <span
            style={{
              background: theme.color.danger,
              color: '#fff',
              padding: '2px 10px',
              borderRadius: theme.radius.sm,
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Danger
          </span>
        </div>
      </main>
    </div>
  )
}

export default App
