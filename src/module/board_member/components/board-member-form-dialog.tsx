import type {
  BoardMember,
  BoardMemberFields,
  BoardMemberType,
} from '@/module/board_member/api/board-member.api'
import { getBoardMemberAssetUrl } from '@/module/board_member/api/board-member.api'
import {
  BOARD_MEMBER_LABELS,
  BOARD_MEMBER_MAX_PHOTO_SIZE,
} from '@/module/board_member/constants/board-member.constants'
import type { BoardMemberFormValues } from '@/module/board_member/schemas/board-member-form.schema'
import { boardMemberFormSchema } from '@/module/board_member/schemas/board-member-form.schema'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon, UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

interface BoardMemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: BoardMember
  types: BoardMemberType[]
  pending: boolean
  onSubmit: (fields: BoardMemberFields, photo?: File) => void
}

function BoardMemberFormDialog({
  open,
  onOpenChange,
  member,
  types,
  pending,
  onSubmit,
}: BoardMemberFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File>()
  const [photoError, setPhotoError] = useState<string>()
  const isEditing = member !== undefined
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<BoardMemberFormValues>({
    resolver: zodResolver(boardMemberFormSchema),
    defaultValues: {
      name: member?.name ?? '',
      role: member?.role ?? '',
      board_member_type_id: member?.board_member_type_id ?? types[0]?.id ?? 0,
    },
  })

  function handlePhotoChange(file: File | undefined) {
    setSelectedPhoto(undefined)
    setPhotoError(undefined)
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    const validExtension = ['png', 'jpg', 'jpeg'].includes(extension ?? '')
    const validMimeType =
      !file.type || ['image/png', 'image/jpeg'].includes(file.type)

    if (!validExtension || !validMimeType) {
      setPhotoError(BOARD_MEMBER_LABELS.photoInvalid)
      return
    }

    if (file.size > BOARD_MEMBER_MAX_PHOTO_SIZE) {
      setPhotoError(BOARD_MEMBER_LABELS.photoTooLarge)
      return
    }

    setSelectedPhoto(file)
  }

  function submitForm(values: BoardMemberFormValues) {
    if (photoError) return
    onSubmit(values, selectedPhoto)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-border/15 border-b">
          <DialogTitle>
            {isEditing
              ? BOARD_MEMBER_LABELS.editMember
              : BOARD_MEMBER_LABELS.createMember}
          </DialogTitle>
          <DialogDescription>
            {BOARD_MEMBER_LABELS.description}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex min-h-0 flex-col"
        >
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-name">
                {BOARD_MEMBER_LABELS.nameField}
              </Label>
              <Input
                id="board-member-name"
                autoFocus
                required
                maxLength={200}
                disabled={pending}
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-role">
                {BOARD_MEMBER_LABELS.roleField}
              </Label>
              <Input
                id="board-member-role"
                required
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(errors.role)}
                {...register('role')}
              />
              {errors.role?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-type">
                {BOARD_MEMBER_LABELS.typeField}
              </Label>
              <Controller
                control={control}
                name="board_member_type_id"
                render={({ field }) => (
                  <Select
                    value={field.value > 0 ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={pending || types.length === 0}
                  >
                    <SelectTrigger
                      id="board-member-type"
                      aria-invalid={Boolean(errors.board_member_type_id)}
                    >
                      <SelectValue
                        placeholder={BOARD_MEMBER_LABELS.chooseType}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.board_member_type_id?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.board_member_type_id.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-photo">
                {BOARD_MEMBER_LABELS.photoField}
              </Label>
              {member?.photo && (
                <div className="flex items-center gap-3">
                  <img
                    src={getBoardMemberAssetUrl(member.photo)}
                    alt=""
                    className="size-12 rounded-full object-cover"
                  />
                  <span className="text-foreground/60 text-sm">
                    {BOARD_MEMBER_LABELS.currentPhoto}
                  </span>
                </div>
              )}
              <Input
                ref={fileInputRef}
                id="board-member-photo"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                disabled={pending}
                onChange={(event) => {
                  handlePhotoChange(event.currentTarget.files?.[0])
                  event.currentTarget.value = ''
                }}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon aria-hidden="true" className="size-4" />
                  {member?.photo || selectedPhoto
                    ? BOARD_MEMBER_LABELS.replacePhoto
                    : BOARD_MEMBER_LABELS.photoField}
                </Button>
                {selectedPhoto && (
                  <span className="text-foreground/60 text-sm">
                    {selectedPhoto.name}
                  </span>
                )}
              </div>
              <p className="text-foreground/55 text-xs">
                {BOARD_MEMBER_LABELS.photoHelp}
              </p>
              {photoError && (
                <p role="alert" className="text-danger text-sm">
                  {photoError}
                </p>
              )}
            </div>
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
            <Button type="submit" disabled={pending || types.length === 0}>
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

export { BoardMemberFormDialog }
