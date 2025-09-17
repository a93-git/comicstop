import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ForgotPassword } from '../src/components/AuthExtras/ForgotPassword'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

describe('Forgot Password email input layout', () => {
  it('email input uses input class and is constrained to container', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )

    const title = screen.getByRole('heading', { name: /forgot password/i })
    expect(title.className).toContain('title')

    // Default method is email
    const emailInput = screen.getByLabelText(/^email$/i, { selector: 'input' })
    expect(emailInput.className).toContain('input')

    // JSDOM can't compute layout widths; we assert structural constraints instead
    // Ensure it's within a form wrapper container
    const form = emailInput.closest('form')
    expect(form).not.toBeNull()

    // Ensure the wrapper container uses the shared class that limits max width in CSS
    const wrapper = form.parentElement
    expect(wrapper.className).toContain('formWrapper')
  })
})
