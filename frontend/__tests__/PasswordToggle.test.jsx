import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Login } from '../src/components/Login/Login'
import { ThemeProvider } from '../src/context/ThemeContext'
import { AuthProvider } from '../src/context/AuthContext'
import { Signup } from '../src/components/Signup/Signup'
import { ResetPassword } from '../src/components/AuthExtras/ResetPassword'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

describe('Password visibility toggle', () => {
  it('toggles password visibility on Login page', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )
  const input = screen.getByLabelText(/password/i, { selector: 'input' })
  const toggle = screen.getByRole('button', { name: /show password|show/i })
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles both password fields on Signup page', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )
    const pw = screen.getByLabelText(/^password$/i, { selector: 'input' })
    const toggles = screen.getAllByRole('button', { name: /show password|show/i })
    const pwToggle = toggles[0]
    expect(pw).toHaveAttribute('type', 'password')
    fireEvent.click(pwToggle)
    expect(pw).toHaveAttribute('type', 'text')

    const cpw = screen.getByLabelText(/confirm password/i, { selector: 'input' })
    const cpwToggle = toggles[1]
    expect(cpw).toHaveAttribute('type', 'password')
    fireEvent.click(cpwToggle)
    expect(cpw).toHaveAttribute('type', 'text')
  })

  it('toggles both fields on Reset Password page', () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=xyz"]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    )

    const newPw = screen.getByLabelText(/^new password$/i, { selector: 'input' })
    const toggles = screen.getAllByRole('button', { name: /show password|show/i })
    const newPwToggle = toggles[0]
    expect(newPw).toHaveAttribute('type', 'password')
    fireEvent.click(newPwToggle)
    expect(newPw).toHaveAttribute('type', 'text')

    const confirm = screen.getByLabelText(/^confirm new password$/i, { selector: 'input' })
    const confirmToggle = toggles[1]
    expect(confirm).toHaveAttribute('type', 'password')
    fireEvent.click(confirmToggle)
    expect(confirm).toHaveAttribute('type', 'text')
  })
})
