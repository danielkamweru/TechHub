import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, Grid, List, Heart, Bookmark, Eye, Play, Headphones, BookOpen, TrendingUp, Star, Bell, Settings, User, Clock, BarChart3, Plus, PenTool } from 'lucide-react'
import { fetchContent, likeContent, saveToWishlist } from '../../features/content/contentSlice'
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
  
  const [activeTab, setActiveTab] = useState('feed')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [subscribedCategories, setSubscribedCategories] = useState([])
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
    { id: 'feed', label: 'Feed', icon: Grid },
    { id: 'for-you', label: 'For You', icon: Heart },
    { id: 'recommended', label: 'Recommended', icon: Star },
    { id: 'wishlist', label: 'Wishlist', icon: Bookmark },
    { id: 'subscriptions', label: 'Subscriptions', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  if (user?.role === 'admin') {
    tabs.push({ id: 'admin', label: 'Admin', icon: Settings })
  }

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

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Viewed</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalViews}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Liked</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalLikes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalComments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{subscribedCategories.length}</p>
              </div>
            </div>
          </div>
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

        {/* Search and Filters - Sticky */}
        {(activeTab === 'feed' || activeTab === 'for-you' || activeTab === 'recommended' || activeTab === 'wishlist') && (
          <div className="sticky top-4 z-10 bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                {/* Content Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="video">Videos</option>
                  <option value="podcast">Podcasts</option>
                  <option value="article">Articles</option>
                  <option value="audio">Audio</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'subscriptions' && (
            <UserSubscriptions />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Your Learning Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Engagement Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Content Consumed</span>
                      <span className="font-medium">{userStats.contentConsumed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Engagement Rate</span>
                      <span className="font-medium">
                        {userStats.totalViews > 0 ? 
                          Math.round((userStats.totalLikes / userStats.totalViews) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comments Posted</span>
                      <span className="font-medium">{userStats.totalComments}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Content Preferences</h3>
                  <div className="space-y-3">
                    {['video', 'article', 'podcast', 'audio'].map(type => {
                      const count = filteredContent.filter(c => c.content_type === type).length
                      const total = filteredContent.length || 1
                      const percentage = Math.round((count / total) * 100)
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

          {activeTab === 'admin' && user?.role === 'admin' && (
            <AdminActions />
          )}

          {(activeTab === 'feed' || activeTab === 'for-you' || activeTab === 'recommended' || activeTab === 'wishlist') && (
            <div>
              {/* Content Grid/List */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredContent.length > 0 ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredContent.map((item) => (
                    <ContentCard
                      key={item.id}
                      content={item}
                      compact={viewMode === 'list'}
                      onLike={() => handleLike(item.id)}
                      onSaveToWishlist={() => handleSaveToWishlist(item.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    {activeTab === 'for-you' && <Heart className="w-16 h-16 mx-auto mb-4" />}
                    {activeTab === 'wishlist' && <Bookmark className="w-16 h-16 mx-auto mb-4" />}
                    {activeTab === 'recommended' && <Star className="w-16 h-16 mx-auto mb-4" />}
                    {activeTab === 'feed' && <Grid className="w-16 h-16 mx-auto mb-4" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'for-you' && 'No personalized content yet'}
                    {activeTab === 'wishlist' && 'Your wishlist is empty'}
                    {activeTab === 'recommended' && 'No recommendations available'}
                    {activeTab === 'feed' && 'No content found'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'for-you' && 'Start interacting with content to get personalized recommendations.'}
                    {activeTab === 'wishlist' && 'Save content to your wishlist to access it later.'}
                    {activeTab === 'recommended' && 'Subscribe to categories to get personalized recommendations.'}
                    {activeTab === 'feed' && 'Try adjusting your search or filter criteria.'}
                  </p>
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