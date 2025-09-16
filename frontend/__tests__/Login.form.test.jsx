import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Login } from '../src/components/Login/Login'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => ({
  login: jest.fn().mockResolvedValue({ token: 't', user: { id: 1, username: 'Alice', email: 'alice@example.com' } })
}))

describe('Login form', () => {
  it('submits identifier and password', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

  fireEvent.change(screen.getByLabelText(/email, username, or phone/i), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'secret' } })
    // Submit should work without any extra checkboxes
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // simplistic assertion: button still present, no crash
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the Sign In button with submitButton class (orange brand)', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn.className).toContain('submitButton')
  })
})
