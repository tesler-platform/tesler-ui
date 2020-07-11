const { compilerOptions } = require('./tsconfig')
// Tests should not complain about unused variables
compilerOptions.noUnusedLocals = false

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$": "<rootDir>/src/tests/assetsMock.ts",
        "\\.(css|less)$": "identity-obj-proxy"
    },
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    globals: {
        'ts-jest': {
            tsConfig: compilerOptions
        }
    }
}
