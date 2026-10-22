import { DOCUMENT_COMMITMENT_DEFAULT_PAGE_SIZE } from '@/module/document_commitment/constants/document-commitment.constants'
import { ARTICLE_DEFAULT_PAGE_SIZE } from '@/module/article/constants/article.constants'
import { USER_DEFAULT_PAGE_SIZE } from '@/module/user/constants/user.constants'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { SearchItem } from '../api/search.api'
import {
  SEARCH_MIN_LENGTH,
  searchQueryOptions,
} from '../queries/search.queries'

type ContentSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ContentSearchDialog({ open, onOpenChange }: ContentSearchDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-2xl">
        <DialogTitle className="sr-only">{t.nav.searchLabel}</DialogTitle>
        <ContentSearch onSelect={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

// Mounted only while the dialog is open, so the typed query resets on close.
function ContentSearch({ onSelect }: { onSelect: () => void }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')
  const { data, isError, isFetching } = useQuery(searchQueryOptions(query))

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setQuery(value.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [value])

  const hasQuery = query.length >= SEARCH_MIN_LENGTH
  const groups = [
    {
      key: 'articles',
      heading: t.nav.articles,
      items: data?.articles ?? [],
      open: (item: SearchItem) =>
        navigate({
          to: '/articles',
          search: {
            page: 1,
            limit: ARTICLE_DEFAULT_PAGE_SIZE,
            sort_order: 'desc',
            search: item.title,
          },
        }),
    },
    {
      key: 'document_commitments',
      heading: t.nav.commitmentDocuments,
      items: data?.document_commitments ?? [],
      open: (item: SearchItem) =>
        navigate({
          to: '/document_commitments',
          search: {
            page: 1,
            limit: DOCUMENT_COMMITMENT_DEFAULT_PAGE_SIZE,
            search: item.title,
          },
        }),
    },
    {
      key: 'divisions',
      heading: t.nav.divisionsAndServices,
      items: [...(data?.divisions ?? []), ...(data?.services ?? [])],
      open: (item: SearchItem) =>
        navigate({ to: '/divisions', search: { lang: item.language_id } }),
    },
    {
      key: 'board_members',
      heading: t.nav.management,
      items: data?.board_members ?? [],
      open: (item: SearchItem) =>
        navigate({ to: '/board_members', search: { search: item.title } }),
    },
    {
      key: 'faqs',
      heading: t.nav.faq,
      items: data?.faqs ?? [],
      open: (item: SearchItem) =>
        navigate({ to: '/faqs', search: { lang: item.language_id } }),
    },
    {
      key: 'users',
      heading: t.nav.usersAndAccess,
      items: data?.users ?? [],
      open: (item: SearchItem) =>
        navigate({
          to: '/users',
          search: {
            page: 1,
            limit: USER_DEFAULT_PAGE_SIZE,
            search: item.title,
          },
        }),
    },
    {
      key: 'inboxes',
      heading: t.nav.inbox,
      items: data?.inboxes ?? [],
      open: (item: SearchItem) =>
        navigate({ to: '/inbox', search: { search: item.title } }),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={value}
        onValueChange={setValue}
        placeholder={t.nav.searchPlaceholder}
      />
      <CommandList>
        {!hasQuery && <CommandEmpty>{t.nav.searchHint}</CommandEmpty>}
        {hasQuery && isError && (
          <CommandEmpty>{t.nav.searchFailed}</CommandEmpty>
        )}
        {hasQuery && !isError && !isFetching && (
          <CommandEmpty>{t.nav.searchEmpty}</CommandEmpty>
        )}
        {hasQuery &&
          groups.map((group) => (
            <CommandGroup key={group.key} heading={group.heading}>
              {group.items.map((item, index) => (
                <CommandItem
                  // Divisions and services share a group, so ids can repeat.
                  key={`${group.key}-${index}`}
                  value={`${group.key}-${index}`}
                  onSelect={() => {
                    void group.open(item)
                    onSelect()
                  }}
                >
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.language_id && (
                    <span className="text-foreground/50 text-xs uppercase">
                      {item.language_id}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
      </CommandList>
    </Command>
  )
}

export { ContentSearchDialog }
