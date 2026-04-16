import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] rounded-[30px] border border-white/8 bg-background/92 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
