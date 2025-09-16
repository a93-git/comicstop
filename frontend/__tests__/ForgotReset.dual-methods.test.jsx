import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ForgotPassword } from '../src/components/AuthExtras/ForgotPassword'
import { ResetPassword } from '../src/components/AuthExtras/ResetPassword'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => ({
  ...jest.requireActual('../src/services/api'),
  requestPasswordReset: jest.fn(),
  requestPasswordResetByPhone: jest.fn(),
  resetPasswordWithToken: jest.fn(),
  resetPasswordWithPin: jest.fn(),
}))

const { requestPasswordReset, requestPasswordResetByPhone, resetPasswordWithPin } = require('../src/services/api')

describe('Forgot/Reset Password dual methods', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('allows choosing email or phone on Forgot Password', async () => {
    requestPasswordReset.mockResolvedValueOnce({ success: true })
    requestPasswordResetByPhone.mockResolvedValueOnce({ success: true })

    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    )

  // Default email
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'john@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith('john@example.com'))

    // Switch to phone
  fireEvent.click(screen.getByRole('radio', { name: /phone pin/i }))
  fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '+1 555 123 4567' } })
    fireEvent.click(screen.getByRole('button', { name: /send pin/i }))
    await waitFor(() => expect(requestPasswordResetByPhone).toHaveBeenCalledWith('+1 555 123 4567'))
  })

  it('submits reset with PIN on Reset page', async () => {
    resetPasswordWithPin.mockResolvedValueOnce({ success: true })

    render(
      <MemoryRouter initialEntries={["/reset-password?via=phone"]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '+1 555 123 4567' } })
    fireEvent.change(screen.getByLabelText(/pin code/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'Strong123' } })
    fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'Strong123' } })
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => expect(resetPasswordWithPin).toHaveBeenCalledWith('+1 555 123 4567', '123456', 'Strong123'))
  })
})
