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

// Mock API layer used by Settings with CreatorHub functionality
jest.mock('../src/services/api', () => {
  // Use a mutable current state to emulate persistence across calls
  let current = {
    id: 1,
    username: 'TestCreator',
    email: 'creator@example.com',
    joinDate: new Date('2024-01-01').toISOString(),
    isCreator: false,  // Start with disabled
    isCreatorEnabled: false,  // Start with disabled
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

  let creatorProfile = {
    displayName: 'Test Creator',
    bio: 'A test creator',
    websiteUrl: 'https://example.com',
    socialLinks: { twitter: '@testcreator' },
    allowComments: true,
    moderateComments: false,
    emailNotifications: true,
    publicStats: false,
    acceptDonations: false,
  }

  const getUserSettings = jest.fn(async () => ({ ...current }))
  const saveUserSettings = jest.fn((partial) => {
    current = { ...current, ...partial }
    return Promise.resolve({ success: true })
  })

  const setCreatorHub = jest.fn(async (enabled) => {
    current.isCreatorEnabled = enabled
    current.isCreator = enabled // Legacy compatibility
    if (!enabled) {
      current.creatorDisabledAt = new Date().toISOString()
    } else {
      current.creatorDisabledAt = null
    }
    return { success: true, data: { user: current } }
  })

  const getUserProfile = jest.fn(async () => ({
    username: current.username,
    email: current.email,
    phone: current.phone || null,
  }))

  const getMyCreatorProfile = jest.fn(async () => {
    if (!current.isCreator && !current.isCreatorEnabled) {
      throw new Error('Not a creator')
    }
    return { ...creatorProfile }
  })

  const updateCreatorProfile = jest.fn(async (data) => {
    creatorProfile = { ...creatorProfile, ...data }
    return { success: true, data: creatorProfile }
  })

  return {
    getUserSettings,
    saveUserSettings,
    setCreatorHub,
    getUserProfile,
    getMyCreatorProfile,
    updateCreatorProfile,
    deleteMyAccount: jest.fn(),
    updateUsername: jest.fn(),
    updateEmail: jest.fn(),
    updatePhone: jest.fn(),
    updatePassword: jest.fn(),
    updateProfilePicture: jest.fn(),
  }
})

// Test utilities
const renderSettings = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Settings CreatorHub Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Reset global navigate mock
    globalThis.__navigateMock = jest.fn()
  })

  afterEach(() => {
    delete globalThis.__navigateMock
  })

  describe('CreatorHub Basic Functionality', () => {
    it('should render the settings page successfully', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Settings')).toBeInTheDocument()
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })
    })

    it('should show Enable CreatorHub button when disabled', async () => {
      const { getUserSettings } = require('../src/services/api')
      
      // Mock user as NOT having CreatorHub enabled  
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        email: 'creator@example.com',
        isCreator: false,
        isCreatorEnabled: false,
        theme: 'light',
      })
      
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Enable CreatorHub/i })).toBeInTheDocument()
    })

    it('should show Disable CreatorHub button when enabled', async () => {
      const { getUserSettings, getMyCreatorProfile } = require('../src/services/api')
      
      // Mock user as having CreatorHub enabled
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        email: 'creator@example.com',
        isCreator: true,
        isCreatorEnabled: true,
        theme: 'light',
      })
      
      getMyCreatorProfile.mockResolvedValueOnce({
        displayName: 'Test Creator',
        bio: 'A test creator',
        websiteUrl: 'https://example.com',
        allowComments: true,
        moderateComments: false,
        emailNotifications: true,
        publicStats: false,
        acceptDonations: false,
      })

      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Disable CreatorHub/i })).toBeInTheDocument()
    })
  })

  describe('CreatorHub Toggle Actions', () => {
    it('should call setCreatorHub API when enabling CreatorHub', async () => {
      const { setCreatorHub, getUserSettings } = require('../src/services/api')
      
      // Mock user as NOT having CreatorHub enabled
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        isCreator: false,
        isCreatorEnabled: false,
        theme: 'light',
      })
      
      // Mock window.confirm to return true
      global.confirm = jest.fn().mockReturnValue(true)
      
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })

      const enableButton = screen.getByRole('button', { name: /Enable CreatorHub/i })
      fireEvent.click(enableButton)

      await waitFor(() => {
        expect(setCreatorHub).toHaveBeenCalledWith(true)
      })
    })

    it('should call setCreatorHub API when disabling CreatorHub', async () => {
      const { setCreatorHub, getUserSettings, getMyCreatorProfile } = require('../src/services/api')
      
      // Mock user as having CreatorHub enabled
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        isCreator: true,
        isCreatorEnabled: true,
        theme: 'light',
      })
      
      getMyCreatorProfile.mockResolvedValueOnce({
        displayName: 'Test Creator',
        bio: 'A test creator',
      })

      // Mock window.confirm to return true (user confirms disable)
      global.confirm = jest.fn().mockReturnValue(true)

      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })

      const disableButton = screen.getByRole('button', { name: /Disable CreatorHub/i })
      fireEvent.click(disableButton)

      // Should show retention policy in confirmation
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('6 months')
      )

      await waitFor(() => {
        expect(setCreatorHub).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('CreatorProfile Fields', () => {
    it('should display CreatorProfile fields when CreatorHub is enabled', async () => {
      const { getUserSettings, getMyCreatorProfile } = require('../src/services/api')
      
      // Mock user as having CreatorHub enabled
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        email: 'creator@example.com',
        isCreator: true,
        isCreatorEnabled: true,
        theme: 'light',
      })
      
      getMyCreatorProfile.mockResolvedValueOnce({
        displayName: 'Test Creator',
        bio: 'A test creator',
        websiteUrl: 'https://example.com',
        socialLinks: { twitter: '@testcreator' },
        allowComments: true,
        moderateComments: false,
        emailNotifications: true,
        publicStats: false,
        acceptDonations: false,
      })
      
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('CreatorHub Profile')).toBeInTheDocument()
      })

      // Should show creator profile fields
      expect(screen.getByDisplayValue('Test Creator')).toBeInTheDocument()
      expect(screen.getByDisplayValue('A test creator')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Save Creator Profile/i })).toBeInTheDocument()
    })

    it('should update CreatorProfile fields', async () => {
      const { getUserSettings, getMyCreatorProfile, updateCreatorProfile } = require('../src/services/api')
      
      // Mock user as having CreatorHub enabled
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        isCreator: true,
        theme: 'light',
      })
      
      getMyCreatorProfile.mockResolvedValueOnce({
        displayName: 'Test Creator',
        bio: 'A test creator',
      })
      
      // Mock window.alert to avoid issues in tests
      global.alert = jest.fn()
      
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('CreatorHub Profile')).toBeInTheDocument()
      })

      // Update display name
      const displayNameField = screen.getByDisplayValue('Test Creator')
      fireEvent.change(displayNameField, { target: { value: 'Updated Creator Name' } })

      // Save changes
      const saveButton = screen.getByRole('button', { name: /Save Creator Profile/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(updateCreatorProfile).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle CreatorHub API errors gracefully', async () => {
      const { setCreatorHub, getUserSettings } = require('../src/services/api')
      
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        isCreator: false,
        theme: 'light',
      })
      
      setCreatorHub.mockRejectedValueOnce(new Error('API Error'))

      // Mock window.confirm and alert
      global.confirm = jest.fn().mockReturnValue(true)
      global.alert = jest.fn()

      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })

      const enableButton = screen.getByRole('button', { name: /Enable CreatorHub/i })
      fireEvent.click(enableButton)

      // Should handle error gracefully
      await waitFor(() => {
        expect(setCreatorHub).toHaveBeenCalled()
      })
      
      // Should show error alert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Failed to update CreatorHub')
        )
      })
    })
  })

  describe('Conditional Rendering', () => {
    it('should not show CreatorProfile section when CreatorHub is disabled', async () => {
      const { getUserSettings } = require('../src/services/api')
      
      getUserSettings.mockResolvedValueOnce({
        id: 1,
        username: 'TestCreator',
        isCreator: false,
        isCreatorEnabled: false,
        theme: 'light',
      })
      
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      })

      // Creator profile section should not be visible when disabled
      expect(screen.queryByText('CreatorHub Profile')).not.toBeInTheDocument()
    })

    it('should show loading state initially', async () => {
      // Mock delayed API responses
      const { getUserSettings } = require('../src/services/api')
      getUserSettings.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: 1,
          username: 'TestCreator',
          theme: 'light',
        }), 100))
      )

      renderSettings()

      // Should show loading state initially
      expect(screen.getByText(/Loading settings/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Account Actions')).toBeInTheDocument()
      }, { timeout: 200 })
    })
  })
})