import { DASHBOARD_LABELS } from '../constants/dashboard.constants'

function ProfileAvatar() {
  return (
    <div
      role="img"
      aria-label={DASHBOARD_LABELS.profile}
      className="bg-secondary flex size-10 items-center justify-center rounded-full text-xs font-semibold text-white"
    >
      {DASHBOARD_LABELS.profileInitials}
    </div>
  )
}

export { ProfileAvatar }
