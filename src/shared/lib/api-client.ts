import axios from 'axios'

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

    const message =
      typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : error.response
          ? 'The request could not be completed.'
          : 'Unable to connect to the server. Please try again.'

    return Promise.reject(new ApiError(message, error.response?.status))
  },
)
