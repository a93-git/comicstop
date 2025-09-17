import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/context/ThemeContext'
import { AuthProvider } from '../src/context/AuthContext'
import { Login } from '../src/components/Login/Login'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => {
  const original = jest.requireActual('../src/services/api')
  return {
    ...original,
    login: jest.fn().mockRejectedValue(Object.assign(new Error('Too many requests, please try again later.'), { status: 429 })),
  }
})

describe('Login rate limit UI', () => {
  it('shows an error when rate limited', async () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

  fireEvent.change(screen.getByLabelText(/email, username, or phone/i), { target: { value: 'alice@example.com' } })
  fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    const err = await screen.findByText(/too many requests/i)
    expect(err).toBeInTheDocument()
  })
})
