'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MobileNav, Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const [isRouteLoading, setIsRouteLoading] = useState(false)

  useEffect(() => {
    if (prevPathname.current === pathname) return

    setIsRouteLoading(true)
    const timer = window.setTimeout(() => {
      setIsRouteLoading(false)
    }, 420)

    prevPathname.current = pathname
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <div className="min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] overflow-hidden rounded-[22px] border border-white/8 bg-background/92 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:rounded-[30px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            aria-hidden
            className={`h-0.5 w-full overflow-hidden bg-transparent transition-opacity duration-200 ${
              isRouteLoading ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="h-full w-2/5 animate-[route-progress_900ms_ease-in-out_infinite] rounded-full bg-primary/85" />
          </div>
          <Topbar />
          <MobileNav />
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
