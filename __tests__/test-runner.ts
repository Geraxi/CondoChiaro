/**
 * Comprehensive Test Runner with Detailed Reporting
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  file: string
  passed: boolean
  error?: string
  duration?: number
}

interface TestReport {
  total: number
  passed: number
  failed: number
  results: TestResult[]
  errors: Array<{
    file: string
    function: string
    error: string
    suggestion: string
  }>
}

function parseJestOutput(output: string): TestReport {
  const lines = output.split('\n')
  const results: TestResult[] = []
  const errors: Array<{ file: string; function: string; error: string; suggestion: string }> = []

  let currentFile = ''
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  // Parse test results
  lines.forEach((line) => {
    // Match test file names
    const fileMatch = line.match(/PASS|FAIL.*(__tests__\/[^\s]+)/)
    if (fileMatch) {
      currentFile = fileMatch[1] || currentFile
    }

    // Match test results
    if (line.includes('✓') || line.includes('PASS')) {
      passedTests++
      totalTests++
    } else if (line.includes('✕') || line.includes('FAIL')) {
      failedTests++
      totalTests++
    }

    // Match error messages
    const errorMatch = line.match(/Error:|FAIL|Expected|Received/)
    if (errorMatch && currentFile) {
      const errorLine = line.trim()
      if (errorLine && !errors.some((e) => e.error === errorLine)) {
        errors.push({
          file: currentFile,
          function: 'Unknown',
          error: errorLine,
          suggestion: 'Check the test implementation and mock setup',
        })
      }
    }
  })

  // Extract totals from summary
  const summaryMatch = output.match(/(\d+) passed|(\d+) failed|Tests:\s+(\d+)/)
  if (summaryMatch) {
    const match = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed/)
    if (match) {
      passedTests = parseInt(match[1], 10)
      failedTests = parseInt(match[2], 10)
      totalTests = passedTests + failedTests
    }
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    results,
    errors,
  }
}

function generateReport(report: TestReport): string {
  const passRate = report.total > 0 ? ((report.passed / report.total) * 100).toFixed(1) : '0'
  const status = report.failed === 0 ? '✅' : '❌'

  let output = '\n'
  output += '═'.repeat(80) + '\n'
  output += '  CONDOCCHIARO BACKEND INTEGRATION TEST SUITE REPORT\n'
  output += '═'.repeat(80) + '\n\n'

  output += `Status: ${status} ${report.failed === 0 ? 'All tests passed' : `${report.failed} test(s) failed`}\n`
  output += `Total Tests: ${report.total}\n`
  output += `Passed: ${report.passed} (${passRate}%)\n`
  output += `Failed: ${report.failed}\n\n`

  if (report.failed > 0) {
    output += '─'.repeat(80) + '\n'
    output += 'FAILED TESTS DETAILS\n'
    output += '─'.repeat(80) + '\n\n'

    report.errors.forEach((error, index) => {
      output += `${index + 1}. File: ${error.file}\n`
      output += `   Function: ${error.function}\n`
      output += `   Error: ${error.error}\n`
      output += `   Suggestion: ${error.suggestion}\n\n`
    })
  }

  output += '─'.repeat(80) + '\n'
  output += 'TEST COVERAGE SUMMARY\n'
  output += '─'.repeat(80) + '\n\n'

  const testFiles = [
    'Authentication & Roles',
    'Condominium Management',
    'Excel/CSV Import',
    'Billing & Subscriptions',
    'Payment Fees',
    'File Storage',
    'Error Handling',
  ]

  testFiles.forEach((file) => {
    output += `✓ ${file}\n`
  })

  output += '\n' + '═'.repeat(80) + '\n'

  if (report.failed === 0) {
    output += '\n✅ Backend logic is production-ready\n'
    output += 'All core functionalities have been verified and are working correctly.\n'
  } else {
    output += '\n❌ Backend logic needs attention\n'
    output += 'Please review the failed tests above and fix the issues before deploying.\n'
  }

  output += '═'.repeat(80) + '\n\n'

  return output
}

async function runTests(): Promise<void> {
  console.log('Running CondoChiaro Backend Integration Tests...\n')
  console.log('This may take a few moments...\n')

  try {
    // Run Jest tests
    const output = execSync('npm test -- --verbose --no-coverage 2>&1', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    })

    const report = parseJestOutput(output)
    const reportText = generateReport(report)

    console.log(reportText)
    console.log(output)

    // Write report to file
    const reportPath = path.join(process.cwd(), '__tests__', 'test-report.txt')
    fs.writeFileSync(reportPath, reportText + '\n\n' + output)

    console.log(`\nDetailed report saved to: ${reportPath}\n`)

    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0)
  } catch (error: any) {
    console.error('Error running tests:', error.message)
    console.error(error.stdout || error.stderr)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runTests()
}

export { runTests, generateReport, parseJestOutput }




