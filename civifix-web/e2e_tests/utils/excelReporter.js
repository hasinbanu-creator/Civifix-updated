const fs = require('fs');
const path = require('path');
const os = require('os');
const xlsx = require('xlsx');
const Mocha = require('mocha');
const { Base } = Mocha.reporters;
const { BASE_URL, API_BASE_URL, HEADLESS } = require('./testConfig');

const TEST_TYPES = [
  'Functional Testing',
  'UI/UX Testing',
  'Compatibility Testing',
  'Performance Testing',
  'Security Testing',
  'API Testing',
  'Database Testing',
  'Accessibility Testing',
  'Mobile-Specific Testing',
  'Regression Testing',
  'End-to-End (E2E) Testing',
];

function autosize(sheet, rows) {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  sheet['!cols'] = keys.map((key) => ({
    wch: Math.min(
      Math.max(
        key.length + 2,
        ...rows.map((row) => String(row[key] ?? '').slice(0, 80).length + 2)
      ),
      60
    ),
  }));
}

function appendJsonSheet(workbook, name, rows) {
  const data = rows.length ? rows : [{ Status: 'No records' }];
  const sheet = xlsx.utils.json_to_sheet(data);
  autosize(sheet, data);
  const safeName = name.replace(/[:\\/?*\[\]]/g, '-').slice(0, 31);
  xlsx.utils.book_append_sheet(workbook, sheet, safeName);
}

function getCategory(title) {
  return TEST_TYPES.find((type) => title.toLowerCase().includes(type.toLowerCase())) || title;
}

class ExcelReporter extends Base {
  constructor(runner) {
    super(runner);
    this.results = [];
    this.startTime = new Date();
    this.sequence = 0;

    runner.on('pass', (test) => {
      this.addResult(test, 'PASSED');
      console.log(`PASS ${test.fullTitle()}`);
    });

    runner.on('fail', (test, err) => {
      this.addResult(test, 'FAILED', err);
      console.log(`FAIL ${test.fullTitle()} - ${err.message}`);
    });

    runner.on('pending', (test) => {
      this.addResult(test, 'SKIPPED');
      console.log(`SKIP ${test.fullTitle()}`);
    });

    runner.on('end', () => this.writeWorkbook());
  }

  addResult(test, status, err) {
    const parentTitle = test.parent?.title || 'Uncategorized';
    this.sequence += 1;
    this.results.push({
      No: this.sequence,
      Category: getCategory(parentTitle),
      Suite: parentTitle,
      'Test Name': test.title,
      Status: status,
      'Duration (sec)': Number(((test.duration || 0) / 1000).toFixed(3)),
      Error: err ? String(err.message || err).slice(0, 1000) : '',
      'Full Title': test.fullTitle(),
    });
  }

  writeWorkbook() {
    const endTime = new Date();
    const durationSec = Number(((endTime - this.startTime) / 1000).toFixed(3));
    const passed = this.results.filter((r) => r.Status === 'PASSED').length;
    const failed = this.results.filter((r) => r.Status === 'FAILED').length;
    const skipped = this.results.filter((r) => r.Status === 'SKIPPED').length;
    const total = this.results.length;
    const passRate = total ? Number(((passed / total) * 100).toFixed(2)) : 0;

    const workbook = xlsx.utils.book_new();
    const summary = [
      { Metric: 'Application', Value: 'CiviFix Web Application' },
      { Metric: 'Report Type', Value: 'Selenium End-to-End Test Analysis' },
      { Metric: 'Total Tests', Value: total },
      { Metric: 'Passed', Value: passed },
      { Metric: 'Failed', Value: failed },
      { Metric: 'Skipped', Value: skipped },
      { Metric: 'Pass Rate %', Value: passRate },
      { Metric: 'Duration (sec)', Value: durationSec },
      { Metric: 'Start Time', Value: this.startTime.toISOString() },
      { Metric: 'End Time', Value: endTime.toISOString() },
      { Metric: 'Base URL', Value: BASE_URL },
      { Metric: 'API Base URL', Value: API_BASE_URL },
      { Metric: 'Headless Browser', Value: String(HEADLESS) },
      { Metric: 'Machine', Value: os.hostname() },
      { Metric: 'Platform', Value: `${os.platform()} ${os.release()}` },
      { Metric: 'Node Version', Value: process.version },
    ];
    appendJsonSheet(workbook, 'Summary', summary);

    const coverage = TEST_TYPES.map((type) => {
      const rows = this.results.filter((result) => result.Category === type);
      const typePassed = rows.filter((r) => r.Status === 'PASSED').length;
      const typeFailed = rows.filter((r) => r.Status === 'FAILED').length;
      const typeSkipped = rows.filter((r) => r.Status === 'SKIPPED').length;
      return {
        'Testing Type': type,
        'Total Tests': rows.length,
        Passed: typePassed,
        Failed: typeFailed,
        Skipped: typeSkipped,
        'Pass Rate %': rows.length ? Number(((typePassed / rows.length) * 100).toFixed(2)) : 0,
      };
    });
    appendJsonSheet(workbook, 'Coverage Analysis', coverage);
    appendJsonSheet(workbook, 'All Test Details', this.results);
    appendJsonSheet(workbook, 'Passed Tests', this.results.filter((r) => r.Status === 'PASSED'));
    appendJsonSheet(workbook, 'Failed Tests', this.results.filter((r) => r.Status === 'FAILED'));
    appendJsonSheet(workbook, 'Skipped Tests', this.results.filter((r) => r.Status === 'SKIPPED'));

    TEST_TYPES.forEach((type) => {
      appendJsonSheet(workbook, type, this.results.filter((result) => result.Category === type));
    });

    const reportDir = path.join(__dirname, '..', 'reports');
    fs.mkdirSync(reportDir, { recursive: true });
    const filename = `CiviFix_Selenium_E2E_Report_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
    const outputPath = path.join(reportDir, filename);
    xlsx.writeFile(workbook, outputPath);

    console.log('\n======================================================');
    console.log(`Selenium E2E Excel report generated: ${outputPath}`);
    console.log('======================================================\n');
  }
}

module.exports = ExcelReporter;
