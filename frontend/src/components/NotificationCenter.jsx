import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, X, Info, AlertTriangle, CheckCircle, MessageSquare, Heart, User, Settings, FileText } from 'lucide-react'
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, fetchUnreadCount } from '../features/notifications/notificationsSlice'

const NotificationCenter = () => {
  const dispatch = useDispatch()
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications)
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  // Fetch unread count on mount and periodically
  useEffect(() => {
    dispatch(fetchUnreadCount())
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount())
    }, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [dispatch])

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications())
    }
  }, [dispatch, isOpen])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap()
      dispatch(fetchNotifications())
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap()
      dispatch(fetchNotifications())
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const t = type?.toLowerCase?.() ?? type
    switch (t) {
      case 'new_content':
      case 'system':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'comment_reply':
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-green-600" />
      case 'content_approved':
      case 'status_change':
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      case 'content_flagged':
      case 'flag':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'like_received':
      case 'like':
        return <Heart className="w-4 h-4 text-pink-600" />
      case 'new_follower':
      case 'follow':
        return <User className="w-4 h-4 text-indigo-600" />
      case 'system_update':
        return <Settings className="w-4 h-4 text-gray-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.is_read
    return true
  }) || []

  return (
    <div className="relative">
      {/* Notification Bell - red dot + unread count until marked read */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-3 py-2 text-sm font-medium ${
                filter === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const contentId = notification.related_content_id
                const handleClick = () => {
                  handleMarkAsRead(notification.id)
                  if (contentId) setIsOpen(false)
                }
                const content = (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type || notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                )
                return contentId ? (
                  <Link
                    key={notification.id}
                    to={`/content/${contentId}`}
                    onClick={handleClick}
                    className={`block p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={handleClick}
                    onKeyDown={e => e.key === 'Enter' && handleClick()}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    {content}
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
