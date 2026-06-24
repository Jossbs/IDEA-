import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

/** Global shell: brand navbar + routed content over the oat-white base. */
export function AppLayout() {
  return (
    <div className="flex min-h-full flex-col bg-app">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 p-8 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
