import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-10 w-72 sm:h-12 sm:w-96" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-44 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.95fr)]">
        <Skeleton className="h-80 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] xl:grid-cols-1">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

