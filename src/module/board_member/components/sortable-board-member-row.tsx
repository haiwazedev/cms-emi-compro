import type { BoardMember } from '@/module/board_member/api/board-member.api'
import { getBoardMemberAssetUrl } from '@/module/board_member/api/board-member.api'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import { useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'

interface SortableBoardMemberRowProps {
  member: BoardMember
  index: number
  group: string
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

function SortableBoardMemberRow({
  member,
  index,
  group,
  disabled,
  onEdit,
  onDelete,
}: SortableBoardMemberRowProps) {
  const { ref: sortableRef, handleRef: dragHandleRef } = useSortable({
    id: `board-member:${member.id}`,
    index,
    group,
  })
  const initials = member.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <TableRow ref={sortableRef} onClick={onEdit} className="cursor-pointer">
      <TableCell className="w-12 px-2">
        <button
          ref={dragHandleRef}
          type="button"
          aria-label={BOARD_MEMBER_LABELS.dragMember(index + 1)}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          className="text-secondary cursor-grab touch-none rounded p-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      </TableCell>
      <TableCell className="w-20">
        <span className="bg-secondary/10 text-accent flex size-10 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
          {member.photo ? (
            <img
              src={getBoardMemberAssetUrl(member.photo)}
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
          <span className="text-foreground/55 text-sm">{member.role}</span>
        </div>
      </TableCell>
      <TableCell className="min-w-32">
        <span className="bg-secondary/10 text-accent inline-flex max-w-32 rounded-full px-3 py-1 text-xs font-medium whitespace-normal">
          {member.board_member_type?.type ?? '—'}
        </span>
      </TableCell>
      <TableCell>{member.sort_order}</TableCell>
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
          {member.photo
            ? BOARD_MEMBER_LABELS.hasPhoto
            : BOARD_MEMBER_LABELS.noPhoto}
        </span>
      </TableCell>
      <TableCell className="min-w-24 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={BOARD_MEMBER_LABELS.editMemberAction(member.name)}
            onClick={(event) => {
              event.stopPropagation()
              onEdit()
            }}
          >
            <PencilIcon aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={BOARD_MEMBER_LABELS.deleteMemberAction(member.name)}
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
          >
            <Trash2Icon aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export { SortableBoardMemberRow }
