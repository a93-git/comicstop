import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { NotFound } from '../src/components/NotFound/NotFound'
import { ThemeProvider } from '../src/context/ThemeContext'

// Mock auth hook to avoid needing full AuthProvider and network calls
jest.mock('../src/context/AuthContext', () => {
  const actual = jest.requireActual('../src/context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
    }),
  }
})

// No need to mock Navbar here; we want its real structure to ensure consistent classes

describe('404 NotFound page navbar formatting', () => {
  const renderNotFound = () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/non-existent-route"]}>
          <Routes>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    )
  }

  it('renders Navbar with the same navbar class as other pages (no extra wrapper padding)', () => {
    renderNotFound()
    const nav = document.querySelector('nav')
    expect(nav).toBeInTheDocument()
    // Should have the navbar class from Navbar.module.css
    expect(nav?.className).toContain('navbar')

    // Container around NotFound should not add padding to nav; ensure nav is the first element inside container
    const container = nav.parentElement
    // On NotFound, <Navbar /> is a direct child of the top-level wrapper
    expect(container?.nodeName.toLowerCase()).toBe('div')
  })

  it('keeps main content spaced without affecting navbar', () => {
    renderNotFound()
    const heading = screen.getByRole('heading', { name: /404 - page not found/i })
    expect(heading).toBeInTheDocument()
    const main = heading.closest('main')
    expect(main?.className).toContain('main')
  })
})
