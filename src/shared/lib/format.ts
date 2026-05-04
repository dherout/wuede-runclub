export function formatDistance(metres: number): string {
  return `${(metres / 1000).toFixed(1)} km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function formatElevation(metres: number): string {
  return `${Math.round(metres)} m`
}
