import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Layout } from '@shared/ui/layout/layout'
import { useVault } from '@app/providers/vault-provider'
import { UnlockPrompt } from '@widgets/unlock-prompt'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { locked } = useVault()
  if (locked) return <UnlockPrompt />
  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  )
}
