import type { LaravelValidationError } from '~/types/api'

/**
 * Extracts and formats errors returned by Laravel validation (HTTP 422)
 */
export function extractLaravelErrors(error: unknown): Record<string, string> {
  const err = error as { data?: LaravelValidationError }
  const fieldErrors: Record<string, string> = {}

  if (err?.data?.errors) {
    for (const [field, messages] of Object.entries(err.data.errors)) {
      if (messages.length > 0) {
        fieldErrors[field] = messages[0]
      }
    }
  }

  return fieldErrors
}
