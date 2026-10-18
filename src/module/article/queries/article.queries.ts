import { queryOptions } from '@tanstack/react-query'
import {
  getArticle,
  getArticleCounts,
  getArticleCategories,
  getArticles,
} from '../api/article.api'
import type { ArticleListParams } from '../api/article.api'

export const articleQueryKeys = {
  all: ['articles'] as const,
  lists: () => [...articleQueryKeys.all, 'list'] as const,
  detail: (articleId: number) =>
    [...articleQueryKeys.all, 'detail', articleId] as const,
  list: (params: ArticleListParams) =>
    [...articleQueryKeys.lists(), params] as const,
  categories: () => [...articleQueryKeys.all, 'categories'] as const,
  counts: () => [...articleQueryKeys.all, 'counts'] as const,
}

export function articleQueryOptions(articleId: number) {
  return queryOptions({
    queryKey: articleQueryKeys.detail(articleId),
    queryFn: () => getArticle(articleId),
  })
}

export function articlesQueryOptions(params: ArticleListParams) {
  return queryOptions({
    queryKey: articleQueryKeys.list(params),
    queryFn: () => getArticles(params),
    staleTime: 30_000,
  })
}

export function articleCategoriesQueryOptions() {
  return queryOptions({
    queryKey: articleQueryKeys.categories(),
    queryFn: getArticleCategories,
    staleTime: 5 * 60_000,
  })
}

// No staleTime: the dashboard refetches on every visit.
export function articleCountsQueryOptions() {
  return queryOptions({
    queryKey: articleQueryKeys.counts(),
    queryFn: getArticleCounts,
  })
}
