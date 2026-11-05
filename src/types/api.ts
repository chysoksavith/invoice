/**
 * Standard Laravel API response types
 */

// Laravel 422 Validation Error Response
export interface LaravelValidationError {
  message: string
  errors: Record<string, string[]>
}

// Laravel Paginated Response (LengthAwarePaginator)
export interface LaravelPagination<T> {
  data: T[]
  current_page: number
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  status?: string
}
