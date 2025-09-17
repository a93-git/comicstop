import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../src/components/Signup/Signup'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => ({
  ...jest.requireActual('../src/services/api'),
  signup: jest.fn(),
}))

const { signup } = require('../src/services/api')

describe('Signup duplicates handling (simplified)', () => {

  it('shows server duplicate email error message', async () => {
    signup.mockRejectedValueOnce(new Error('An account with this email already exists'))

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    // Fill form
    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'johndoe' } })
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/An account with this email already exists/i)).toBeInTheDocument()
    })
  })

  it('shows server duplicate username error message', async () => {
    signup.mockRejectedValueOnce(new Error('An account with this username already exists'))

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'johndoe' } })
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/An account with this username already exists/i)).toBeInTheDocument()
    })
  })

  it('shows server duplicate phone error message', async () => {
    signup.mockRejectedValueOnce(new Error('An account with this phone number already exists'))

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/^username$/i), { target: { value: 'johndoe' } })
  fireEvent.click(screen.getByRole('radio', { name: /sign up with phone number/i }))
  fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '+1 555 001 0001' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongP@ssw0rd!' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/An account with this phone number already exists/i)).toBeInTheDocument()
    })
  })
})
