// jest.config.cjs
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true
      }
    ]
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],

  /**
   * Safe, limited moduleNameMapper:
   * 1) Map imports that explicitly contain '/src/' and end with .js -> .ts
   * 2) Map relative imports that point to common subfolders inside src (swagger, routes, controllers, middlewares, services, repositories, prisma)
   *
   * This avoids mapping node_modules while covering typical local relative specifiers like:
   *   './routes/health.route.js'         -> './routes/health.route.ts'
   *   '../controllers/foo.controller.js'-> '../controllers/foo.controller.ts'
   *   '../../../src/services/foo.js'    -> '../../../src/services/foo.ts'
   */
  moduleNameMapper: {
    "^(\\.{1,2}.*\\bsrc\\b.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/swagger/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/swagger/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/routes/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/routes/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/controllers/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/controllers/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/middlewares/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/middlewares/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/services/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/services/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/repositories/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/repositories/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}/prisma/.*)\\.js$": "$1.ts",
    "^(\\.{1,2}.*/prisma/.*)\\.js$": "$1.ts"
  },

  transformIgnorePatterns: ["/node_modules/"],

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
      useESM: true,
      diagnostics: { ignoreCodes: [] }
    }
  },

  testMatch: ["**/tests/**/*.spec.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverage: true,
  coverageDirectory: "coverage"
};
