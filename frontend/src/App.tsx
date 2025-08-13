import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import Recommendations from './pages/Recommendations'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import VSCodeLayout from './components/VSCodeLayout'
import ErrorBoundary from './components/ErrorBoundary'
import DebugPanel from './components/DebugPanel'
import './App.css'

function AppContent() {
  const { user, login, isLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(true)
  const [currentPage, setCurrentPage] = useState('Home')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {showLogin ? (
            <LoginForm 
              onLogin={login} 
              onSwitchToRegister={() => setShowLogin(false)} 
            />
          ) : (
            <RegisterForm 
              onRegister={login} 
              onSwitchToLogin={() => setShowLogin(true)} 
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <VSCodeLayout currentPage={currentPage}>
        <div className="space-y-6">
          {/* Debug Panel */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Debug Tools</h2>
            <DebugPanel />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <Routes>
              <Route 
                path="/" 
                element={
                  <div onMouseEnter={() => setCurrentPage('Home')}>
                    <Home />
                  </div>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <div onMouseEnter={() => setCurrentPage('Search')}>
                    <Search />
                  </div>
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <div onMouseEnter={() => setCurrentPage('Recommendations')}>
                    <Recommendations />
                  </div>
                } 
              />
            </Routes>
          </div>
        </div>
      </VSCodeLayout>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App 