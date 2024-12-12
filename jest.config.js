/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./results"
      }
    ],
    [
      "jest-html-reporter",
      {
        pageTitle: "CBS Vacatures - Test report",
        outputPath: "./results/report.html",
        includeConsoleLog: true,
        includeStackTrace: true,
        includeFailureMsg: true
      }
    ]
  ]
};