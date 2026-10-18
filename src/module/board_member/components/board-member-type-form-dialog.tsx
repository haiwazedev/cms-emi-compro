import type { BoardMemberType } from '@/module/board_member/api/board-member.api'
import { BOARD_MEMBER_LABELS } from '@/module/board_member/constants/board-member.constants'
import type { Language } from '@/module/language/api/language.api'
import type { BoardMemberTypeFormValues } from '@/module/board_member/schemas/board-member-type-form.schema'
import { boardMemberTypeFormSchema } from '@/module/board_member/schemas/board-member-type-form.schema'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface BoardMemberTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberType?: BoardMemberType
  language: Language
  pending: boolean
  onSubmit: (type: string) => void
}

function BoardMemberTypeFormDialog({
  open,
  onOpenChange,
  memberType,
  language,
  pending,
  onSubmit,
}: BoardMemberTypeFormDialogProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<BoardMemberTypeFormValues>({
    resolver: zodResolver(boardMemberTypeFormSchema),
    defaultValues: { type: memberType?.type ?? '' },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>
            {memberType
              ? BOARD_MEMBER_LABELS.editType
              : BOARD_MEMBER_LABELS.createType}
          </DialogTitle>
          <DialogDescription>
            {BOARD_MEMBER_LABELS.typesDescription} — {language.flag}{' '}
            {language.language}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => onSubmit(values.type))}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="board-member-type-name">
              {BOARD_MEMBER_LABELS.typeName}
            </Label>
            <Input
              id="board-member-type-name"
              autoFocus
              required
              maxLength={100}
              disabled={pending}
              aria-invalid={Boolean(errors.type)}
              {...register('type')}
            />
            {errors.type?.message && (
              <p role="alert" className="text-danger text-sm">
                {errors.type.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {BOARD_MEMBER_LABELS.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {BOARD_MEMBER_LABELS.saving}
                </>
              ) : (
                BOARD_MEMBER_LABELS.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { BoardMemberTypeFormDialog }
