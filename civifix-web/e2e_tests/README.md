# CiviFix Selenium E2E Test Suite

This folder contains the Selenium + Mocha end-to-end test framework for the CiviFix web application.

## Covered Test Areas

- Functional Testing
- UI/UX Testing
- Compatibility Testing
- Performance Testing
- Security Testing
- API Testing
- Database Testing
- Accessibility Testing
- Mobile-Specific Testing
- Regression Testing
- End-to-End (E2E) Testing

## Run

Start the web app first:

```bash
npm run dev
```

Then run Selenium tests from `civifix-web`:

```bash
npm run test:e2e
```

The Excel report is generated in:

```text
e2e_tests/reports/
```

## Environment Variables

```bash
BASE_URL=http://localhost:3000
API_BASE_URL=http://34.14.168.135:8000/api/v1
HEADLESS=true
E2E_TIMEOUT_MS=15000
PERFORMANCE_BUDGET_MS=5000
```

Optional authenticated flow variables:

```bash
TEST_AUTH_TOKEN=your_access_token
TEST_REFRESH_TOKEN=your_refresh_token
TEST_USER_PROFILE='{"name":"Test Citizen","district":"..."}'
```

When `TEST_AUTH_TOKEN` is not provided, authenticated dashboard and complaint creation tests are skipped and marked in the Excel report.

## Report Sheets

The generated workbook includes:

- Summary
- Coverage Analysis
- All Test Details
- Passed Tests
- Failed Tests
- Skipped Tests
- One worksheet for each requested testing type
