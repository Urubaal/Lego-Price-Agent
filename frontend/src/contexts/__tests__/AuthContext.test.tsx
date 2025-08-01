import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access context
const TestComponent = () => {
  const { user, token, login, logout, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? user.username : 'no-user'}</div>
      <div data-testid="token">{token || 'no-token'}</div>
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides initial state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  it('loads user from stored token on mount', async () => {
    // Mock stored token
    localStorageMock.getItem.mockReturnValue('stored-token');
    
    // Mock successful API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true
        }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
  });

  it('handles invalid stored token', async () => {
    // Mock stored token
    localStorageMock.getItem.mockReturnValue('invalid-token');
    
    // Mock failed API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Invalid token' }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('handles network error when validating token', async () => {
    // Mock stored token
    localStorageMock.getItem.mockReturnValue('stored-token');
    
    // Mock network error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('handles login function', async () => {
    // Mock successful API response for user profile
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          username: 'newuser',
          email: 'new@example.com',
          is_active: true
        }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('newuser');
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
  });

  it('handles logout function', async () => {
    // Mock stored token
    localStorageMock.getItem.mockReturnValue('stored-token');
    
    // Mock successful API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true
        }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('handles login with network error', async () => {
    // Mock network error for user profile fetch
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });

    // Should still store the token even if profile fetch fails
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
  });

  it('handles login with API error', async () => {
    // Mock API error for user profile fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Server error' }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });

    // Should still store the token even if profile fetch fails
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
  });

  it('handles inactive user', async () => {
    // Mock stored token
    localStorageMock.getItem.mockReturnValue('stored-token');
    
    // Mock API response with inactive user
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: false
        }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('handles missing token in localStorage', () => {
    // Mock no stored token
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  it('handles empty token in localStorage', () => {
    // Mock empty stored token
    localStorageMock.getItem.mockReturnValue('');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');
  });

  it('handles multiple login/logout cycles', async () => {
    // Mock successful API responses
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true
        }),
      })
    ) as jest.Mock;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    const logoutButton = screen.getByText('Logout');

    // Login
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    });

    // Logout
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('token')).toHaveTextContent('no-token');

    // Login again
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    });
  });
}); 