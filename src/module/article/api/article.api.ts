import { apiClient } from '@/shared/lib/api-client'

export type ArticleStatus = 'DRAFT' | 'PUBLISHED'

// Shared across languages.
interface ArticleHeader {
  id: number
  article_category_id: number
  issue_date: string | null
  press_release_number: string | null
  primary_photo: number | null
  primary_photo_url: string | null
  cp_name: string | null
  cp_role: string | null
  cp_phone_number: string | null
  cp_email: string | null
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
  article_category: ArticleCategory
}

export interface ArticleContent {
  id: number
  language_id: string
  title: string
  slug: string
  summary: string
  content: string
  status: ArticleStatus
  read_time: number
  created_at: string
  created_by: string
  updated_at: string | null
  updated_by: string | null
}

export interface Article extends ArticleHeader {
  contents: ArticleContent[]
}

export interface ArticleLanguageStatus {
  language_id: string
  status: ArticleStatus | null
}

// Content fields come from the first language with content.
export interface ArticleListItem extends ArticleHeader {
  language_id: string | null
  title: string | null
  slug: string | null
  summary: string | null
  status: ArticleStatus | null
  languages: ArticleLanguageStatus[]
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
  sort_by: 'created_at' | 'issue_date'
  sort_order: 'asc' | 'desc'
}

export interface ArticlePagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface ArticleListResponse {
  articles: ArticleListItem[]
  pagination: ArticlePagination
}

interface ArticleCategoriesResponse {
  articleCategories: ArticleCategory[]
}

interface ArticleCategoryResponse {
  articleCategory: ArticleCategory
}

export type ArticleCategoryWriteFields = Pick<ArticleCategory, 'name' | 'slug'>

interface ArticleResponse {
  article: Article
}

export interface ArticleWriteFields {
  article_category_id: number
  language_id: string
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
  const { data } = await apiClient.get<ArticleListResponse>('/admin/articles', {
    params,
  })

  return data
}

export interface ArticleCounts {
  total: number
  languages: {
    id: string
    flag: string
    count: Record<'draft' | 'published', number>
  }[]
}

export async function getArticleCounts() {
  const { data } = await apiClient.get<ArticleCounts>('/articles/count')

  return data
}

export async function getArticleCategories() {
  const { data } = await apiClient.get<ArticleCategoriesResponse>(
    '/article_categories',
  )

  return data.articleCategories
}

export async function createArticleCategory(
  fields: ArticleCategoryWriteFields,
) {
  const { data } = await apiClient.post<ArticleCategoryResponse>(
    '/article_categories',
    fields,
  )

  return data.articleCategory
}

export async function updateArticleCategory(
  articleCategoryId: number,
  fields: ArticleCategoryWriteFields,
) {
  const { data } = await apiClient.put<ArticleCategoryResponse>(
    '/article_categories/' + articleCategoryId,
    fields,
  )

  return data.articleCategory
}

export async function deleteArticleCategory(articleCategoryId: number) {
  await apiClient.delete<void>('/article_categories/' + articleCategoryId)
}

export async function getArticle(articleId: number) {
  const { data } = await apiClient.get<ArticleResponse>(
    '/admin/articles/' + articleId,
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
