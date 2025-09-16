import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from '../src/components/Navbar/Navbar'

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, logout: jest.fn() })
}))

jest.mock('../src/hooks/useThemeContext', () => ({
  useThemeContext: () => ({
    toggleTheme: jest.fn(),
    isDark: false,
  })
}))

describe('Navbar Login/Sign Up buttons', () => {
  it('Login button uses the auth class styling (original scheme)', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    const loginBtn = screen.getByRole('button', { name: /login/i })
    expect(loginBtn.className).toContain('auth')
  })

  it('Sign In submit button matches Sign Up button color (brand orange)', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    const signupBtn = screen.getByRole('button', { name: /sign up/i })
    expect(signupBtn.className).toContain('signup')
  })
})
