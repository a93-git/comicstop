import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../src/components/Signup/Signup'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.useFakeTimers()

jest.mock('../src/services/api', () => ({
  ...jest.requireActual('../src/services/api'),
  checkEmailAvailability: jest.fn(),
  checkUsernameAvailability: jest.fn(),
  checkPhoneAvailability: jest.fn(),
  signup: jest.fn(),
}))

const {
  checkEmailAvailability,
  checkUsernameAvailability,
  checkPhoneAvailability,
  signup,
} = require('../src/services/api')

describe('Signup background uniqueness checks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validates username on blur and disables submit when taken', async () => {
    checkUsernameAvailability.mockResolvedValueOnce(false)

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'takenuser' } })
    fireEvent.blur(screen.getByLabelText(/^username$/i))

    // advance debounce
    jest.advanceTimersByTime(250)

    await waitFor(() => {
      expect(checkUsernameAvailability).toHaveBeenCalledWith('takenuser')
      expect(screen.getByText(/username is taken/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    })
  })

  it('validates email on blur and disables submit when already in use', async () => {
    checkEmailAvailability.mockResolvedValueOnce(false)

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'used@example.com' } })
    fireEvent.blur(screen.getByLabelText(/^email$/i))

    jest.advanceTimersByTime(250)

    await waitFor(() => {
      expect(checkEmailAvailability).toHaveBeenCalledWith('used@example.com')
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    })
  })

  it('validates phone on blur (after switching) and disables submit when already in use', async () => {
    checkPhoneAvailability.mockResolvedValueOnce(false)

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('radio', { name: /sign up with phone number/i }))
    fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '+1 (555) 200-3000' } })
    fireEvent.blur(screen.getByLabelText(/^phone$/i))

    jest.advanceTimersByTime(250)

    await waitFor(() => {
      expect(checkPhoneAvailability).toHaveBeenCalledWith({ isd_code: expect.any(String), phone: '15552003000' })
      expect(screen.getByText(/phone already in use/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    })
  })

  it('shows available messages when unique and allows submit (assuming other validations pass)', async () => {
    checkUsernameAvailability.mockResolvedValueOnce(true)
    checkEmailAvailability.mockResolvedValueOnce(true)
    signup.mockResolvedValueOnce({ success: true, data: { token: 't' } })

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'newuser' } })
    fireEvent.blur(screen.getByLabelText(/^username$/i))
    jest.advanceTimersByTime(250)
    await waitFor(() => expect(checkUsernameAvailability).toHaveBeenCalledWith('newuser'))

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'new@example.com' } })
    fireEvent.blur(screen.getByLabelText(/^email$/i))
    jest.advanceTimersByTime(250)
    await waitFor(() => expect(checkEmailAvailability).toHaveBeenCalledWith('new@example.com'))

    // Fill remaining required fields
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }))

    // Button should be enabled now
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
  })
})
