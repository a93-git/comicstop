import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ForgotPassword } from '../src/components/AuthExtras/ForgotPassword'
import { ResetPassword } from '../src/components/AuthExtras/ResetPassword'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => ({
  ...jest.requireActual('../src/services/api'),
  requestPasswordReset: jest.fn(),
  resetPasswordWithToken: jest.fn(),
}))

const { requestPasswordReset, resetPasswordWithToken } = require('../src/services/api')

describe('Forgot/Reset Password pages', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('submits forgot password and shows success', async () => {
    requestPasswordReset.mockResolvedValueOnce({ success: true })

    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    )

  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'john@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith('john@example.com'))
    expect(screen.getByText(/we've sent a reset link/i)).toBeInTheDocument()
  })

  it('shows error when reset passwords do not match', async () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    )

  fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'Strong123' } })
  fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'Mismatch' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(resetPasswordWithToken).not.toHaveBeenCalled()
  })

  it('resets password successfully with token', async () => {
    resetPasswordWithToken.mockResolvedValueOnce({ success: true })

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    )

  fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'Strong123' } })
  fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'Strong123' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => expect(resetPasswordWithToken).toHaveBeenCalledWith('abc123', 'Strong123'))
    expect(screen.getByText(/password updated/i)).toBeInTheDocument()
  })
})
