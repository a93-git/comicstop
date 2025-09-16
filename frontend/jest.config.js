/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]] }]
  },
  moduleFileExtensions: ['js','jsx'],
  roots: ['<rootDir>/__tests__','<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.(js|jsx)'],
  verbose: true,
};