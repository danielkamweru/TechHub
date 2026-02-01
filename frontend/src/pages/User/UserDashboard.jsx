import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, Grid, List, Heart, Bookmark, Eye, Play, Headphones, BookOpen, TrendingUp, Star, Bell, Settings, User, Clock, BarChart3, Plus, PenTool, X } from 'lucide-react'
import { fetchContent, likeContent, saveToWishlist, createContent, updateContent, deleteContent } from '../../features/content/contentSlice'
import { fetchCategories, subscribeToCategory, unsubscribeFromCategory } from '../../features/categories/categoriesSlice'
import { fetchRecommendations } from '../../features/users/usersSlice'
import ContentCard from '../../components/ContentCard'
import UserSubscriptions from '../../components/UserSubscriptions'
import AdminActions from '../../components/AdminActions'

const UserDashboard = () => {
  const dispatch = useDispatch()
  const { items: content, loading } = useSelector((state) => state.content)
  const { items: categories } = useSelector((state) => state.categories)
  const { items: recommendations } = useSelector((state) => state.users)
  const { user } = useSelector((state) => state.auth)
  
  const [activeTab, setActiveTab] = useState('create')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [subscribedCategories, setSubscribedCategories] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_text: '',
    content_type: 'article',
    category_id: '',
    media_url: '',
    thumbnail_url: '',
    tags: ''
  })
  const [userStats, setUserStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    contentConsumed: 0
  })

  useEffect(() => {
    dispatch(fetchContent())
    dispatch(fetchCategories())
    dispatch(fetchRecommendations(user?.id))
    
    // Load user's subscribed categories from localStorage or API
    const savedSubscriptions = JSON.parse(localStorage.getItem('subscribedCategories') || '[]')
    setSubscribedCategories(savedSubscriptions)
    
    // Calculate user stats
    const stats = calculateUserStats()
    setUserStats(stats)
  }, [dispatch, user])

  const calculateUserStats = () => {
    const viewedContent = JSON.parse(localStorage.getItem('viewedContent') || '[]')
    const likedContent = JSON.parse(localStorage.getItem('likedContent') || '{}')
    const comments = JSON.parse(localStorage.getItem('userComments') || '[]')
    
    return {
      totalViews: viewedContent.length,
      totalLikes: Object.keys(likedContent).length,
      totalComments: comments.length,
      contentConsumed: viewedContent.length
    }
  }

  const handleSubscribe = async (categoryId) => {
    try {
      await dispatch(subscribeToCategory(categoryId)).unwrap()
      const newSubscriptions = [...subscribedCategories, categoryId]
      setSubscribedCategories(newSubscriptions)
      localStorage.setItem('subscribedCategories', JSON.stringify(newSubscriptions))
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
  }

  const handleUnsubscribe = async (categoryId) => {
    try {
      await dispatch(unsubscribeFromCategory(categoryId)).unwrap()
      const newSubscriptions = subscribedCategories.filter(id => id !== categoryId)
      setSubscribedCategories(newSubscriptions)
      localStorage.setItem('subscribedCategories', JSON.stringify(newSubscriptions))
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    }
  }

  const handleLike = async (contentId) => {
    try {
      await dispatch(likeContent(contentId)).unwrap()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to like content:', error)
    }
  }

  const handleSaveToWishlist = async (contentId) => {
    try {
      await dispatch(saveToWishlist(contentId)).unwrap()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to save to wishlist:', error)
    }
  }

  const handleCreateContent = async (e) => {
    e.preventDefault()
    try {
      const contentData = {
        ...formData,
        category_id: parseInt(formData.category_id)
      }
      
      if (editingContent) {
        await dispatch(updateContent({ id: editingContent.id, ...contentData })).unwrap()
      } else {
        await dispatch(createContent(contentData)).unwrap()
      }
      
      resetContentForm()
      dispatch(fetchContent())
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  const resetContentForm = () => {
    setFormData({
      title: '',
      description: '',
      content_text: '',
      content_type: 'article',
      category_id: '',
      media_url: '',
      thumbnail_url: '',
      tags: ''
    })
    setShowCreateForm(false)
    setEditingContent(null)
  }

  const handleEditContent = (content) => {
    setFormData({
      title: content.title,
      description: content.content_text?.substring(0, 200) || '',
      content_text: content.content_text || '',
      content_type: content.content_type,
      category_id: content.category_id?.toString() || '',
      media_url: content.media_url || '',
      thumbnail_url: content.thumbnail_url || '',
      tags: content.tags || ''
    })
    setEditingContent(content)
    setShowCreateForm(true)
  }

  const handleDeleteContent = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await dispatch(deleteContent(id)).unwrap()
        dispatch(fetchContent())
      } catch (error) {
        console.error('Failed to delete content:', error)
      }
    }
  }

  // Filter content based on active tab
  const getFilteredContent = () => {
    let filtered = content || []

    // Apply tab-specific filtering
    if (activeTab === 'for-you') {
      // Use recommendations API or fallback to liked content
      filtered = recommendations && recommendations.length > 0 ? recommendations : content
    } else if (activeTab === 'wishlist') {
      const wishlistContent = JSON.parse(localStorage.getItem('wishlistContent') || '{}')
      filtered = filtered.filter(item => wishlistContent[item.id])
    } else if (activeTab === 'recommended') {
      // Content from subscribed categories
      filtered = filtered.filter(item => 
        subscribedCategories.includes(item.category_id)
      )
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_text?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category?.name === selectedCategory)
    }

    // Apply content type filter
    if (selectedType) {
      filtered = filtered.filter(item => item.content_type === selectedType)
    }

    return filtered
  }

  const filteredContent = getFilteredContent()

  const tabs = [
    { id: 'create', label: 'Create Content', icon: Plus }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name || user?.username}!
            </h1>
            <p className="text-gray-600">Discover and manage your tech learning journey</p>
          </div>
          <a
            href="/studio"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PenTool size={18} />
            Create Content
          </a>
        </div>


        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>


        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'create' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Create New Content</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-primary flex items-center gap-2"
                >
                  {showCreateForm ? <X size={16} /> : <Plus size={16} />}
                  {showCreateForm ? 'Cancel' : 'Create Content'}
                </button>
              </div>

              {showCreateForm && (
                <div className="border-t pt-6">
                  <form onSubmit={handleCreateContent} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                        <select
                          value={formData.content_type}
                          onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio/Podcast</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your content..."
                        required
                      />
                    </div>

                    {(formData.content_type === 'video' || formData.content_type === 'audio') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
                        <input
                          type="url"
                          value={formData.media_url}
                          onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://youtube.com/watch?v=... or audio URL"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                      <textarea
                        value={formData.content_text}
                        onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                        rows="12"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Write your content here..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="javascript, react, tutorial (comma-separated)"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="btn-primary">
                        {editingContent ? 'Update Content' : 'Create Content'}
                      </button>
                      <button type="button" onClick={resetContentForm} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard