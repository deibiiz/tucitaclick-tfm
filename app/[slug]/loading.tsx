export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background">
      <div className="border-b bg-white/80 h-14 animate-pulse" />
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
