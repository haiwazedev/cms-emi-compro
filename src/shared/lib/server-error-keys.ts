import type { Dictionary } from './i18n/id'

type ServerErrorKey = Exclude<keyof Dictionary['serverError'], 'byStatus'>

// Backend messages (English, see docs/api.md) the CMS translates. Unlisted
// messages fall back to a generic text for their HTTP status.
export const SERVER_ERROR_KEYS: Record<string, ServerErrorKey> = {
  'A document commitment with this filename already exists.': 'filenameTaken',
  'A document with this filename already exists.': 'filenameTaken',
  'A file with this filename already exists.': 'filenameTaken',
  'A logo with this filename already exists.': 'filenameTaken',
  'Article category slug is already in use.': 'articleCategorySlugTaken',
  'Article slug is already in use.': 'articleSlugTaken',
  'Bahasa Indonesia is required before adding another language.':
    'defaultLanguageRequired',
  'Document must be a valid PDF file.': 'invalidPdf',
  'Email is already registered.': 'emailTaken',
  'Filename is too long for the public file path.': 'invalidFilename',
  'Filename is too long for the public media path.': 'invalidFilename',
  'Filename must be a safe file name of at most 255 characters.':
    'invalidFilename',
  'Filename must be a safe name of at most 255 bytes.': 'invalidFilename',
  'Invalid email or password.': 'invalidCredentials',
  'Language does not exist or is inactive.': 'languageInactive',
  'Logo must be a PNG, JPG, JPEG, or WEBP file.': 'invalidLogo',
  'Photo must be a PNG, JPG, or JPEG file.': 'invalidPicture',
  'Picture content does not contain valid dimensions.': 'invalidImage',
  'Picture content does not match its file extension.': 'invalidImage',
  'Picture content is not a valid JPEG file.': 'invalidImage',
  'Picture content is not a valid WebP file.': 'invalidImage',
  'Picture dimensions are invalid.': 'invalidImage',
  'Picture must be a PNG, JPG, or JPEG file.': 'invalidPicture',
  'Role name is already in use.': 'roleNameTaken',
  'SVG file is invalid.': 'invalidSvg',
  'The invite email could not be sent. Try resending the invite.':
    'inviteEmailFailed',
  'This link is invalid or has expired.': 'invalidLink',
  'User has already activated their account.': 'userAlreadyActivated',
  'You cannot change your own role or deactivate yourself.': 'ownRoleOrStatus',
  'You cannot delete your own account.': 'ownAccountDelete',
  'You cannot delete your own role.': 'ownRoleDelete',
  'You cannot remove user management from your own role.': 'ownManageUsers',
  'Your account is inactive.': 'accountInactive',
}
