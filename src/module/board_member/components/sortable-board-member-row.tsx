import { usePermissions } from '@/module/auth/hooks/use-permissions'
import type {
  BoardMember,
  BoardMemberContent,
} from '@/module/board_member/api/board-member.api'
import { getBoardMemberAssetUrl } from '@/module/board_member/api/board-member.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

interface SortableBoardMemberRowProps {
  member: BoardMember
  content?: BoardMemberContent
  index: number
  group: string
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

function SortableBoardMemberRow({
  member,
  content,
  index,
  group,
  disabled,
  onEdit,
  onDelete,
}: SortableBoardMemberRowProps) {
  const { t } = useI18n()
  const { canWrite, canDelete } = usePermissions()
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `board-member:${member.id}`,
    index,
    group,
    disabled: !canWrite,
  })
  const initials = member.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <TableRow
      ref={sortableRef}
      onClick={canWrite ? onEdit : undefined}
      className={canWrite ? 'cursor-pointer' : undefined}
    >
      <TableCell className="w-12 px-2">
        {canWrite && (
          <button
            ref={dragHandleRef}
            type="button"
            aria-label={t.boardMember.dragMember(index + 1)}
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
            className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GripVerticalIcon aria-hidden="true" className="size-4" />
          </button>
        )}
      </TableCell>
      <TableCell className="w-20">
        <span className="bg-secondary/10 text-accent flex size-10 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
          {member.photo ? (
            <img
              src={getBoardMemberAssetUrl(
                member.photo,
                member.updated_at ?? member.created_at,
              )}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
      </TableCell>
      <TableCell className="min-w-64">
        <div className="flex flex-col items-start gap-1 text-left">
          <span className="text-accent font-semibold">{member.name}</span>
          <span className="text-muted text-sm">
            {content?.role ?? t.boardMember.missingTranslation}
          </span>
        </div>
      </TableCell>
      <TableCell className="min-w-32">
        <span className="bg-secondary/10 text-accent inline-flex max-w-32 rounded-full px-3 py-1 text-xs font-semibold whitespace-normal">
          {content?.board_member_type.type ?? t.boardMember.missingTranslation}
        </span>
      </TableCell>
      <TableCell className="text-foreground/70">{member.sort_order}</TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
            member.photo
              ? 'bg-success/10 text-success'
              : 'bg-warning/15 text-warning',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'size-1.5 rounded-full',
              member.photo ? 'bg-success' : 'bg-warning',
            )}
          />
          {member.photo ? t.boardMember.hasPhoto : t.boardMember.noPhoto}
        </span>
      </TableCell>
      <TableCell className="min-w-24 text-right">
        <div className="flex items-center justify-end gap-1">
          {canWrite && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={t.boardMember.editMemberAction(member.name)}
              onClick={(event) => {
                event.stopPropagation()
                onEdit()
              }}
            >
              <PencilIcon aria-hidden="true" className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              aria-label={t.boardMember.deleteMemberAction(member.name)}
              onClick={(event) => {
                event.stopPropagation()
                onDelete()
              }}
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableBoardMemberRow }
