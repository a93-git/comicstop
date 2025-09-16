/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['js','json'],
  verbose: true,
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
};