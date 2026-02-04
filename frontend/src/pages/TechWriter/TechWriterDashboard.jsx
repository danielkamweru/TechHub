import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { PenTool, Plus, FileText, BarChart3, CheckCircle, XCircle, Eye, Flag, Clock, Users, TrendingUp, Edit, Save, X, Folder } from 'lucide-react'
import { fetchContent, createContent, updateContent, approveContent, rejectContent, flagContent } from '../../features/content/contentSlice'
import { fetchCategories, createCategory } from '../../features/categories/categoriesSlice'

const TechWriterDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: content } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [activeTab, setActiveTab] = useState('my-content')
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#3B82F6' })
  const [newContent, setNewContent] = useState({
    title: '',
    subtitle: '',
    content_text: '',
    content_type: 'article',
    media_url: '',
    thumbnail_url: '',
    category_id: ''
  })

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    dispatch(fetchContent())
    dispatch(fetchCategories())
  }, [dispatch, navigate])

  const handleCreateContent = async (e) => {
    e.preventDefault()
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to create content. Please log in first.')
      return
    }
    
    try {
      await dispatch(createContent(newContent)).unwrap()
      setNewContent({
        title: '',
        subtitle: '',
        content_text: '',
        content_type: 'article',
        media_url: '',
        thumbnail_url: '',
        category_id: ''
      })
      setShowCreateForm(false)
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to create content:', error)
      // Show more detailed error message
      if (typeof error === 'string') {
        alert(`Error: ${error}`)
      } else {
        alert('Failed to create content. Please check your authentication and try again.')
      }
    }
  }

  const handleEditContent = async (contentItem) => {
    setEditingContent(contentItem)
    setNewContent({
      title: contentItem.title,
      subtitle: contentItem.subtitle || '',
      content_text: contentItem.content_text,
      content_type: contentItem.content_type,
      media_url: contentItem.media_url || '',
      thumbnail_url: contentItem.thumbnail_url || '',
      category_id: contentItem.category_id
    })
  }

  const handleUpdateContent = async (e) => {
    e.preventDefault()
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to update content. Please log in first.')
      return
    }
    
    try {
      await dispatch(updateContent({ id: editingContent.id, ...newContent })).unwrap()
      setEditingContent(null)
      setNewContent({
        title: '',
        subtitle: '',
        content_text: '',
        content_type: 'article',
        media_url: '',
        thumbnail_url: '',
        category_id: ''
      })
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to update content:', error)
      // Error is already handled by the slice with toast
    }
  }

  const handleCancelEdit = () => {
    setEditingContent(null)
    setNewContent({
      title: '',
      subtitle: '',
      content_text: '',
      content_type: 'article',
      media_url: '',
      thumbnail_url: '',
      category_id: ''
    })
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createCategory(newCategory)).unwrap()
      setNewCategory({ name: '', description: '', color: '#3B82F6' })
      setShowCategoryForm(false)
      dispatch(fetchCategories())
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleApproveContent = async (contentId) => {
    try {
      await dispatch(approveContent(contentId)).unwrap()
      // Refresh content list to show updated order
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to approve content:', error)
    }
  }

  const handleRejectContent = async (contentId) => {
    try {
      await dispatch(rejectContent(contentId)).unwrap()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to reject content:', error)
    }
  }

  const handleFlagContent = async (contentId, reason) => {
    try {
      await dispatch(flagContent({ contentId, reason })).unwrap()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to flag content:', error)
      // Error is already handled by the slice with toast
    }
  }

  const { user } = useSelector((state) => state.auth)
  const myContent = content?.filter(c => c.author_id === user?.id) || [] // Use actual user ID
  const pendingContent = content?.filter(c => c.status === 'review') || []
  const publishedContent = content?.filter(c => c.status === 'published') || []

  const tabs = [
    { id: 'my-content', label: 'My Content', icon: FileText },
    { id: 'pending-review', label: 'Pending Review', icon: Clock },
    { id: 'published', label: 'Published', icon: CheckCircle },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  const totalViews = myContent.reduce((sum, item) => sum + (item.views_count || 0), 0)
  const publishedCount = myContent.filter(c => c.status === 'published').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <PenTool className="text-blue-600" />
              Writer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Create and manage your content</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Content
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{myContent.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingContent.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'my-content' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Content</h2>
                <div className="space-y-4">
                  {myContent.length > 0 ? (
                    myContent.map(item => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                                {item.content_type}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                item.status === 'published' ? 'bg-green-100 text-green-800' :
                                item.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status || 'draft'}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {item.category?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>{item.views_count || 0} views</span>
                              <span>{item.likes_count || 0} likes</span>
                              <span>{item.comments_count || 0} comments</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleEditContent(item)}
                              className="text-gray-600 hover:bg-gray-50 p-2 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No content created yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pending-review' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Content Pending Review</h2>
                <div className="space-y-4">
                  {pendingContent.length > 0 ? (
                    pendingContent.map(item => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                                {item.content_type}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {item.category?.name}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                By: {item.author?.full_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleApproveContent(item.id)}
                              className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-md text-sm"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectContent(item.id)}
                              className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleFlagContent(item.id, 'inappropriate')}
                              className="flex items-center gap-1 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-md text-sm"
                            >
                              <Flag size={14} />
                              Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No content pending review.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'published' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Published Content</h2>
                <div className="space-y-4">
                  {publishedContent.length > 0 ? (
                    publishedContent.map(item => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.content_text?.substring(0, 150)}...</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                                {item.content_type}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {item.category?.name}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                By: {item.author?.full_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span>{item.views_count || 0} views</span>
                              <span>{item.likes_count || 0} likes</span>
                              <span>{item.comments_count || 0} comments</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleFlagContent(item.id, 'inappropriate')}
                              className="text-orange-600 hover:bg-orange-50 p-2 rounded"
                            >
                              <Flag size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No published content yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Categories</h2>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Create Category
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(categories || []).map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <h3 className="font-medium">{category.name}</h3>
                          </div>
                          <p className="text-gray-600 text-sm">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Content Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium mb-4">Performance Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Views</span>
                        <span className="font-medium">{totalViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Views per Content</span>
                        <span className="font-medium">
                          {myContent.length > 0 ? Math.round(totalViews / myContent.length) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Likes</span>
                        <span className="font-medium">
                          {myContent.reduce((sum, item) => sum + (item.likes_count || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Comments</span>
                        <span className="font-medium">
                          {myContent.reduce((sum, item) => sum + (item.comments_count || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium mb-4">Content Distribution</h3>
                    <div className="space-y-3">
                      {['article', 'video', 'podcast'].map(type => {
                        const count = myContent.filter(c => c.content_type === type).length
                        const percentage = myContent.length > 0 ? (count / myContent.length * 100).toFixed(0) : 0
                        return (
                          <div key={type}>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600 capitalize">{type}s</span>
                              <span className="font-medium">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Content Modal */}
        {(showCreateForm || editingContent) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingContent ? 'Edit Content' : 'Create New Content'}
              </h2>
              <form onSubmit={editingContent ? handleUpdateContent : handleCreateContent} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Subtitle (optional)"
                  value={newContent.subtitle}
                  onChange={(e) => setNewContent({...newContent, subtitle: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  placeholder="Description"
                  value={newContent.content_text}
                  onChange={(e) => setNewContent({...newContent, content_text: e.target.value})}
                  className="w-full p-3 border rounded-lg h-32"
                  required
                />
                <select
                  value={newContent.content_type}
                  onChange={(e) => setNewContent({...newContent, content_type: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                  <option value="audio">Audio</option>
                </select>
                <select
                  value={newContent.category_id}
                  onChange={(e) => setNewContent({...newContent, category_id: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {(categories || []).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="Content URL (for video/audio)"
                  value={newContent.media_url}
                  onChange={(e) => setNewContent({...newContent, media_url: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="url"
                  placeholder="Thumbnail URL"
                  value={newContent.thumbnail_url}
                  onChange={(e) => setNewContent({...newContent, thumbnail_url: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    {editingContent ? (
                      <>
                        <Save size={16} className="inline mr-1" />
                        Update
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="inline mr-1" />
                        Create
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      if (editingContent) handleCancelEdit()
                    }}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    <X size={16} className="inline mr-1" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Category Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-24 resize-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Color:</label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-12 h-8 border rounded"
                  />
                  <span className="text-sm text-gray-600">{newCategory.color}</span>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TechWriterDashboard