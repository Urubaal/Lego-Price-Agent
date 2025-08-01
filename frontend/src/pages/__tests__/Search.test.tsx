import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Search from '../Search'

// Mock fetch
global.fetch = jest.fn()

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Search', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders search page title', () => {
    renderWithRouter(<Search />)
    expect(screen.getByText('Search LEGO Sets')).toBeInTheDocument()
  })

  test('renders search description', () => {
    renderWithRouter(<Search />)
    expect(screen.getByText(/Search for LEGO sets across multiple marketplaces/)).toBeInTheDocument()
  })

  test('renders search input and button', () => {
    renderWithRouter(<Search />)
    
    expect(screen.getByPlaceholderText(/Enter LEGO set name or number/)).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  test('search input accepts text', () => {
    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    fireEvent.change(searchInput, { target: { value: '42100' } })
    
    expect(searchInput).toHaveValue('42100')
  })

  test('search button is disabled when input is empty', () => {
    renderWithRouter(<Search />)
    
    const searchButton = screen.getByText('Search')
    expect(searchButton).toBeDisabled()
  })

  test('search button is enabled when input has text', () => {
    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: '42100' } })
    
    expect(searchButton).not.toBeDisabled()
  })

  test('performs search when button is clicked', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sets: [
          {
            set_number: '42100',
            name: 'Liebherr R 9800',
            price: 2400,
            shipping_cost: 0,
            total_price: 2400,
            store_name: 'Allegro',
            store_url: 'https://allegro.pl/item/1',
            condition: 'new',
            availability: true,
            last_updated: '2023-01-01T00:00:00'
          }
        ]
      })
    } as Response)

    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: '42100' } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/search?query=42100'
      )
    })
  })

  test('performs search when Enter key is pressed', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sets: [] })
    } as Response)

    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    
    fireEvent.change(searchInput, { target: { value: '42100' } })
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/search?query=42100'
      )
    })
  })

  test('displays loading state during search', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: '42100' } })
    fireEvent.click(searchButton)
    
    expect(screen.getByText('Searching...')).toBeInTheDocument()
    expect(screen.getByText(/Searching for LEGO sets/)).toBeInTheDocument()
  })

  test('displays search results', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sets: [
          {
            set_number: '42100',
            name: 'Liebherr R 9800',
            price: 2400,
            shipping_cost: 0,
            total_price: 2400,
            store_name: 'Allegro',
            store_url: 'https://allegro.pl/item/1',
            condition: 'new',
            availability: true,
            last_updated: '2023-01-01T00:00:00'
          }
        ]
      })
    } as Response)

    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: '42100' } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText('Found 1 results for "42100"')).toBeInTheDocument()
      expect(screen.getByText('42100 - Liebherr R 9800')).toBeInTheDocument()
      expect(screen.getByText('Allegro')).toBeInTheDocument()
      expect(screen.getByText('2400 PLN')).toBeInTheDocument()
      expect(screen.getByText('0 PLN')).toBeInTheDocument()
      expect(screen.getByText('2400 PLN')).toBeInTheDocument()
    })
  })

  test('displays no results message', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sets: [] })
    } as Response)

    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument()
      expect(screen.getByText('Try a different search term')).toBeInTheDocument()
    })
  })

  test('handles search error', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    renderWithRouter(<Search />)
    
    const searchInput = screen.getByPlaceholderText(/Enter LEGO set name or number/)
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: '42100' } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText('No results found for "42100"')).toBeInTheDocument()
    })
  })
}) 