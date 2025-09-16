import '@testing-library/jest-dom'
// Polyfill fetch for jsdom environment in tests
import 'whatwg-fetch'

// Mock window.matchMedia for components/hooks relying on it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Polyfill TextEncoder/TextDecoder required by react-router in Node test env
import { TextEncoder, TextDecoder } from 'util'
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}
if (!global.TextDecoder) {
  // @ts-ignore
  global.TextDecoder = TextDecoder
}
