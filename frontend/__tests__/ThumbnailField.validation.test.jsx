import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ThumbnailField from '../src/components/ThumbnailField/ThumbnailField'

describe('ThumbnailField URL validation and remove', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, headers: new Map([['content-type', 'image/jpeg']]), type: 'basic' })
  })

  it('shows error for invalid URL and clears on remove', async () => {
    const onChange = jest.fn()
    render(<ThumbnailField value={{ mode: 'url', url: '' }} onChange={onChange} />)
    const input = screen.getByPlaceholderText('https://example.com/cover.jpg')
    fireEvent.change(input, { target: { value: 'not-a-url' } })
    fireEvent.blur(input)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('valid URL'))

    // set a good url
    fireEvent.change(input, { target: { value: 'https://example.com/img.jpg' } })
    fireEvent.blur(input)
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())

    // Remove action clears
    const btn = screen.getByRole('button', { name: /remove thumbnail/i })
    fireEvent.click(btn)
    expect(onChange).toHaveBeenLastCalledWith({ mode: 'url', url: '', file: null, previewUrl: '' })
  })
})
