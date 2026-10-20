import { apiClient } from '@/shared/lib/api-client'

export type FaqStatus = 'DRAFT' | 'PUBLISHED'

interface FaqHeader {
  id: number
  sort_order: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface FaqContent {
  id: number
  language_id: string
  question: string
  answer: string
  status: FaqStatus
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface Faq extends FaqHeader {
  contents: FaqContent[]
}

// List row: content fields come from the first language with content.
export interface FaqListItem extends FaqHeader {
  language_id: string | null
  question: string | null
  answer: string | null
  status: FaqStatus | null
  languages: { language_id: string; status: FaqStatus | null }[]
}

export interface FaqWriteFields {
  language_id: string
  question: string
  answer: string
  status: FaqStatus
}

interface FaqsResponse {
  faqs: FaqListItem[]
}

interface FaqResponse {
  faq: Faq
}

export async function getFaqs(params: { language_id?: string } = {}) {
  const { data } = await apiClient.get<FaqsResponse>('/faqs', { params })
  return data.faqs
}

export async function getFaq(faqId: number) {
  const { data } = await apiClient.get<FaqResponse>('/faqs/' + faqId)
  return data.faq
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
