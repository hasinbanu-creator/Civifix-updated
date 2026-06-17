# CiviFix Selenium E2E Testing Guide

## Overview

This directory contains comprehensive Selenium-based End-to-End (E2E) tests for the CiviFix web application. The tests cover all major workflows across different user roles and features.

## Test Coverage

### Authentication (AUTH)
- ✓ Login with valid credentials
- ✓ Login with invalid credentials
- ✓ User signup
- ✓ OTP verification
- ✓ Session persistence
- ✓ Logout

### Citizen Workflows (CITIZEN)
- ✓ Dashboard access
- ✓ Create complaint
- ✓ Complaint tracking
- ✓ GPS location capture
- ✓ Ward selection
- ✓ District selection
- ✓ Form validation

### Inspector Workflows (INSPECTOR)
- ✓ Dashboard access
- ✓ View assigned complaints
- ✓ Complaint review
- ✓ Status updates
- ✓ Approval/Rejection
- ✓ Notes documentation

### Worker Workflows (WORKER)
- ✓ Dashboard access
- ✓ View assigned work
- ✓ Progress updates
- ✓ Resolution submission
- ✓ Status tracking

### UI/UX Testing (UIUX)
- ✓ Responsive design (Mobile, Tablet, Desktop)
- ✓ Broken links detection
- ✓ Form validation
- ✓ Error message display
- ✓ Navigation flow

## Installation

### Prerequisites
- Python 3.8+
- Chrome/Chromium browser
- pip

### Setup

```bash
# Navigate to selenium_tests directory
cd selenium_tests

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
```

### Configuration

Edit `.env` file with your test environment settings:

```env
FRONTEND_URL=http://localhost:3000
TEST_CITIZEN_EMAIL=citizen@test.com
TEST_CITIZEN_PASSWORD=Test@12345
BROWSER=chrome
HEADLESS=false
IMPLICIT_WAIT=10
EXPLICIT_WAIT=15
TAKE_SCREENSHOTS=true
```

## Running Tests

### Run All Tests
```bash
python run_tests.py
```

### Run Specific Test Class
```bash
pytest test_scenarios.py::TestAuthentication -v
```

### Run Specific Test
```bash
pytest test_scenarios.py::TestAuthentication::test_login_scenarios -v
```

### Run with Different Settings
```bash
# Headless mode
HEADLESS=true pytest test_scenarios.py -v

# Without screenshots
TAKE_SCREENSHOTS=false pytest test_scenarios.py -v
```

## Project Structure

```
selenium_tests/
├── conftest.py              # Pytest configuration and fixtures
├── base_page.py             # Base Page Object class
├── auth_pages.py            # Authentication page objects
├── complaint_pages.py       # Complaint workflow page objects
├── role_pages.py            # Inspector/Worker page objects
├── test_scenarios.py        # Test cases
├── run_tests.py             # Test runner and report generator
├── requirements.txt         # Dependencies
├── .env.example             # Environment template
└── screenshots/             # Captured screenshots
```

## Page Objects

### BasePage
Base class with common methods:
- `navigate_to(url)`
- `find_element(locator)`
- `click_element(locator)`
- `type_text(locator, text)`
- `get_text(locator)`
- `screenshot(filename)`

### Auth Pages
- `LoginPage` - Login functionality
- `SignupPage` - User registration
- `OTPPage` - OTP verification

### Complaint Pages
- `CitizenDashboardPage` - Citizen dashboard
- `ComplaintCreationPage` - Complaint form
- `ComplaintDetailPage` - Complaint details

### Role Pages
- `InspectorDashboardPage` - Inspector dashboard
- `InspectorComplaintDetailPage` - Inspection workflow
- `WorkerDashboardPage` - Worker dashboard
- `WorkerComplaintDetailPage` - Work progress

## Test Reports

### Output
Tests generate `selenium_test_report.xlsx` with:
- Test Case ID
- Module
- Scenario
- Expected vs Actual Results
- Status (PASS/FAIL)
- Screenshots
- Execution Time
- Remarks

### Screenshots
Screenshots are automatically captured:
- Success scenarios
- Failure scenarios
- Each test step

Location: `screenshots/` directory

## Best Practices

1. **Wait Strategies**
   - Use explicit waits for dynamic content
   - Set appropriate timeouts
   - Handle stale element exceptions

2. **Test Data**
   - Use unique identifiers (timestamps)
   - Clean up after tests
   - Use meaningful test data

3. **Assertions**
   - Assert on visible elements
   - Check both positive and negative cases
   - Verify error messages

4. **Error Handling**
   - Screenshot on failures
   - Log detailed error information
   - Provide actionable feedback

## Troubleshooting

### Common Issues

**Chrome driver not found**
```
Solution: webdriver-manager automatically downloads ChromeDriver
Make sure you have internet connection for first run
```

**Elements not found**
```
Solution: 
1. Increase EXPLICIT_WAIT in .env
2. Verify element locators with browser inspector
3. Check for dynamic content loading
```

**Connection refused**
```
Solution:
1. Ensure frontend is running: npm start
2. Check FRONTEND_URL in .env
3. Verify port 3000 is accessible
```

## Performance Metrics

Expected execution times per test:
- Authentication tests: 2-5 seconds
- Complaint creation: 5-10 seconds
- Dashboard tests: 3-8 seconds
- Navigation tests: 2-4 seconds

Total suite runtime: ~5-10 minutes (depending on system)

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Selenium Tests
  run: |
    cd selenium_tests
    pip install -r requirements.txt
    python run_tests.py
```

## Maintenance

1. **Update Locators**
   - Review page objects monthly
   - Update for UI changes
   - Test with real data

2. **Expand Coverage**
   - Add new workflows
   - Test edge cases
   - Include error scenarios

3. **Monitor Performance**
   - Track execution times
   - Optimize slow tests
   - Adjust timeouts

## Support

For issues or questions:
1. Check test logs
2. Review screenshots
3. Check browser console for errors
4. Verify test data and environment

---

**Last Updated:** 2026-06-17
**Version:** 1.0.0
