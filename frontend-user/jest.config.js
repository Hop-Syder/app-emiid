/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    testPathIgnorePatterns: ['/node_modules/', '/.next/'],
    collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/*.stories.{ts,tsx}',
        '!**/ui/**', // Ignore UI components for now
    ],
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 30,
            lines: 30,
            statements: 30,
        },
    },
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
}
