import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, BellOff, Plus, Search } from 'lucide-react'
import { fetchCategories, subscribeToCategory, unsubscribeFromCategory } from '../features/categories/categoriesSlice'

const UserSubscriptions = () => {
  const dispatch = useDispatch()
  const { items: categories } = useSelector((state) => state.categories)
  const { user } = useSelector((state) => state.auth)
  const [subscribedCategories, setSubscribedCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchCategories())
    // Load user's subscribed categories from localStorage or API
    const savedSubscriptions = JSON.parse(localStorage.getItem('subscribedCategories') || '[]')
    setSubscribedCategories(savedSubscriptions)
  }, [dispatch])

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

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Category Subscriptions
        </h3>
        <span className="text-sm text-gray-500">
          {subscribedCategories.length} subscribed
        </span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((category) => {
          const isSubscribed = subscribedCategories.includes(category.id)
          
          return (
            <div
              key={category.id}
              className={`border rounded-lg p-4 transition-all ${
                isSubscribed ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    ></div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <p className="text-xs text-gray-500">
                    {category.content?.length || 0} items
                  </p>
                </div>
                <button
                  onClick={() => isSubscribed ? handleUnsubscribe(category.id) : handleSubscribe(category.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSubscribed
                      ? 'text-blue-600 hover:bg-blue-100'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No categories found' : 'No categories available'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {subscribedCategories.length === 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Plus className="w-4 h-4" />
            <span>Subscribe to categories to get personalized recommendations and notifications</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSubscriptions