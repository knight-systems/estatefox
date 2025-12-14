/**
 * Jest configuration for Expo app.
 *
 * Uses jest-expo preset for React Native compatibility.
 * MSW is configured in jest.setup.ts for API mocking.
 *
 * Note: We override some jest-expo settings to fix compatibility issues
 * with React Native 0.81.5 and jest-expo 52.
 */
const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  // Override setupFiles to use our custom presetup that fixes UIManager mock issues
  setupFiles: [
    '<rootDir>/jest.presetup.js',
    ...jestExpoPreset.setupFiles.filter(f => !f.includes('jest-expo/src/preset/setup.js')),
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@tanstack/react-query|msw|@mswjs|until-async|@bundled-es-modules)',
  ],
  moduleNameMapper: {
    ...jestExpoPreset.moduleNameMapper,
    // Handle module aliases (if using)
    '^@/(.*)$': '<rootDir>/$1',
    // MSW node export doesn't work with react-native condition, map directly
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!src/api/generated/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
