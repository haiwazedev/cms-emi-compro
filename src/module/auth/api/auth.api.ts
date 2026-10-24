import { ApiError, apiClient } from '@/shared/lib/api-client'

export interface AuthUser {
  name: string
  email: string
  role: { id: number; name: string } | null
  // Allowed permission keys; viewing needs none.
  permissions: string[]
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

export type ActivationPurpose = 'INVITE' | 'RESET'

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function verifyActivationToken(token: string) {
  const { data } = await apiClient.post<{ purpose: ActivationPurpose }>(
    '/auth/activate/verify',
    { token },
  )

  return data.purpose
}

export async function activateAccount(
  token: string,
  password: string,
): Promise<void> {
  await apiClient.post('/auth/activate', { token, password })
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
