import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Play, Headphones, BookOpen, Heart, Bookmark, Share2, MessageCircle, Filter, Search } from 'lucide-react'
import { fetchContent } from '../features/content/contentSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'

const ContentFeed = () => {
  const dispatch = useDispatch()
  const { items: content, loading } = useSelector((state) => state.content)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    search: ''
  })

  useEffect(() => {
    dispatch(fetchContent())
  }, [dispatch])

  const filteredContent = (content || []).filter(item => {
    const matchesCategory = filters.category === 'all' || item.category?.name === filters.category
    const matchesType = filters.type === 'all' || item.content_type === filters.type
    const matchesSearch = !filters.search || 
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.content_text?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesCategory && matchesType && matchesSearch
  })

  const getActionButton = (contentType, url) => {
    switch (contentType) {
      case 'video':
        return (
          <button 
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Play size={16} />
            Watch
          </button>
        )
      case 'podcast':
        return (
          <button 
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Headphones size={16} />
            Listen
          </button>
        )
      case 'article':
        return (
          <button 
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <BookOpen size={16} />
            Read
          </button>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Play size={16} className="text-red-600" />
      case 'podcast': return <Headphones size={16} className="text-purple-600" />
      case 'article': return <BookOpen size={16} className="text-blue-600" />
      default: return null
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Full-Stack': return 'bg-green-100 text-green-800'
      case 'Front-End': return 'bg-blue-100 text-blue-800'
      case 'DevOps': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tech Content Hub</h1>
          <p className="text-gray-600">Discover, watch, listen, and read the best tech content</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="Front-End">Front-End</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="podcast">Podcasts</option>
                <option value="article">Articles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Thumbnail */}
                <Link to={`/content/${item.id}`} className="block">
                  <div className="aspect-video bg-gray-200 relative">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x225/6366f1/white?text=${encodeURIComponent(item.title.substring(0, 20))}`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getTypeIcon(item.content_type)}
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full">
                        {getTypeIcon(item.content_type)}
                        {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category?.name)}`}>
                        {item.category?.name}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link to={`/content/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{item.title}</h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.content_text}</p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionButton(item.content_type, item.media_url)}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                      </button>

                      {/* Bookmark Button */}
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <Bookmark size={18} />
                      </button>

                      {/* Share Button */}
                      <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                        <Share2 size={18} />
                      </button>

                      {/* Comment Button */}
                      <Link to={`/content/${item.id}`} className="p-2 text-gray-400 hover:text-purple-500 transition-colors">
                        <MessageCircle size={18} />
                      </Link>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                    <span>{item.views_count || 0} views</span>
                    <span>By {item.author?.full_name || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredContent.length === 0 && (
          <div className="text-center py-20">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentFeed