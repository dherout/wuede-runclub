import { createFileRoute } from '@tanstack/react-router'
import { AthletePage } from '@pages/athlete'

export const Route = createFileRoute('/athletes/$id')({
  component: AthleteRouteComponent,
})

function AthleteRouteComponent() {
  const { id } = Route.useParams()
  return <AthletePage id={id} />
}
