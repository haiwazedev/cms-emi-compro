import { queryOptions } from '@tanstack/react-query'
import { getFaqs } from '../api/faq.api'

export const faqQueryKeys = {
  all: ['faqs'] as const,
  list: () => [...faqQueryKeys.all, 'list'] as const,
}

export function faqsQueryOptions() {
  return queryOptions({
    queryKey: faqQueryKeys.list(),
    queryFn: getFaqs,
    staleTime: 30_000,
  })
}
