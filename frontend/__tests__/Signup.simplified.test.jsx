import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../src/components/Signup/Signup'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

jest.mock('../src/services/api', () => ({
  ...jest.requireActual('../src/services/api'),
  signup: jest.fn(),
}))

const { signup } = require('../src/services/api')

describe('Signup simplified form', () => {
  it('requires agreeing to terms before submission', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1!' } })

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(signup).not.toHaveBeenCalled()
    expect(screen.getByText(/you must agree to the terms of service and privacy policy/i)).toBeInTheDocument()
  })

  it('submits with email', async () => {
    signup.mockResolvedValueOnce({ success: true, data: { token: 't' } })

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } })
    // Email is default method
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'bob@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }))

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    // No assertion on navigation; ensure API called with expected payload
    expect(signup).toHaveBeenCalledWith({
      email: 'bob@example.com',
      username: 'bob',
      password: 'Password1!',
      termsAccepted: true,
    })
  })

  it('submits with phone', async () => {
    signup.mockResolvedValueOnce({ success: true, data: { token: 't' } })

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'carol' } })
    // Switch to phone method
    fireEvent.click(screen.getByRole('radio', { name: /sign up with phone number/i }))
    fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: '+1 (555) 200-3000' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password1!' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password1!' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }))

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(signup).toHaveBeenCalledWith({
      isd_code: expect.stringMatching(/^\+[0-9]+$/),
      phone_number: '15552003000',
      username: 'carol',
      password: 'Password1!',
      termsAccepted: true,
    })
  })
})
