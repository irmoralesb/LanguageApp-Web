import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/context/AuthContext'

interface ServiceAccessRouteProps {
  serviceName: string
  children: React.ReactNode
}

export function ServiceAccessRoute({ serviceName, children }: ServiceAccessRouteProps) {
  const { hasServiceAccess } = useAuth()

  if (!hasServiceAccess(serviceName)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
