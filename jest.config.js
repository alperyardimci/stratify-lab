module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__tests__/__mocks__/react-native.ts',
    '^react-native-svg$': '<rootDir>/src/__tests__/__mocks__/react-native-svg.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/__tests__/__mocks__/async-storage.ts',
  },
};
