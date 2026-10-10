import { apiClient } from '@/shared/lib/api-client'

export type ArticleStatus = 'DRAFT' | 'PUBLISHED'

export interface Article {
  id: number
  article_category_id: number
  title: string
  slug: string
  summary: string
  content: string
  issue_date: string | null
  press_release_number: string | null
  primary_photo: number | null
  primary_photo_url: string | null
  cp_name: string | null
  cp_role: string | null
  cp_phone_number: string | null
  cp_email: string | null
  status: ArticleStatus
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  article_category: ArticleCategory
}

export interface ArticleCategory {
  id: number
  name: string
  slug: string
}

export interface ArticleListParams {
  page: number
  limit: number
  search?: string
  article_category_id?: number
  status?: ArticleStatus
  sort_by: 'created_at'
  sort_order: 'asc' | 'desc'
}

export interface ArticlePagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface ArticleListResponse {
  articles: Article[]
  pagination: ArticlePagination
}

interface ArticleCategoriesResponse {
  articleCategories: ArticleCategory[]
}

interface ArticleResponse {
  article: Article
}

export interface ArticleWriteFields {
  article_category_id: number
  title: string
  slug: string
  summary: string
  content: string
  issue_date: string | null
  press_release_number: string | null
  cp_name: string | null
  cp_role: string | null
  cp_phone_number: string | null
  cp_email: string | null
  primary_photo: number
  status: ArticleStatus
}

export async function getArticles(params: ArticleListParams) {
  const { data } = await apiClient.get<ArticleListResponse>('/articles', {
    params,
  })

  return data
}

export async function getArticleCategories() {
  const { data } = await apiClient.get<ArticleCategoriesResponse>(
    '/article_categories',
  )

  return data.articleCategories
}

export async function getArticle(articleId: number) {
  const { data } = await apiClient.get<ArticleResponse>(
    '/articles/' + articleId,
  )

  return data.article
}

export async function createArticle(fields: ArticleWriteFields) {
  const { data } = await apiClient.post<ArticleResponse>('/articles', fields)

  return data.article
}

export async function updateArticle(
  articleId: number,
  fields: ArticleWriteFields,
) {
  const { data } = await apiClient.put<ArticleResponse>(
    '/articles/' + articleId,
    fields,
  )

  return data.article
}

export async function deleteArticle(articleId: number) {
  await apiClient.delete<void>('/articles/' + articleId)
}
