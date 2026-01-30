import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchContent } from '../features/content/contentSlice'

const TestContent = () => {
  const dispatch = useDispatch()
  const { items: content, loading, error } = useSelector((state) => state.content)

  useEffect(() => {
    dispatch(fetchContent())
  }, [dispatch])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Content Debug</h1>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      <p>Error: {error || 'None'}</p>
      <p>Content count: {content?.length || 0}</p>
      
      {content && content.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">First 3 items:</h2>
          {content.slice(0, 3).map(item => (
            <div key={item.id} className="border p-4 mb-2">
              <h3 className="font-bold">{item.title}</h3>
              <p>Type: {item.content_type}</p>
              <p>Category: {item.category?.name}</p>
              <p>URL: {item.media_url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TestContent