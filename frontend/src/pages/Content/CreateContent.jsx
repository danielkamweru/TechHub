import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateContent = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    content_type: 'article',
    body: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Creating content:', formData)
    navigate('/user')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Content</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Subtitle (optional)"
          value={formData.subtitle}
          onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
          className="w-full p-3 border rounded-lg"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-3 border rounded-lg"
          rows="3"
          required
        />
        <textarea
          placeholder="Content body"
          value={formData.body}
          onChange={(e) => setFormData({...formData, body: e.target.value})}
          className="w-full p-3 border rounded-lg"
          rows="10"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Create
        </button>
      </form>
    </div>
  )
}

export default CreateContent