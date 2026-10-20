import type { BoardMemberType } from '@/module/board_member/api/board-member.api'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { Language } from '@/module/language/api/language.api'
import type { BoardMemberTypeFormValues } from '@/module/board_member/schemas/board-member-type-form.schema'
import { createBoardMemberTypeFormSchema } from '@/module/board_member/schemas/board-member-type-form.schema'
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
  const { t } = useI18n()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<BoardMemberTypeFormValues>({
    resolver: zodResolver(createBoardMemberTypeFormSchema(t)),
    defaultValues: { type: memberType?.type ?? '' },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {memberType ? t.boardMember.editType : t.boardMember.createType}
          </DialogTitle>
          <DialogDescription>
            {t.boardMember.typesDescription} — {language.flag}{' '}
            {language.language}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => onSubmit(values.type))}
          className="flex flex-col"
        >
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="board-member-type-name">
              {t.boardMember.typeName}
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
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircleIcon
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  {t.boardMember.saving}
                </>
              ) : (
                t.common.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { BoardMemberTypeFormDialog }
