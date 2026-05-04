import { RouterProvider } from '@tanstack/react-router'
import { router } from './providers/router'
import { VaultProvider } from './providers/vault-provider'

export function App() {
  return (
    <VaultProvider>
      <RouterProvider router={router} />
    </VaultProvider>
  )
}
