import { queryOptions } from '@tanstack/react-query'
import { getMedia } from '../api/media.api'
import type { MediaListParams } from '../api/media.api'

export const mediaQueryKeys = {
  all: ['media'] as const,
  lists: () => [...mediaQueryKeys.all, 'list'] as const,
  list: (params: MediaListParams) =>
    [...mediaQueryKeys.lists(), params] as const,
}

export function mediaQueryOptions(params: MediaListParams) {
  return queryOptions({
    queryKey: mediaQueryKeys.list(params),
    queryFn: () => getMedia(params),
    staleTime: 30_000,
  })
}
