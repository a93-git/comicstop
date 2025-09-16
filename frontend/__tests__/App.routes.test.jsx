import { render, screen } from '@testing-library/react'
import App from '../src/App'

jest.mock('../src/context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
}))

jest.mock('../src/hooks/useThemeContext', () => ({
  useThemeContext: () => ({ toggleTheme: jest.fn(), isDark: false })
}))

jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ isAuthenticated: false, user: null }),
}))

// Mock data fetches used by Home to avoid network warnings and speed up test
jest.mock('../src/services/api', () => ({
  fetchSections: jest.fn(async () => [
    { id: 'featured', name: 'Featured Comics', description: 'Hand-picked comics for you' },
  ]),
  fetchSectionComics: jest.fn(async () => [
    { id: 1, title: 'Sample Comic', author: 'Author', rating: 4.5, pageCount: 10, imageUrl: '/img.jpg' },
  ]),
}))

describe('App routing', () => {
  it('renders Home on root path', async () => {
    render(<App />)
    // Wait for the search input placeholder which exists on Home
    expect(await screen.findByPlaceholderText(/Search by title, author, or genre/i)).toBeInTheDocument()
  })
})
