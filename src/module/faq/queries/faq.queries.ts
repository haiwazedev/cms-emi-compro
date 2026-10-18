import { queryOptions } from '@tanstack/react-query'
import { getFaq, getFaqs } from '../api/faq.api'

export const faqQueryKeys = {
  all: ['faqs'] as const,
  list: () => [...faqQueryKeys.all, 'list'] as const,
  detail: (faqId: number) => [...faqQueryKeys.all, 'detail', faqId] as const,
}

export function faqsQueryOptions() {
  return queryOptions({
    queryKey: faqQueryKeys.list(),
    queryFn: getFaqs,
    staleTime: 30_000,
  })
}

export function faqQueryOptions(faqId: number) {
  return queryOptions({
    queryKey: faqQueryKeys.detail(faqId),
    queryFn: () => getFaq(faqId),
  })
}
