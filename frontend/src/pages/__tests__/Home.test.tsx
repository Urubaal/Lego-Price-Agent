import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../Home'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Home', () => {
  test('renders main heading', () => {
    renderWithRouter(<Home />)
    expect(screen.getByText('LEGO Price Agent')).toBeInTheDocument()
  })

  test('renders description text', () => {
    renderWithRouter(<Home />)
    expect(screen.getByText(/Track, analyze, and get recommendations/)).toBeInTheDocument()
  })

  test('renders action buttons', () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByText('Search LEGO Sets')).toBeInTheDocument()
    expect(screen.getByText('View Recommendations')).toBeInTheDocument()
  })

  test('renders feature cards', () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByText('Price Tracking')).toBeInTheDocument()
    expect(screen.getByText('Smart Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Market Analysis')).toBeInTheDocument()
  })

  test('renders popular LEGO sets section', () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByText('Popular LEGO Sets')).toBeInTheDocument()
    
    // Check for specific LEGO sets
    expect(screen.getByText('42100')).toBeInTheDocument()
    expect(screen.getByText('42115')).toBeInTheDocument()
    expect(screen.getByText('42131')).toBeInTheDocument()
    expect(screen.getByText('42145')).toBeInTheDocument()
    expect(screen.getByText('42154')).toBeInTheDocument()
  })

  test('displays LEGO set names', () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByText('Liebherr R 9800')).toBeInTheDocument()
    expect(screen.getByText('Lamborghini Sián FKP 37')).toBeInTheDocument()
    expect(screen.getByText('App-Controlled D11 Bulldozer')).toBeInTheDocument()
    expect(screen.getByText('Airbus H175 Rescue Helicopter')).toBeInTheDocument()
    expect(screen.getByText('2022 Ford GT')).toBeInTheDocument()
  })

  test('displays prices', () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByText('2,499 PLN')).toBeInTheDocument()
    expect(screen.getByText('1,299 PLN')).toBeInTheDocument()
    expect(screen.getByText('899 PLN')).toBeInTheDocument()
    expect(screen.getByText('699 PLN')).toBeInTheDocument()
    expect(screen.getByText('599 PLN')).toBeInTheDocument()
  })
}) 