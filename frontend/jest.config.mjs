export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // supports Next.js-style imports (e.g. '@/components/Button')
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // ignore CSS imports
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};
