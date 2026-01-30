import { Link } from 'react-router-dom'
import { Shield, Users, FileText, Settings, AlertTriangle, TrendingUp } from 'lucide-react'

const AdminActions = () => {
  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      href: '/admin',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate user-generated content',
      icon: FileText,
      href: '/admin?tab=content',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Platform Settings',
      description: 'Configure platform-wide settings and preferences',
      icon: Settings,
      href: '/admin?tab=settings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View platform statistics and analytics',
      icon: TrendingUp,
      href: '/admin?tab=overview',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Admin Actions
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              to={action.href}
              className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Quick Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Total Content</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>No recent activity to display</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminActions