import type {
  BoardMember,
  BoardMemberFields,
  BoardMemberType,
} from '@/module/board_member/api/board-member.api'
import { getBoardMemberAssetUrl } from '@/module/board_member/api/board-member.api'
import type { Language } from '@/module/language/api/language.api'
import { BOARD_MEMBER_MAX_PHOTO_SIZE } from '@/module/board_member/constants/board-member.constants'
import { useI18n } from '@/shared/lib/i18n/i18n-context'
import type { BoardMemberFormValues } from '@/module/board_member/schemas/board-member-form.schema'
import { createBoardMemberFormSchema } from '@/module/board_member/schemas/board-member-form.schema'
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
import { Textarea } from '@/shared/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircleIcon, UploadIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

interface BoardMemberFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: BoardMember
  language: Language
  types: BoardMemberType[]
  pending: boolean
  onSubmit: (fields: BoardMemberFields, photo?: File) => void
}

function BoardMemberFormDialog({
  open,
  onOpenChange,
  member,
  language,
  types,
  pending,
  onSubmit,
}: BoardMemberFormDialogProps) {
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File>()
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string>()
  const [photoError, setPhotoError] = useState<string>()
  const isEditing = member !== undefined
  const content = member?.contents.find(
    (item) => item.language_id === language.id,
  )
  const photoPreviewUrl =
    selectedPhotoPreview ??
    (member?.photo
      ? getBoardMemberAssetUrl(
          member.photo,
          member.updated_at ?? member.created_at,
        )
      : undefined)

  useEffect(() => {
    return () => {
      if (selectedPhotoPreview) URL.revokeObjectURL(selectedPhotoPreview)
    }
  }, [selectedPhotoPreview])

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<BoardMemberFormValues>({
    resolver: zodResolver(createBoardMemberFormSchema(t)),
    defaultValues: {
      name: member?.name ?? '',
      company_name: member?.company_name ?? '',
      role: content?.role ?? '',
      description: content?.description ?? '',
      board_member_type_id: content?.board_member_type_id ?? types[0]?.id ?? 0,
    },
  })
  const nameValue = useWatch({ control, name: 'name' })
  const companyNameValue = useWatch({ control, name: 'company_name' })
  const roleValue = useWatch({ control, name: 'role' })

  function handlePhotoChange(file: File | undefined) {
    setSelectedPhoto(undefined)
    setSelectedPhotoPreview(undefined)
    setPhotoError(undefined)
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    const validExtension = ['png', 'jpg', 'jpeg'].includes(extension ?? '')
    const validMimeType =
      !file.type || ['image/png', 'image/jpeg'].includes(file.type)

    if (!validExtension || !validMimeType) {
      setPhotoError(t.boardMember.photoInvalid)
      return
    }

    if (file.size > BOARD_MEMBER_MAX_PHOTO_SIZE) {
      setPhotoError(t.boardMember.photoTooLarge)
      return
    }

    setSelectedPhoto(file)
    setSelectedPhotoPreview(URL.createObjectURL(file))
  }

  function submitForm(values: BoardMemberFormValues) {
    if (photoError) return
    onSubmit(
      {
        ...values,
        company_name: values.company_name.trim() || null,
        language_id: language.id,
        description: values.description || null,
      },
      selectedPhoto,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-border border-b">
          <DialogTitle>
            {isEditing ? t.boardMember.editMember : t.boardMember.createMember}
          </DialogTitle>
          <DialogDescription>
            {t.boardMember.description} — {language.flag} {language.language}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex min-h-0 flex-col"
        >
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-name">
                {t.boardMember.nameField}
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
              <p className="text-foreground/55 text-xs">
                {nameValue.length + ' / 200 karakter'}
              </p>
              {errors.name?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-company-name">
                {t.boardMember.companyNameField}
              </Label>
              <Input
                id="board-member-company-name"
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(errors.company_name)}
                {...register('company_name')}
              />
              <p className="text-foreground/55 text-xs">
                {companyNameValue.length + ' / 100 karakter'}
              </p>
              {errors.company_name?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-role">
                {t.boardMember.roleField}
              </Label>
              <Input
                id="board-member-role"
                required
                maxLength={100}
                disabled={pending}
                aria-invalid={Boolean(errors.role)}
                {...register('role')}
              />
              <p className="text-foreground/55 text-xs">
                {roleValue.length + ' / 100 karakter'}
              </p>
              {errors.role?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-description">
                {t.boardMember.descriptionField}
              </Label>
              <Textarea
                id="board-member-description"
                disabled={pending}
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
              {errors.description?.message && (
                <p role="alert" className="text-danger text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="board-member-type">
                {t.boardMember.typeField}
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
                      <SelectValue placeholder={t.boardMember.chooseType} />
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
                {t.boardMember.photoField}
              </Label>
              {photoPreviewUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={photoPreviewUrl}
                    alt=""
                    className="size-12 rounded-full object-cover"
                  />
                  <span className="text-foreground/60 text-sm">
                    {t.boardMember.currentPhoto}
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
                    ? t.boardMember.replacePhoto
                    : t.boardMember.photoField}
                </Button>
                {selectedPhoto && (
                  <span className="text-foreground/60 text-sm">
                    {selectedPhoto.name}
                  </span>
                )}
              </div>
              <p className="text-foreground/55 text-xs">
                {t.boardMember.photoHelp}
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
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending || types.length === 0}>
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

export { BoardMemberFormDialog }
