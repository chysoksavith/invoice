/**
 * Converts a string into a URL-friendly, lowercase slug containing only
 * alphanumeric characters and dashes.
 *
 * @param input Raw string to be slugified.
 * @returns Clean slug string.
 *
 * @example
 * ```ts
 * slugify('Angkor Coffee & Bakery'); // 'angkor-coffee-bakery'
 * slugify('  My Business  #123! '); // 'my-business-123'
 * ```
 */
export function slugify(input: string): string {
  if (!input) return '';

  return input
    .normalize('NFKD') // Normalize unicode
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces & dashes)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single dash
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing dashes
}
