module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'src/**/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/index.ts',
    'src/core/index.ts',
    '\\.d\\.ts$'
  ],
  testMatch: [
    '<rootDir>/test/unit/*.spec.ts',
    '<rootDir>/test/unit/*.spec.tsx'
  ],
  transform: {
    '^.+\\.tsx?$': '@sucrase/jest-plugin',
  },
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [`<rootDir>/jest.setup.ts`]
}
