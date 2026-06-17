# CiviFix Selenium Testing - Quick Reference Card

## Installation & Setup (2 minutes)

```bash
# Install
pip install -r selenium_tests/requirements.txt

# Configure
cd selenium_tests
cp .env.sample .env  # Edit with your settings

# Run Frontend (separate terminal)
cd civifix-web
npm run dev  # Runs on http://localhost:3000
```

---

## Running Tests

| Command | Purpose |
|---------|---------|
| `pytest test_scenarios.py -v` | Run all tests |
| `pytest test_scenarios.py::TestAuthentication -v` | Run auth tests only |
| `pytest test_scenarios.py -v -n 4` | Run tests in parallel |
| `python run_tests.py` | Generate Excel report |
| `pytest test_scenarios.py -v --tb=short` | Show short tracebacks |

---

## Test Files

| File | Purpose | Tests |
|------|---------|-------|
| auth_pages.py | Login/Signup page objects | - |
| complaint_pages.py | Complaint page objects | - |
| role_pages.py | Dashboard page objects | - |
| test_scenarios.py | 12 test cases | ✅ |
| conftest.py | Pytest config | - |
| base_page.py | Base page object | - |
| run_tests.py | Test runner | - |

---

## Test Categories

| Category | Count | Status | Time |
|----------|-------|--------|------|
| Authentication | 5 | ✅ | 30s |
| Signup | 1 | ✅ | 15s |
| OTP | 1 | ✅ | 15s |
| Dashboard | 3 | ✅ | 20s |
| Complaint | 2 | ⚠️ env | 60s |
| UI/UX | 2 | ✅ | 30s |

---

## Common XPath Patterns

```xpath
# By ID
//button[@id='submit']

# By text
//button[text()='Submit']

# By placeholder
//input[@placeholder='Email']

# Case-insensitive text
//button[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'SUBMIT')]

# By class
//button[@class='btn btn-primary']

# Parent/Child
//form//button[@type='submit']

# Multiple attributes
//input[@id='email' and @type='text']
```

---

## Frontend Locators

### Login Page
- Email: `#email-input` (By.ID)
- Continue: Button with "CONTINUE" text
- OTP Fields: `//input[@inputmode='numeric']`
- Verify: Button with "VERIFY" text

### Signup Page
- Name: `#signup-name`
- Mobile: `#signup-mobile`
- Email: `#signup-email`
- Address: Textarea with placeholder
- District: Select element
- Ward: Select element

### Complaint Page
- Type: Select with "Select a category"
- Description: Textarea with placeholder
- Priority: Buttons (LOW, MEDIUM, HIGH)
- Ward: Select element
- Address: Input with placeholder
- Submit: Button with "SUBMIT COMPLAINT" text

---

## Page Object Template

```python
class MyPage(BasePage):
    # Locators
    ELEMENT = (By.XPATH, "//element[@attr='value']")
    
    # Methods
    def interact_with_element(self):
        self.click_element(self.ELEMENT)
```

---

## Test Template

```python
def test_something(self, driver, test_context):
    test_context['test_id'] = "ID_001"
    test_context['scenario'] = "Test Name"
    
    page = SomePage(driver, TestConfig)
    page.navigate_to(url)
    
    try:
        # Actions
        page.do_something()
        
        # Assertions
        if page.check_condition():
            test_context['status'] = "PASS"
        else:
            test_context['status'] = "FAIL"
    except Exception as e:
        test_context['status'] = "FAIL"
        test_context['actual_result'] = str(e)
```

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Tests timeout | Start frontend: `npm run dev` |
| ChromeDriver fails | `pip install --upgrade webdriver-manager` |
| Element not found | Check screenshot in `screenshots/` folder |
| Permission denied (report) | Close Excel or use new filename |
| Import errors | `pip install -r requirements.txt` |

---

## Environment Variables

```env
FRONTEND_URL=http://localhost:3000
BROWSER=chrome
HEADLESS=false
IMPLICIT_WAIT=10
EXPLICIT_WAIT=15
TEST_CITIZEN_EMAIL=citizen@test.com
TEST_OTP=000000
TAKE_SCREENSHOTS=true
SCREENSHOT_PATH=./screenshots
```

---

## Key Methods (Base Page)

| Method | Purpose |
|--------|---------|
| `navigate_to(url)` | Go to URL |
| `find_element(locator)` | Find single element |
| `find_elements(locator)` | Find multiple elements |
| `click_element(locator)` | Click element |
| `type_text(locator, text)` | Enter text |
| `get_text(locator)` | Get element text |
| `is_element_present(locator)` | Check if present |
| `wait_for_element_visible(locator)` | Wait for visibility |
| `screenshot(filename)` | Take screenshot |

---

## File Structure

```
selenium_tests/
├── conftest.py              # Pytest config
├── base_page.py             # Base class
├── auth_pages.py            # Login/Signup
├── complaint_pages.py       # Complaints
├── role_pages.py            # Dashboards
├── test_scenarios.py        # Tests (12)
├── run_tests.py             # Runner
├── requirements.txt         # Dependencies
├── .env                     # Configuration
├── .env.sample              # Template
├── screenshots/             # Test output
└── reports/                 # Excel reports
```

---

## Report Sheets

### Test Results Sheet
- Test ID
- Module
- Scenario
- Expected Result
- Actual Result
- Status (🟢 PASS / 🔴 FAIL)
- Screenshot
- Execution Time
- Remarks

### Summary Sheet
- Total Tests
- Passed Count
- Failed Count
- Pass Rate %
- Execution Start/End
- Total Duration

---

## Links & Resources

- **Selenium Docs:** https://selenium.dev/documentation/
- **Pytest Docs:** https://docs.pytest.org/
- **Python XPath:** https://devhints.io/xpath
- **Page Object Model:** https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/

---

## Contact & Support

**For Issues:**
1. Check SELENIUM_TESTING_GUIDE.md (Troubleshooting)
2. Review test screenshot in screenshots/ folder
3. Check test logs for error details
4. Update locators if UI changed

**For Questions:**
1. Review page object code
2. Check test template in GUIDE
3. Consult XPath reference above

---

## Success Indicators ✅

- All 12 tests execute
- 10+ tests pass
- Report generates without errors
- Screenshots captured for failures
- No import/syntax errors
- Frontend loads on localhost:3000

---

**Version:** 1.0.0  
**Last Updated:** June 17, 2026  
**Status:** ✅ READY FOR USE
