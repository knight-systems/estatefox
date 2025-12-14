/**
 * Jest configuration for Expo app.
 *
 * Uses jest-expo preset for React Native compatibility.
 * MSW is configured in jest.setup.ts for API mocking.
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@tanstack/react-query|msw|@mswjs|until-async|strict-event-emitter|type-fest)',
  ],
  moduleNameMapper: {
    // Handle module aliases (if using)
    '^@/(.*)$': '<rootDir>/$1',
    // Fix MSW v2 import paths
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node',
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
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/tests/**/*.(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    'tests/mocks/',
    'tests/factories/',
    'tests/utils/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
