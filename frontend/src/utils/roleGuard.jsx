import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Loader from '../components/Loader'

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  // Show loader while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleGuard