import type { ReactNode } from 'react'
import { Button } from '../atoms/button'

export type DayScheduleTemplateProps = {
  header: ReactNode
  navigator: ReactNode
  main: ReactNode
  panel: ReactNode
  panelTitle: string
  closeLabel: string
  isPanelOpen: boolean
  onClosePanel: () => void
}

// on small screens an open panel covers the page, from md up it is always a column on the right
const PANEL_OPEN = 'fixed inset-0 z-50 overflow-auto bg-background p-4 md:static md:z-auto md:overflow-visible md:p-0'
const PANEL_CLOSED = 'hidden md:block'

export const DayScheduleTemplate = ({
  header,
  navigator,
  main,
  panel,
  panelTitle,
  closeLabel,
  isPanelOpen,
  onClosePanel,
}: DayScheduleTemplateProps) => (
  <div className="flex min-h-screen flex-col">
    {header}
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
      {navigator}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_22rem]">
        <main>{main}</main>
        <aside aria-label={panelTitle} data-open={isPanelOpen} className={isPanelOpen ? PANEL_OPEN : PANEL_CLOSED}>
          {isPanelOpen && (
            <div className="mb-4 md:hidden">
              <Button variant="ghost" onClick={onClosePanel}>
                {closeLabel}
              </Button>
            </div>
          )}
          {panel}
        </aside>
      </div>
    </div>
  </div>
)
