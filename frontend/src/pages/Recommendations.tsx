import React, { useState, useEffect } from 'react'

interface Recommendation {
  set_number: string
  set_name: string
  current_best_price: number
  average_market_price: number
  price_percentage: number
  recommendation: string
  confidence_score: number
  reasoning: string
  best_offer?: {
    store_name: string
    price: number
    total_price: number
    store_url: string
    condition: string
  }
}

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } else {
        console.error('Failed to fetch recommendations')
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 text-green-800'
      case 'wait':
        return 'bg-yellow-100 text-yellow-800'
      case 'avoid':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return '✅'
      case 'wait':
        return '⏳'
      case 'avoid':
        return '❌'
      default:
        return '❓'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Price Recommendations</h1>
        <p className="text-gray-600 mb-6">
          AI-powered recommendations for LEGO set purchases based on current market prices
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No recommendations available at the moment</p>
          <p className="text-sm text-gray-500 mt-2">Try searching for specific LEGO sets</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {rec.set_number} - {rec.set_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(rec.recommendation)}`}>
                      {getRecommendationIcon(rec.recommendation)} {rec.recommendation.toUpperCase()}
                    </span>
                    <span>Confidence: {Math.round(rec.confidence_score * 100)}%</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {rec.current_best_price} PLN
                  </div>
                  <div className="text-sm text-gray-500">
                    vs {rec.average_market_price} PLN avg
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Price Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Best Price:</span>
                      <span className="font-medium">{rec.current_best_price} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Average:</span>
                      <span className="font-medium">{rec.average_market_price} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Difference:</span>
                      <span className={`font-medium ${rec.price_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rec.price_percentage > 0 ? '+' : ''}{rec.price_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-600 mb-3">{rec.reasoning}</p>
                  
                  {rec.best_offer && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-1">Best Offer</h5>
                      <div className="text-sm text-gray-600">
                        <div>{rec.best_offer.store_name}</div>
                        <div className="flex justify-between">
                          <span>Price: {rec.best_offer.price} PLN</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            rec.best_offer.condition === 'new' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rec.best_offer.condition}
                          </span>
                        </div>
                        <a
                          href={rec.best_offer.store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          View Offer
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recommendations 