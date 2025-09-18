import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ContributorsField } from '../src/components/ContributorsField'

import React, { useState } from 'react'

function Harness() {
  const [value, setValue] = useState([])
  return <ContributorsField value={value} onChange={setValue} />
}

test('ContributorsField add/remove and add names', () => {
  render(<Harness />)

  // add a row
  fireEvent.click(screen.getByText('+ Add Contributor'))

  // select a role
  const roleSelect = screen.getByDisplayValue('— Role —')
  fireEvent.change(roleSelect, { target: { value: 'Writer' } })
  expect(screen.getByDisplayValue('Writer')).toBeInTheDocument()

  // type a name and press Enter
  const input = screen.getByPlaceholderText('Type a name and press Enter')
  fireEvent.change(input, { target: { value: 'Alice' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
  expect(screen.getByText('Alice')).toBeInTheDocument()

  // remove row
  fireEvent.click(screen.getByText('Remove'))
  expect(screen.queryByDisplayValue('— Role —')).not.toBeInTheDocument()
})
