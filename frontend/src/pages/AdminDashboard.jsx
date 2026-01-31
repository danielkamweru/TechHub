import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, FileText, Flag, Plus, Settings, Check, X, Trash2, AlertTriangle, UserPlus, UserX } from 'lucide-react'
import { fetchUsers, createUser, deactivateUser } from '../features/users/usersSlice'
import { fetchContent, approveContent, rejectContent, deleteContent, flagContent } from '../features/content/contentSlice'
import { fetchCategories, createCategory } from '../features/categories/categoriesSlice'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { items: users } = useSelector((state) => state.users)
  const { items: content } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  
  const [newCategory, setNewCategory] = useState('')
  const [activeTab, setActiveTab] = useState('content') // Start with content tab
  const [flagReason, setFlagReason] = useState('')
  const [flagDescription, setFlagDescription] = useState('')
  const [showFlagModal, setShowFlagModal] = useState(false)
  const [selectedContentId, setSelectedContentId] = useState(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', email: '', full_name: '', role: 'user' })

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchContent({ limit: 100, status: null })) // Fetch all content for admin
    dispatch(fetchCategories())
  }, [dispatch])

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    
    try {
      await dispatch(createCategory({ name: newCategory })).unwrap()
      setNewCategory('')
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleApproveContent = async (contentId) => {
    try {
      await dispatch(approveContent(contentId)).unwrap()
      // Refresh content to show updated status and reorder
      dispatch(fetchContent({ limit: 100, status: null }))
    } catch (error) {
      console.error('Failed to approve content:', error)
    }
  }

  const handleRejectContent = async (contentId) => {
    try {
      await dispatch(rejectContent(contentId)).unwrap()
      // Refresh content to show updated status
      dispatch(fetchContent({ limit: 100, status: null }))
    } catch (error) {
      console.error('Failed to reject content:', error)
    }
  }

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await dispatch(deleteContent(contentId)).unwrap()
        dispatch(fetchContent({ limit: 100, status: null }))
      } catch (error) {
        console.error('Failed to delete content:', error)
      }
    }
  }

  const handleFlagContent = async (e) => {
    e.preventDefault()
    if (!selectedContentId || !flagReason) return
    
    try {
      await dispatch(flagContent({ 
        contentId: selectedContentId, 
        reason: flagReason,
        description: flagDescription 
      })).unwrap()
      setShowFlagModal(false)
      setFlagReason('')
      setFlagDescription('')
      setSelectedContentId(null)
      // Refresh content to show updated flag status
      dispatch(fetchContent({ limit: 100, status: null }))
    } catch (error) {
      console.error('Failed to flag content:', error)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createUser(newUser)).unwrap()
      setShowAddUserModal(false)
      setNewUser({ username: '', email: '', full_name: '', role: 'user' })
      dispatch(fetchUsers())
    } catch (error) {
      console.error('Failed to add user:', error)
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await dispatch(deactivateUser(userId)).unwrap()
        dispatch(fetchUsers())
      } catch (error) {
        console.error('Failed to deactivate user:', error)
      }
    }
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Content', value: content.length, icon: FileText, color: 'bg-green-500' },
    { label: 'Categories', value: categories.length, icon: Settings, color: 'bg-purple-500' },
    { label: 'Flagged Content', value: content.filter(item => item.is_flagged).length, icon: Flag, color: 'bg-red-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'users', 'content', 'categories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <p className="text-gray-600">Overview of recent platform activity will be displayed here.</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">User Management</h3>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UserPlus size={16} />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.full_name || user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.is_active && (
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 border border-red-200"
                              title="Deactivate User"
                            >
                              <UserX size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Content Management</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {content
                      .sort((a, b) => {
                        // Published content first, then unpublished at bottom
                        if (a.status === 'PUBLISHED' && b.status !== 'PUBLISHED') return -1
                        if (a.status !== 'PUBLISHED' && b.status === 'PUBLISHED') return 1
                        // Within same status group, sort by ID
                        return a.id - b.id
                      })
                      .map((item) => {
                        console.log('Content item:', item.id, 'Status:', item.status, 'Type:', typeof item.status)
                        return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.author?.full_name || item.author?.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {item.content_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                            item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'REVIEW' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            {item.status === 'PUBLISHED' ? (
                              // Published content shows flag and delete
                              <>
                                <button
                                  onClick={() => {
                                    console.log('Flag clicked for:', item.id)
                                    setSelectedContentId(item.id)
                                    setShowFlagModal(true)
                                  }}
                                  className={`p-2 rounded hover:bg-orange-50 border border-orange-300 ${
                                    item.is_flagged ? 'text-white bg-red-600 hover:bg-red-700' : 'text-orange-600 hover:text-orange-900 bg-orange-50'
                                  }`}
                                  title="Flag"
                                >
                                  <Flag size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    console.log('Delete clicked for:', item.id)
                                    handleDeleteContent(item.id)
                                  }}
                                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              // Unpublished content shows approve, reject, delete
                              <>
                                <button
                                  onClick={() => {
                                    console.log('Approve clicked for:', item.id, 'Status:', item.status)
                                    handleApproveContent(item.id)
                                  }}
                                  className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 border border-green-300 bg-green-50"
                                  title="Approve"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    console.log('Reject clicked for:', item.id, 'Status:', item.status)
                                    handleRejectContent(item.id)
                                  }}
                                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                  title="Reject"
                                >
                                  <X size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    console.log('Delete clicked for:', item.id)
                                    handleDeleteContent(item.id)
                                  }}
                                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 border border-red-300 bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Categories</h3>
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="submit" className="btn-primary flex items-center gap-1">
                    <Plus size={16} />
                    Add
                  </button>
                </form>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="text-blue-500" size={20} />
              <h3 className="text-lg font-medium">Add New User</h3>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="tech_writer">Tech Writer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false)
                    setNewUser({ username: '', email: '', full_name: '', role: 'user' })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag Content Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-orange-500" size={20} />
              <h3 className="text-lg font-medium">Flag Content</h3>
            </div>
            <form onSubmit={handleFlagContent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select reason</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="copyright">Copyright Violation</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={flagDescription}
                  onChange={(e) => setFlagDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFlagModal(false)
                    setFlagReason('')
                    setFlagDescription('')
                    setSelectedContentId(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Flag Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard