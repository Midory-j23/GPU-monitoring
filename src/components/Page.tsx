import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Page frame. Sections are spaced with `gap` in a flex column — NOT with margins:
 * Ant Design resets `margin` on its own components (Card, Button…), which would cancel `mb-*` / `mt-*` on them.
 */
export function Page({ id, children }: { id: string; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="text-2xl font-bold">{t(id)}</h1><p className="text-sm text-muted-foreground">{t(id + 'Sub')}</p></div>
      {children}
    </div>
  )
}
