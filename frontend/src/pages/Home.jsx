import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Search, Sparkles } from 'lucide-react'
import ContentCard from '../components/ContentCard'
import Loader from '../components/Loader'
import { fetchContent, setFilters } from '../features/content/contentSlice'
import { fetchCategories } from '../features/categories/categoriesSlice'

const Home = () => {
  const dispatch = useDispatch()
  const { items: content, loading, filters, pagination } = useSelector((state) => state.content)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchContent({ limit: 50 }))
  }, [dispatch])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      dispatch(setFilters({ search: searchTerm, category: selectedCategory }))
      dispatch(fetchContent({ search: searchTerm, category: selectedCategory, limit: 50 }))
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, selectedCategory, dispatch])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-yellow-300 animate-pulse-slow" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Moringa TechHub</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Discover authentic tech content, connect with industry experts, and accelerate your journey in technology
          </p>
          
          {/* AWS Video */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm p-1">
              <div className="relative rounded-xl overflow-hidden">
                <iframe
                  className="w-full h-64 md:h-96 rounded-xl"
                  src="https://www.youtube.com/embed/VIEiR-mia0c?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
                  title="AWS Full Course for Beginners - Tech Learning"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none rounded-xl" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    🚀 Start Your Cloud Journey
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Create Account CTA */}
          {!isAuthenticated && (
            <div className="mb-8">
              <Link 
                to="/register" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
              >
                <Sparkles className="mr-3" size={24} />
                Create Your Free Account
              </Link>
              <p className="mt-4 text-white/80 text-sm">
                Join thousands of tech enthusiasts sharing knowledge
              </p>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass p-2 rounded-2xl">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search for articles, videos, podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Stack Video Section + Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Full Stack Development Video */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Full Stack Development Guide</h2>
            <p className="text-gray-600 text-lg">A comprehensive roadmap to become a full-stack developer</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm p-1">
              <div className="relative rounded-xl overflow-hidden">
                <iframe
                  className="w-full h-64 md:h-96 rounded-xl"
                  src="https://www.youtube.com/embed/Q33KBiDriJY?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0"
                  title="Full Stack Web Development Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none rounded-xl" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    💻 FreeCodeCamp • 11:45:21
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading amazing content...</p>
            </div>
          </div>
        ) : (
          <>
            {(content || []).length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={20} />
                  Featured Content ({(content || []).length})
                </h3>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {(content || []).map((item, index) => (
                <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContentCard content={item} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(pagination && pagination.totalPages > 1) && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => dispatch(fetchContent({ ...filters, page }))}
                    className={`px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                      page === pagination.page
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home
