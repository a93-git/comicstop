import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Login } from '../src/components/Login/Login'
import { ThemeProvider } from '../src/context/ThemeContext'
import { AuthProvider } from '../src/context/AuthContext'
import { Signup } from '../src/components/Signup/Signup'
import { ResetPassword } from '../src/components/AuthExtras/ResetPassword'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

// JSDOM can't compute CSS positions, so we assert the DOM structure and class hooks
// that guarantee the absolute centering and spacing rules we rely on in CSS modules.

describe('Password field layout structure', () => {
  const expectPasswordFieldStructure = (labelRegex, { expectsIcon = false } = {}) => {
    const input = screen.getByLabelText(labelRegex, { selector: 'input' })
    const container = input.parentElement
    expect(container).toBeTruthy()
    expect(container.className).toContain('passwordField')

    // The next sibling should be the toggle button
    const toggle = input.nextElementSibling
    expect(toggle?.tagName).toBe('BUTTON')
    expect(toggle.className).toContain('passwordToggle')

    // Accessibility wiring
    expect(toggle).toHaveAttribute('aria-controls', input.id)

    // Input should have the base input class and benefit from extra right padding via CSS
    expect(input.className).toContain('input')

    if (expectsIcon) {
      // In Signup we render a FontAwesomeIcon inside the button
      const svg = toggle.querySelector('svg')
      expect(svg).not.toBeNull()
    }
  }

  it('Login password field uses container + toggle classes and structure', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )
    expectPasswordFieldStructure(/^password$/i)
  })

  it('Signup password and confirm fields use the same structure with icon toggles', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )
    expectPasswordFieldStructure(/^password$/i, { expectsIcon: true })
    expectPasswordFieldStructure(/confirm password/i, { expectsIcon: true })
  })

  it('Reset Password fields use shared layout structure', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    )
    expectPasswordFieldStructure(/^new password$/i)
    expectPasswordFieldStructure(/^confirm new password$/i)
  })
})
