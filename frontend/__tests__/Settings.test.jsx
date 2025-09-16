import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/context/ThemeContext'
import { Settings } from '../src/components/Settings/Settings'

// Stub out Navbar to avoid needing full app providers
jest.mock('../src/components/Navbar/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

// Mock react-router-dom's useNavigate in a controllable way
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => (globalThis.__navigateMock || jest.fn()),
  }
})

// Mock API layer used by Settings. Define base data inside the factory to avoid out-of-scope references.
jest.mock('../src/services/api', () => {
  // Use a mutable current state to emulate persistence across calls
  let current = {
    username: 'TestUser',
    email: 'test@example.com',
    joinDate: new Date('2024-01-01').toISOString(),
    isCreator: false,
    emailVerified: true,
    theme: 'light',
    readingPreferences: {
      showDialogues: true,
      enableClickNavigation: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
    },
  }

  const getUserSettings = jest.fn(async () => ({ ...current }))
  const saveUserSettings = jest.fn((partial) => {
    current = {
      ...current,
      ...partial,
      readingPreferences: {
        ...(current.readingPreferences || {}),
        ...(partial.readingPreferences || {}),
      },
      notifications: {
        ...(current.notifications || {}),
        ...(partial.notifications || {}),
      },
    }
    return { ...current }
  })
  const setCreatorMode = jest.fn(async (enable) => {
    current = { ...current, isCreator: !!enable }
    return { success: true, data: { user: { id: 1, isCreator: !!enable } } }
  })
  const deleteMyAccount = jest.fn(async () => ({ success: true }))

  return { getUserSettings, saveUserSettings, setCreatorMode, deleteMyAccount }
})

// Import the mocked module to make assertions on calls
import * as api from '../src/services/api'

describe('Settings page', () => {
  it('renders user info and updates theme preference', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      </MemoryRouter>
    )

    // Wait for initial load
    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()
    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()

    const themeSelect = screen.getByLabelText(/Preferred Theme/i)
    expect(themeSelect.value).toBe('light')

    fireEvent.change(themeSelect, { target: { value: 'dark' } })

    // Ensure save was called and UI reflects new value
    await waitFor(() => {
      expect(api.saveUserSettings).toHaveBeenCalledWith({ theme: 'dark' })
      expect(themeSelect.value).toBe('dark')
    })
  })

  it('applies theme in real time and persists selection', async () => {
    // Ensure starting theme attribute is set by provider (jsdom)
    document.documentElement.setAttribute('data-theme', 'light')

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      </MemoryRouter>
    )

    // Wait for settings
    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()

    const select = screen.getByLabelText(/Preferred Theme/i)
    expect(select).toBeInTheDocument()

    // Change to dark and verify document updates via context
    fireEvent.change(select, { target: { value: 'dark' } })
    await waitFor(() => {
      expect(select.value).toBe('dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    // Change to auto and ensure localStorage got updated by useTheme
    fireEvent.change(select, { target: { value: 'auto' } })
    await waitFor(() => {
      expect(select.value).toBe('auto')
      // matchMedia mock returns matches=false -> light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light'
      )
    })
  })

  it('enables and disables Creator Mode with confirmation on disable', async () => {
    // Mock confirm to return true by default for disable
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true)

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      </MemoryRouter>
    )

    // Wait for initial load
    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()

    // Initially disabled
    expect(screen.getByText(/Creator Mode:/i).nextSibling.textContent).toMatch(/Disabled/i)

    // Enable
    const toggleBtn = screen.getByRole('button', { name: /Enable Creator Mode/i })
    fireEvent.click(toggleBtn)

    // Button shows enabling state, then flips to disable
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Disable Creator Mode/i })).toBeInTheDocument()
    })

    // Status shows enabled
    expect(screen.getByText(/Creator Mode:/i).nextSibling.textContent).toMatch(/Enabled/i)

    // Disable now; confirm should be prompted
    const disableBtn = screen.getByRole('button', { name: /Disable Creator Mode/i })
    fireEvent.click(disableBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enable Creator Mode/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/Creator Mode:/i).nextSibling.textContent).toMatch(/Disabled/i)

    // Ensure confirm was called when disabling
    expect(confirmSpy).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('deletes account after confirmation and navigates home', async () => {
    // Confirm deletion
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true)

    // Provide a global navigate mock used by the module factory
    const navigateMock = jest.fn()
    globalThis.__navigateMock = navigateMock

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()

    const deleteBtn = screen.getByRole('button', { name: /Delete Account/i })
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/')
    })

    confirmSpy.mockRestore()
    delete globalThis.__navigateMock
  })

  it('persists checkbox toggles for reading and notifications', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText(/Reading Preferences/i)).toBeInTheDocument()

    const showDialogues = screen.getByLabelText(/Show dialogues by default/i)
    const clickNav = screen.getByLabelText(/Enable click navigation/i)
    const emailNotif = screen.getByLabelText(/Email notifications/i)
    const pushNotif = screen.getByLabelText(/Push notifications/i)

    // Initial states from mock
    expect(showDialogues).toBeChecked()
    expect(clickNav).toBeChecked()
    expect(emailNotif).toBeChecked()
    expect(pushNotif).not.toBeChecked()

    // Toggle some values
    fireEvent.click(showDialogues) // uncheck
    fireEvent.click(pushNotif) // check

    // UI should reflect new state
    expect(showDialogues).not.toBeChecked()
    expect(pushNotif).toBeChecked()

    // Toggle others
    fireEvent.click(clickNav) // uncheck
    fireEvent.click(emailNotif) // uncheck

    expect(clickNav).not.toBeChecked()
    expect(emailNotif).not.toBeChecked()
  })

  it('applies saved theme from localStorage on page load', async () => {
    // Persist theme selections in both storages used by the app
    localStorage.setItem('comicstop-theme', 'dark')
    await api.saveUserSettings({ theme: 'dark' })

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Settings />
        </ThemeProvider>
      </MemoryRouter>
    )

    // Wait for settings to load
    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()

    // Theme should be applied immediately from localStorage
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // And reflected in the Settings select
    const select = screen.getByLabelText(/Preferred Theme/i)
    expect(select.value).toBe('dark')
  })
})
