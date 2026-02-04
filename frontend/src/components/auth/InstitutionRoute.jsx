import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export default function InstitutionRoute() {
  const { isAuthenticated, isInstitution, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isInstitution) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
