import { apiClient } from '@/shared/lib/api-client'

export type FaqStatus = 'DRAFT' | 'PUBLISHED'

export interface Faq {
  id: number
  question: string
  answer: string
  status: FaqStatus
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface FaqWriteFields {
  question: string
  answer: string
  status: FaqStatus
}

interface FaqsResponse {
  faqs: Faq[]
}

interface FaqResponse {
  faq: Faq
}

export async function getFaqs() {
  const { data } = await apiClient.get<FaqsResponse>('/faqs')
  return data.faqs
}

export async function createFaq(fields: FaqWriteFields) {
  const { data } = await apiClient.post<FaqResponse>('/faqs', fields)
  return data.faq
}

export async function updateFaq(faqId: number, fields: FaqWriteFields) {
  const { data } = await apiClient.put<FaqResponse>('/faqs/' + faqId, fields)
  return data.faq
}

export async function deleteFaq(faqId: number) {
  await apiClient.delete<void>('/faqs/' + faqId)
}

export async function reorderFaqs(faqIds: number[]) {
  const { data } = await apiClient.post<FaqsResponse>('/faqs/reorder', {
    faq_ids: faqIds,
  })
  return data.faqs
}
