module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'packages/*/src/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.d\\.ts$'
  ],
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': '@sucrase/jest-plugin',
  },
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [`<rootDir>/jest.setup.ts`]
}
