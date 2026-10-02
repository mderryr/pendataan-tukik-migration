export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b bg-muted/50 animate-pulse" />

      {/* Hero skeleton */}
      <div className="h-[70vh] bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 animate-pulse" />

      {/* Features skeleton */}
      <div className="py-16 space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}