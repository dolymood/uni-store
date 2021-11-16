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
    'src/platform/',
    '\\.d\\.ts$'
  ],
  testMatch: [
    '<rootDir>/test/unit/*.spec.ts',
  ],
  transform: {
    '^.+\\.tsx?$': '@sucrase/jest-plugin',
  },
  rootDir: __dirname
}
