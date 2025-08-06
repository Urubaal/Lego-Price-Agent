// React import not needed in modern React with JSX transform
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';

// Mock the API call
const mockOnLogin = jest.fn();
const mockOnSwitchToRegister = jest.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    expect(screen.getByText('Login to LEGO Price Agent')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpassword');
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls onLogin with form data on successful submission', async () => {
    // Mock successful API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'test-token' }),
      })
    ) as jest.Mock;

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test-token');
    });
  });

  it('shows error message on login failure', async () => {
    // Mock failed API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Invalid credentials' }),
      })
    ) as jest.Mock;

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows loading state during form submission', async () => {
    // Mock slow API response
    global.fetch = jest.fn(() =>
      new Promise(resolve =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ access_token: 'test-token' }),
          }),
          100
        )
      )
    ) as jest.Mock;

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    // Check loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test-token');
    });
  });

  it('calls onSwitchToRegister when register link is clicked', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const registerLink = screen.getByText(/sign up/i);
    fireEvent.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('handles network errors gracefully', async () => {
    // Mock network error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('clears error message when user starts typing', async () => {
    // Mock failed API response first
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Invalid credentials' }),
      })
    ) as jest.Mock;

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  it('prevents form submission when fields are empty', () => {
    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('handles form submission with Enter key', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'test-token' }),
      })
    ) as jest.Mock;

    render(
      <LoginForm 
        onLogin={mockOnLogin} 
        onSwitchToRegister={mockOnSwitchToRegister} 
      />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    
    // Submit form with Enter key
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test-token');
    });
  });
}); 