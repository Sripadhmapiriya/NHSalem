/**
 * Skeleton — shimmer placeholder for loading states
 */
export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      aria-hidden="true"
      role="presentation"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[28px] shadow-card overflow-hidden">
      <Skeleton className="w-full aspect-[4/3]" rounded="rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-[28px] shadow-card overflow-hidden">
      <Skeleton className="w-full aspect-[3/2]" rounded="rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container-max py-16 space-y-8" aria-label="Loading page content" aria-busy="true">
      <Skeleton className="h-12 w-2/3 mx-auto" />
      <Skeleton className="h-6 w-1/3 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
