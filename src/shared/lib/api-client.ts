import axios from 'axios'
import { DICTIONARIES, type Locale } from './i18n/i18n-context'
import { SERVER_ERROR_KEYS } from './server-error-keys'

interface ApiErrorResponse {
  message?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiClient = axios.create({
  baseURL: (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  ).replace(/\/+$/, ''),
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      return Promise.reject(error)
    }

    // shortcut: reads the locale from <html lang> (kept in sync by I18nProvider) since this runs outside React.
    const { common, serverError } =
      DICTIONARIES[document.documentElement.lang as Locale] ?? DICTIONARIES.id
    const status = error.response?.status
    const serverMessage = error.response?.data?.message
    const key =
      typeof serverMessage === 'string'
        ? SERVER_ERROR_KEYS[serverMessage]
        : undefined
    const message = !error.response
      ? common.connectionFailed
      : key
        ? serverError[key]
        : serverError.byStatus(status)

    return Promise.reject(new ApiError(message, status))
  },
)
