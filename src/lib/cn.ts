/**
 * @file cn() — tiny class-name joiner
 * @summary Concatenates class strings and drops falsy values. Used
 *          everywhere components need conditional classes. No external
 *          dependency — keeps the bundle small.
 */
export function cn(...parts: Array<string | undefined | null | false>): string {
  return parts.filter(Boolean).join(' ')
}
