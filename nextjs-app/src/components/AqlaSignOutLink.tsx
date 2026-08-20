'use client'

import type { MouseEvent, ReactNode } from 'react'

function clearAqlaPrivateBrowserState() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index)
        if (key?.startsWith('aqla_quit_plan:')) storage.removeItem(key)
      }
      storage.removeItem('aqla_quit_engine_draft_v1')
      storage.removeItem('aqla_adaptive_plan_v3_draft')
    } catch {
      // Cookie/session logout still proceeds if browser storage is unavailable.
    }
  }
}

export default function AqlaSignOutLink({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  function signOut(event: MouseEvent<HTMLAnchorElement>) {
    clearAqlaPrivateBrowserState()
    // Keep the normal link navigation so logout still works if scripting is partially restricted.
    if (event.defaultPrevented) return
  }

  return <a href="/auth/logout" className={className} onClick={signOut}>{children}</a>
}
