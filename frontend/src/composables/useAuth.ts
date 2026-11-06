import type { User, AuthResponse } from '~/types/user'

/**
 * Authentication composable to manage user session with NestJS backend
 */
export function useAuth() {
  const user = useState<User | null>('auth_user', () => null)
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
  const client = useApiClient()

  const isAuthenticated = computed(() => !!token.value)

  /**
   * Fetch current authenticated user from NestJS (/auth/profile or /auth/me)
   */
  async function fetchUser() {
    if (!token.value) {
      user.value = null
      return null
    }

    try {
      const data = await client<User>('/auth/profile')
      user.value = data
      return data
    } catch {
      token.value = null
      user.value = null
      return null
    }
  }

  /**
   * Log in user with NestJS
   */
  async function login(credentials: { email: string; password: string }) {
    const data = await client<AuthResponse & { access_token?: string }>('/auth/login', {
      method: 'POST',
      body: credentials
    })

    const authToken = data.token || data.access_token
    if (authToken) {
      token.value = authToken
    }
    if (data.user) {
      user.value = data.user
    } else {
      await fetchUser()
    }
    return data
  }

  /**
   * Register new user with NestJS
   */
  async function register(credentials: { name?: string; email: string; password: string }) {
    const data = await client<AuthResponse & { access_token?: string }>('/auth/register', {
      method: 'POST',
      body: credentials
    })

    const authToken = data.token || data.access_token
    if (authToken) {
      token.value = authToken
    }
    if (data.user) {
      user.value = data.user
    } else if (authToken) {
      await fetchUser()
    }
    return data
  }

  /**
   * Log out user
   */
  async function logout() {
    try {
      if (token.value) {
        await client('/auth/logout', { method: 'POST' }).catch(() => {})
      }
    } finally {
      token.value = null
      user.value = null
      navigateTo('/login')
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout
  }
}
