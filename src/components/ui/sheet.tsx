import { Drawer } from 'antd'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/** Side drawer (Ant Design Drawer). Opens from the inline-end edge, so it flips in RTL. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const { i18n } = useTranslation()
  return <Drawer open={open} onClose={onClose} title={title} placement={i18n.language === 'fa' ? 'left' : 'right'} width={440}>{children}</Drawer>
}
