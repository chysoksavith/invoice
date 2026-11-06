import type { UseFetchOptions } from 'nuxt/app'

/**
 * Composable for communicating with the Laravel API.
 * Uses Nuxt runtimeConfig for apiBase and attaches auth tokens/cookies automatically.
 */
export function useApi<T>(endpoint: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  return useFetch<T>(endpoint, {
    baseURL: config.public.apiBase,
    headers: {
      Accept: 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      ...options.headers
    },
    ...options
  })
}

/**
 * Imperative fetch client for actions (POST/PUT/DELETE forms, triggers)
 */
export function useApiClient() {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  return $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
      Accept: 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    }
  })
}
