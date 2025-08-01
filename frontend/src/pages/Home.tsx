import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          LEGO Price Agent
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track, analyze, and get recommendations for LEGO set prices across multiple marketplaces
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/search"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search LEGO Sets
          </Link>
          <Link
            to="/recommendations"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Recommendations
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Tracking</h3>
          <p className="text-gray-600">
            Monitor LEGO set prices across Allegro, OLX, and Ceneo in real-time
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Recommendations</h3>
          <p className="text-gray-600">
            Get AI-powered recommendations on when to buy, wait, or avoid
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Analysis</h3>
          <p className="text-gray-600">
            Analyze price trends and market insights for informed decisions
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular LEGO Sets</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { number: '42100', name: 'Liebherr R 9800', price: '2,499 PLN' },
            { number: '42115', name: 'Lamborghini Sián FKP 37', price: '1,299 PLN' },
            { number: '42131', name: 'App-Controlled D11 Bulldozer', price: '899 PLN' },
            { number: '42145', name: 'Airbus H175 Rescue Helicopter', price: '699 PLN' },
            { number: '42154', name: '2022 Ford GT', price: '599 PLN' },
          ].map((set) => (
            <div key={set.number} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900">{set.number}</h3>
              <p className="text-gray-600 text-sm mb-2">{set.name}</p>
              <p className="text-green-600 font-medium">{set.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home 