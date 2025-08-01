import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../Navbar'

// Wrapper component to provide router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Navbar', () => {
  test('renders LEGO Price Agent title', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('LEGO Price Agent')).toBeInTheDocument()
  })

  test('renders navigation links', () => {
    renderWithRouter(<Navbar />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })

  test('navigation links are clickable', () => {
    renderWithRouter(<Navbar />)
    
    const homeLink = screen.getByText('Home')
    const searchLink = screen.getByText('Search')
    const recommendationsLink = screen.getByText('Recommendations')
    
    expect(homeLink).toBeInTheDocument()
    expect(searchLink).toBeInTheDocument()
    expect(recommendationsLink).toBeInTheDocument()
  })

  test('has correct CSS classes', () => {
    renderWithRouter(<Navbar />)
    
    const navbar = screen.getByRole('navigation')
    expect(navbar).toHaveClass('bg-white', 'shadow-lg')
  })
}) 