import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme()
  const cycle = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }
  const label = theme === 'system' ? `System (${resolved})` : theme
  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent-soft)] transition-colors"
      title={`Theme: ${label}`}
      aria-label={`Theme: ${label}`}
    >
      <span className="text-lg">{resolved === 'dark' ? '🌙' : '☀️'}</span>
    </button>
  )
}
