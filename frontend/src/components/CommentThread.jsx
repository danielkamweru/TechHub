import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MessageCircle, ThumbsUp, Reply } from 'lucide-react'
import { fetchComments, addComment, likeComment, reportComment } from '../features/comments/commentsSlice'

const CommentThread = ({ contentId, comments: commentsProp }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { items: commentsFromStore, loading } = useSelector((state) => state.comments)
  const comments = commentsProp ?? commentsFromStore ?? []
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyTexts, setReplyTexts] = useState({}) // Store reply text for each comment

  useEffect(() => {
    if (contentId) {
      dispatch(fetchComments(contentId))
    }
  }, [contentId, dispatch])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      await dispatch(addComment({
        contentId: typeof contentId === 'string' ? parseInt(contentId, 10) : contentId,
        text: newComment,
        parentId: null
      })).unwrap()
      setNewComment('')
      dispatch(fetchComments(contentId))
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault()
    const replyText = replyTexts[parentId] || ''
    if (!replyText.trim() || !user) return

    try {
      await dispatch(addComment({
        contentId: typeof contentId === 'string' ? parseInt(contentId, 10) : contentId,
        text: replyText,
        parentId
      })).unwrap()
      
      // Clear reply text for this specific comment
      setReplyTexts(prev => ({ ...prev, [parentId]: '' }))
      setReplyTo(null)
      dispatch(fetchComments(contentId))
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleLikeComment = (commentId) => {
    if (!user) return
    dispatch(likeComment(commentId))
  }

  const handleReportComment = (commentId) => {
    if (!user) return
    dispatch(reportComment(commentId))
  }

  const Comment = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="font-medium text-sm">{comment.author?.full_name || comment.author?.name || comment.author?.username || 'Anonymous'}</span>
              <span className="text-gray-500 text-xs ml-2">
                {new Date(comment.created_at || comment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{comment.text}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <button 
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1 transition-colors ${
              comment.is_liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <ThumbsUp size={14} fill={comment.is_liked ? 'currentColor' : 'none'} />
            <span>{comment.likes_count || 0}</span>
          </button>
          
          {!isReply && user && (
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          )}
        </div>
        
        {replyTo === comment.id && (
          <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
            <textarea
              value={replyTexts[comment.id] || ''}
              onChange={(e) => {
                setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))
              }}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent textarea-ltr"
              rows="4"
              style={{ minHeight: '100px' }}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn-primary text-sm">
                Reply
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setReplyTo(null)
                  setReplyTexts(prev => ({ ...prev, [comment.id]: '' }))
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      {comment.replies?.map(reply => (
        <Comment key={`${comment.id}-reply-${reply.id}`} comment={reply} isReply={true} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} />
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="3"
          />
          <button type="submit" className="btn-primary mt-2">
            Post Comment
          </button>
        </form>
      )}
      
      <div className="space-y-4">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
      
      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}

export default CommentThread