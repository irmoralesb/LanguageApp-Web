import { Outlet, useLocation } from 'react-router-dom'
import { AppShell } from '@/layout/AppShell'

const BARE_PATH_PREFIXES = ['/login', '/design-sketches']

function usesBareLayout(pathname: string): boolean {
  return BARE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function MainLayout() {
  const { pathname } = useLocation()
  if (usesBareLayout(pathname)) {
    return <Outlet />
  }
  return <AppShell />
}
