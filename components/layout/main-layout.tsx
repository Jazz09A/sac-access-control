import { MobileNav, Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] overflow-hidden rounded-[22px] border border-white/8 bg-background/92 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:rounded-[30px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
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
