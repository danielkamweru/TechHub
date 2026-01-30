import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchContent } from '../features/content/contentSlice'

const ApiTest = () => {
  const dispatch = useDispatch()
  const { items: content, loading, error } = useSelector((state) => state.content)
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    const runApiTests = async () => {
      const results = []
      
      // Test 1: Basic API connectivity
      try {
        const response = await fetch('http://localhost:8000/')
        const data = await response.json()
        results.push({ test: 'Basic API', status: '✅ Success', data: data.message })
      } catch (error) {
        results.push({ test: 'Basic API', status: '❌ Failed', error: error.message })
      }

      // Test 2: Content endpoint
      try {
        const response = await fetch('http://localhost:8000/api/content')
        const data = await response.json()
        results.push({ test: 'Content API', status: '✅ Success', data: `Found ${data.length} items` })
      } catch (error) {
        results.push({ test: 'Content API', status: '❌ Failed', error: error.message })
      }

      // Test 3: Categories endpoint
      try {
        const response = await fetch('http://localhost:8000/api/categories')
        const data = await response.json()
        results.push({ test: 'Categories API', status: '✅ Success', data: `Found ${data.length} categories` })
      } catch (error) {
        results.push({ test: 'Categories API', status: '❌ Failed', error: error.message })
      }

      // Test 4: Auth endpoint (login attempt)
      try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
        })
        const data = await response.json()
        results.push({ test: 'Auth API', status: '✅ Success', data: 'Auth endpoint working (expected failure)' })
      } catch (error) {
        results.push({ test: 'Auth API', status: '❌ Failed', error: error.message })
      }

      setTestResults(results)
    }

    runApiTests()
  }, [])

  const testReduxConnection = () => {
    dispatch(fetchContent())
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Direct API Tests</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{result.test}</span>
                <span className={`text-sm ${result.status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {result.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Redux Connection Test</h2>
          <button
            onClick={testReduxConnection}
            className="btn-primary mb-4"
          >
            Test Redux API Call
          </button>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Loading:</span>
              <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                {loading ? 'Loading...' : 'Idle'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Content Items:</span>
              <span className="text-blue-600">{content?.length || 0} items</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Error:</span>
              <span className={error ? 'text-red-600' : 'text-green-600'}>
                {error || 'No errors'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Frontend URL:</span>
              <span>{window.location.origin}</span>
            </div>
            <div className="flex justify-between">
              <span>Backend URL:</span>
              <span>http://localhost:8000</span>
            </div>
            <div className="flex justify-between">
              <span>API Base URL:</span>
              <span>http://localhost:8000/api</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTest
