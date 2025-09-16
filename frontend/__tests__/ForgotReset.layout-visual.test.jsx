import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ForgotPassword } from '../src/components/AuthExtras/ForgotPassword'
import { ResetPassword } from '../src/components/AuthExtras/ResetPassword'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

describe('Forgot/Reset layout visual checks', () => {
  it('Forgot Password uses shared layout classes', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )

    const title = screen.getByRole('heading', { name: /forgot password/i })
  const email = screen.getByLabelText(/^email$/i, { selector: 'input' })
    const submit = screen.getByRole('button', { name: /send reset link/i })

    expect(title.className).toContain('title')
    expect(email.className).toContain('input')
    expect(submit.className).toContain('submitButton')
  })

  it('Reset Password uses shared layout classes and password toggle styles', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    )

    const title = screen.getByRole('heading', { name: /reset password/i })
    const newPw = screen.getByLabelText(/^new password$/i, { selector: 'input' })
    const confirmPw = screen.getByLabelText(/^confirm new password$/i, { selector: 'input' })
    const submit = screen.getByRole('button', { name: /reset password/i })

    expect(title.className).toContain('title')
    expect(newPw.className).toContain('input')
    expect(confirmPw.className).toContain('input')
    expect(submit.className).toContain('submitButton')

    // Toggle buttons should use the shared passwordToggle style
    const toggles = screen.getAllByRole('button', { name: /show password|show/i })
    toggles.forEach(btn => {
      expect(btn.className).toContain('passwordToggle')
    })
  })
})
