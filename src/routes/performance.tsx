import { createFileRoute } from '@tanstack/react-router'
import { PerformancePage } from '@pages/performance'

export const Route = createFileRoute('/performance')({
  component: PerformancePage,
})
