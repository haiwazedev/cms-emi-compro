import { Checkbox } from '@/shared/components/ui/checkbox'
import { CheckIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

function TableCheckbox(props: ComponentProps<typeof Checkbox>) {
  return (
    <span className="relative flex size-4">
      <Checkbox
        {...props}
        className="peer border-border bg-background checked:border-accent checked:bg-accent appearance-none rounded"
      />
      <CheckIcon
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden size-4 p-0.5 text-white peer-checked:block"
      />
    </span>
  )
}

export { TableCheckbox }
