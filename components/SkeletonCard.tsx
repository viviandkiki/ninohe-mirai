export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-[#f1f5f9] p-5">
      <div className="h-4 bg-[#e2e8f0] rounded w-1/3 mb-3" />
      <div className="h-3 bg-[#e2e8f0] rounded w-full mb-2" />
      <div className="h-3 bg-[#e2e8f0] rounded w-2/3" />
    </div>
  )
}
