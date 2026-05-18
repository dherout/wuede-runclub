const integerFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const distanceFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatNumber(value: number, fractionDigits = 0): string {
  if (fractionDigits === 0) return integerFormatter.format(value)
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatDistance(metres: number): string {
  return `${distanceFormatter.format(metres / 1000)} km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function formatElevation(metres: number): string {
  return `${integerFormatter.format(Math.round(metres))} m`
}
