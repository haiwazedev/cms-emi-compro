import { ApiError, apiClient } from '@/shared/lib/api-client'

export interface AuthUser {
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

interface AuthResponse {
  user: AuthUser
}

export async function login(credentials: LoginCredentials) {
  const { data } = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials,
  )

  return data.user
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await apiClient.get<AuthResponse>('/auth/me')
    return data.user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }

    throw error
  }
}
