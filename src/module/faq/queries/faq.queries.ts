import { queryOptions } from '@tanstack/react-query'
import { getFaq, getFaqs } from '../api/faq.api'

export const faqQueryKeys = {
  all: ['faqs'] as const,
  list: () => [...faqQueryKeys.all, 'list'] as const,
  languageList: (languageId: string) =>
    [...faqQueryKeys.list(), languageId] as const,
  detail: (faqId: number) => [...faqQueryKeys.all, 'detail', faqId] as const,
}

export function faqsQueryOptions() {
  return queryOptions({
    queryKey: faqQueryKeys.list(),
    queryFn: () => getFaqs(),
    staleTime: 30_000,
  })
}

// Only FAQs with content in `languageId`; used to show localized questions.
export function faqsByLanguageQueryOptions(languageId: string) {
  return queryOptions({
    queryKey: faqQueryKeys.languageList(languageId),
    queryFn: () => getFaqs({ language_id: languageId }),
    staleTime: 30_000,
  })
}

export function faqQueryOptions(faqId: number) {
  return queryOptions({
    queryKey: faqQueryKeys.detail(faqId),
    queryFn: () => getFaq(faqId),
  })
}
