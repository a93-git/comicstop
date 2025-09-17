import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../src/components/Signup/Signup'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

describe('Signup method selection UI', () => {
  it('renders radio group and toggles fields', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    // Radio buttons
    const emailRadio = screen.getByRole('radio', { name: /sign up with email/i })
    const phoneRadio = screen.getByRole('radio', { name: /sign up with phone number/i })
    expect(emailRadio).toBeChecked()
    expect(phoneRadio).not.toBeChecked()

    // Email field visible by default
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^phone$/i)).toBeNull()

    // Toggle to phone
    fireEvent.click(phoneRadio)
    expect(phoneRadio).toBeChecked()
    expect(emailRadio).not.toBeChecked()

    // Phone + ISD visible
    expect(screen.getByLabelText(/^phone$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/isd code/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/^email$/i)).toBeNull()
  })
})
