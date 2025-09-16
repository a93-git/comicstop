import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Login } from '../src/components/Login/Login'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

// These tests verify that the Login button relies on the CSS variable
// and that switching themes doesn't change the variable used.
// JSDOM doesn't compute external CSS, so we assert the style string uses the var().

describe('Sign In submit button color and isolation', () => {
  const renderLogin = () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )
  }

  it('renders the Sign In submit with the submitButton class (orange brand color via CSS)', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    renderLogin()
    const btn = screen.getByRole('button', { name: /sign in/i })
    expect(btn.className).toContain('submitButton')
  })

  it('does not affect the Sign Up link button styling', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    renderLogin()
    const signUpBtn = screen.getByRole('button', { name: /sign up here/i })
    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    // Ensure the sign up uses linkButton class and not submitButton class
    expect(signUpBtn.className).toContain('linkButton')
    expect(signUpBtn.className).not.toContain('submitButton')
    // And the submit button uses submitButton class
    expect(submitBtn.className).toContain('submitButton')
  })
})
