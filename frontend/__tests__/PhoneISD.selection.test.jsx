import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Signup } from '../src/components/Signup/Signup'
import { ForgotPassword } from '../src/components/AuthExtras/ForgotPassword'
import { ResetPassword } from '../src/components/AuthExtras/ResetPassword'
import { ThemeProvider } from '../src/context/ThemeContext'

// Mock Navbar to avoid needing AuthProvider/ThemeProvider wiring in this test
jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => ({
  signup: jest.fn(),
  requestPasswordReset: jest.fn(),
  requestPasswordResetByPhone: jest.fn(),
  resetPasswordWithPin: jest.fn(),
  resetPasswordWithToken: jest.fn(),
}))

const { signup, requestPasswordResetByPhone, resetPasswordWithPin } = require('../src/services/api')

describe('ISD code selection and formatting', () => {
  it('prepends ISD code on Signup when phone has no +', async () => {
    signup.mockResolvedValueOnce({ success: true })
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/signup"]}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    )
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'isduser' } })
  // Switch to phone method
  fireEvent.click(screen.getByRole('radio', { name: /sign up with phone number/i }))
  // Select a distinct ISD, e.g. +44
  const isdSelect = screen.getByLabelText(/isd code/i)
    fireEvent.change(isdSelect, { target: { value: '+44' } })
  fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '7700 900123' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongP@ss1' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongP@ss1' } })
    fireEvent.click(screen.getByLabelText(/i agree to the/i))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(signup).toHaveBeenCalled()
      const call = signup.mock.calls[0][0]
      expect(call).toMatchObject({ isd_code: '+44', phone_number: '7700900123' })
    })
  })

  it('uses ISD in Forgot/Reset phone flows', async () => {
    requestPasswordResetByPhone.mockResolvedValueOnce({ success: true })
    resetPasswordWithPin.mockResolvedValueOnce({ success: true })
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/forgot-password"]}>
          <Routes>
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    )
    // Switch to Phone PIN
    fireEvent.click(screen.getByRole('radio', { name: /phone pin/i }))
    // pick +91 and type local
    const isdSelect = screen.getByLabelText(/isd code/i)
    fireEvent.change(isdSelect, { target: { value: '+91' } })
    fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '98765 43210' } })
    fireEvent.click(screen.getByRole('button', { name: /send pin/i }))
    await waitFor(() => expect(requestPasswordResetByPhone).toHaveBeenCalledWith(expect.stringMatching(/^\+91\s*98765 43210$/)))

    // Now test Reset page with via=phone
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/reset-password?via=phone"]}>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    )
    const reset = within(container)
    const isdSelect2 = reset.getByLabelText(/isd code/i)
    fireEvent.change(isdSelect2, { target: { value: '+61' } })
  fireEvent.change(reset.getByPlaceholderText('555 123 4567'), { target: { value: '0412 345 678' } })
    fireEvent.change(reset.getByLabelText(/pin code/i), { target: { value: '123456' } })
  fireEvent.change(reset.getByLabelText(/^new password$/i), { target: { value: 'StrongP@ss1' } })
  fireEvent.change(reset.getByLabelText(/^confirm new password$/i), { target: { value: 'StrongP@ss1' } })
    fireEvent.click(reset.getByRole('button', { name: /reset password/i }))
    await waitFor(() => expect(resetPasswordWithPin).toHaveBeenCalledWith(expect.stringMatching(/^\+61\s*0412 345 678$/), '123456', 'StrongP@ss1'))
  })
})
