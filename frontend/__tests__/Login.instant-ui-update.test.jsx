import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

// Mock API login to resolve with token and user
jest.mock('../src/services/api', () => {
  const original = jest.requireActual('../src/services/api')
  return {
    ...original,
    login: jest.fn().mockResolvedValue({ token: 'tok', user: { id: 123, username: 'Bob', email: 'bob@example.com' } }),
  }
})

// Simplify Navbar rendering side-effects if needed
// We use the real Navbar to verify UI changes

describe('Instant UI update after login', () => {
  it('replaces Login button with username immediately after successful login', async () => {
    // Navigate to /login by setting the initial URL before rendering the app router
    const original = window.location
    delete window.location
    // @ts-ignore
    window.location = new URL('http://localhost/login')
    render(<App />)

    // Ensure Login button is present initially
    expect(screen.getAllByRole('button', { name: /login/i })[0]).toBeInTheDocument()

    // Fill in and submit the form
    fireEvent.change(screen.getByLabelText(/email, username, or phone/i), { target: { value: 'bob@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // After navigating to dashboard, Navbar should show username without a page reload
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    // And Login button should no longer be visible in the Navbar actions
    expect(screen.queryByRole('button', { name: /login/i })).toBeNull()

    // Restore window.location
    window.location = original
  })
})
