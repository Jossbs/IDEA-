/**
 * Joins class names, ignoring falsy values — a dependency-free stand-in for
 * `clsx`. For production, consider `clsx` + `tailwind-merge` to also resolve
 * conflicting Tailwind utilities when callers override via `className`.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
