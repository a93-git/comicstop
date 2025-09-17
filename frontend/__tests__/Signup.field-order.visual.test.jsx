import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Signup } from '../src/components/Signup/Signup'

jest.mock('../src/components/Navbar/Navbar', () => ({ Navbar: () => <div /> }))

describe('Signup field order', () => {
  it('places Email/Phone just below the method radio group', () => {
    const { container } = render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    const form = container.querySelector('form')
    const radiogroup = within(form).getByRole('radiogroup', { name: /signup method/i })
    const emailLabel = within(form).getByLabelText(/^email$/i)

    // Compute positions by walking form children
    const blocks = Array.from(form.querySelectorAll('[role="radiogroup"], [class*="formGroup"]'))
    const radioIndex = blocks.indexOf(radiogroup)
    const emailGroup = emailLabel.closest('[class*="formGroup"]')
    const emailIndex = blocks.indexOf(emailGroup)

    expect(emailIndex).toBe(radioIndex + 1)
  })

  it('also places Phone group right below radio when phone method selected', () => {
    const { container } = render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    )

    const form = container.querySelector('form')
    const phoneRadio = screen.getByRole('radio', { name: /sign up with phone number/i })
    phoneRadio.click()

    const radiogroup = within(form).getByRole('radiogroup', { name: /signup method/i })
    const phoneInput = within(form).getByLabelText(/^phone$/i)
    const phoneGroup = phoneInput.closest('[class*="formGroup"]')

    const blocks = Array.from(form.querySelectorAll('[role="radiogroup"], [class*="formGroup"]'))
    const radioIndex = blocks.indexOf(radiogroup)
    const phoneIndex = blocks.indexOf(phoneGroup)

    expect(phoneIndex).toBe(radioIndex + 1)
  })
})
