const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const ExcelReporter = require('./utils/excelReporter');

const mocha = new Mocha({
  timeout: 60000,
  reporter: ExcelReporter
});

const suitesDir = path.join(__dirname, 'suites');
const files = fs.readdirSync(suitesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  mocha.addFile(path.join(suitesDir, file));
});

console.log(`Starting Selenium E2E Test Run for CiviFix (${files.length} suites)...`);
mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
