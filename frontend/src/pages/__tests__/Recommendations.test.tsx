import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Recommendations from '../Recommendations'

// Mock fetch
global.fetch = jest.fn()

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Recommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders recommendations page title', () => {
    renderWithRouter(<Recommendations />)
    expect(screen.getByText('Price Recommendations')).toBeInTheDocument()
  })

  test('renders recommendations description', () => {
    renderWithRouter(<Recommendations />)
    expect(screen.getByText(/AI-powered recommendations for LEGO set purchases/)).toBeInTheDocument()
  })

  test('shows loading state initially', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithRouter(<Recommendations />)
    
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument()
  })

  test('displays recommendations when data is loaded', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: [
          {
            set_number: '42100',
            set_name: 'Liebherr R 9800',
            current_best_price: 2400,
            average_market_price: 2500,
            price_percentage: 4.0,
            recommendation: 'buy',
            confidence_score: 0.85,
            reasoning: 'Good deal! 4.0% below market average',
            best_offer: {
              store_name: 'Allegro',
              price: 2400,
              total_price: 2400,
              store_url: 'https://allegro.pl/item/1',
              condition: 'new'
            }
          }
        ]
      })
    } as Response)

    renderWithRouter(<Recommendations />)
    
    await waitFor(() => {
      expect(screen.getByText('42100 - Liebherr R 9800')).toBeInTheDocument()
      expect(screen.getByText('2400 PLN')).toBeInTheDocument()
      expect(screen.getByText('vs 2500 PLN avg')).toBeInTheDocument()
      expect(screen.getByText('BUY')).toBeInTheDocument()
      expect(screen.getByText('Confidence: 85%')).toBeInTheDocument()
    })
  })

  test('displays no recommendations message when empty', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ recommendations: [] })
    } as Response)

    renderWithRouter(<Recommendations />)
    
    await waitFor(() => {
      expect(screen.getByText('No recommendations available at the moment')).toBeInTheDocument()
      expect(screen.getByText('Try searching for specific LEGO sets')).toBeInTheDocument()
    })
  })

  test('handles API error gracefully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    renderWithRouter(<Recommendations />)
    
    await waitFor(() => {
      expect(screen.getByText('No recommendations available at the moment')).toBeInTheDocument()
    })
  })

  test('displays different recommendation types correctly', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: [
          {
            set_number: '42100',
            set_name: 'Liebherr R 9800',
            current_best_price: 2400,
            average_market_price: 2500,
            price_percentage: 4.0,
            recommendation: 'buy',
            confidence_score: 0.85,
            reasoning: 'Good deal! 4.0% below market average',
            best_offer: {
              store_name: 'Allegro',
              price: 2400,
              total_price: 2400,
              store_url: 'https://allegro.pl/item/1',
              condition: 'new'
            }
          },
          {
            set_number: '42115',
            set_name: 'Lamborghini Sián FKP 37',
            current_best_price: 1300,
            average_market_price: 1250,
            price_percentage: -4.0,
            recommendation: 'wait',
            confidence_score: 0.75,
            reasoning: 'Average price. Consider waiting for better deals',
            best_offer: {
              store_name: 'OLX',
              price: 1300,
              total_price: 1300,
              store_url: 'https://olx.pl/item/2',
              condition: 'new'
            }
          },
          {
            set_number: '42131',
            set_name: 'App-Controlled D11 Bulldozer',
            current_best_price: 950,
            average_market_price: 850,
            price_percentage: -11.8,
            recommendation: 'avoid',
            confidence_score: 0.90,
            reasoning: 'Price is 11.8% above market average',
            best_offer: {
              store_name: 'Ceneo',
              price: 950,
              total_price: 950,
              store_url: 'https://ceneo.pl/item/3',
              condition: 'new'
            }
          }
        ]
      })
    } as Response)

    renderWithRouter(<Recommendations />)
    
    await waitFor(() => {
      // Check for all three recommendations
      expect(screen.getByText('42100 - Liebherr R 9800')).toBeInTheDocument()
      expect(screen.getByText('42115 - Lamborghini Sián FKP 37')).toBeInTheDocument()
      expect(screen.getByText('42131 - App-Controlled D11 Bulldozer')).toBeInTheDocument()
      
      // Check for recommendation types
      expect(screen.getByText('BUY')).toBeInTheDocument()
      expect(screen.getByText('WAIT')).toBeInTheDocument()
      expect(screen.getByText('AVOID')).toBeInTheDocument()
      
      // Check for prices
      expect(screen.getByText('2400 PLN')).toBeInTheDocument()
      expect(screen.getByText('1300 PLN')).toBeInTheDocument()
      expect(screen.getByText('950 PLN')).toBeInTheDocument()
    })
  })

  test('displays price analysis correctly', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: [
          {
            set_number: '42100',
            set_name: 'Liebherr R 9800',
            current_best_price: 2400,
            average_market_price: 2500,
            price_percentage: 4.0,
            recommendation: 'buy',
            confidence_score: 0.85,
            reasoning: 'Good deal! 4.0% below market average',
            best_offer: {
              store_name: 'Allegro',
              price: 2400,
              total_price: 2400,
              store_url: 'https://allegro.pl/item/1',
              condition: 'new'
            }
          }
        ]
      })
    } as Response)

    renderWithRouter(<Recommendations />)
    
    await waitFor(() => {
      expect(screen.getByText('Price Analysis')).toBeInTheDocument()
      expect(screen.getByText('Current Best Price:')).toBeInTheDocument()
      expect(screen.getByText('Market Average:')).toBeInTheDocument()
      expect(screen.getByText('Price Difference:')).toBeInTheDocument()
      
      expect(screen.getByText('2400 PLN')).toBeInTheDocument()
      expect(screen.getByText('2500 PLN')).toBeInTheDocument()
      expect(screen.getByText('+4.0%')).toBeInTheDocument()
    })
  })

  test('displays best offer information', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: [
          {
            set_number: '42100',
            set_name: 'Liebherr R 9800',
            current_best_price: 2400,
            average_market_price: 2500,
            price_percentage: 4.0,
            recommendation: 'buy',
            confidence_score: 0.85,
            reasoning: 'Good deal! 4.0% below market average',
            best_offer: {
              store_name: 'Allegro',
              price: 2400,
              total_price: 2400,
              store_url: 'https://allegro.pl/item/1',
              condition: 'new'
            }
          }
        ]
      })
    } as Response)

    renderWithRouter(<Recommendations />)
    
    await waitFor(() => {
      expect(screen.getByText('Best Offer')).toBeInTheDocument()
      expect(screen.getByText('Allegro')).toBeInTheDocument()
      expect(screen.getByText('Price: 2400 PLN')).toBeInTheDocument()
      expect(screen.getByText('new')).toBeInTheDocument()
      expect(screen.getByText('View Offer')).toBeInTheDocument()
    })
  })
}) 