import React, { useState } from 'react'

interface LegoSet {
  set_number: string
  name: string
  price: number
  shipping_cost: number
  total_price: number
  store_name: string
  store_url: string
  condition: string
  availability: boolean
  last_updated: string
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LegoSet[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.sets || [])
      } else {
        console.error('Search failed')
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search LEGO Sets</h1>
        <p className="text-gray-600 mb-6">
          Search for LEGO sets across multiple marketplaces and get price comparisons
        </p>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter LEGO set name or number (e.g., '42100' or 'Liebherr')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Searching for LEGO sets...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {results.length} results for "{query}"
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {results.map((set, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {set.set_number} - {set.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        set.condition === 'new' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {set.condition}
                      </span>
                      <span>{set.store_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Price: <span className="font-medium text-gray-900">{set.price} PLN</span>
                      </span>
                      <span className="text-gray-600">
                        Shipping: <span className="font-medium text-gray-900">{set.shipping_cost} PLN</span>
                      </span>
                      <span className="text-green-600 font-semibold">
                        Total: {set.total_price} PLN
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <a
                      href={set.store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Offer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
        </div>
      )}
    </div>
  )
}

export default Search 