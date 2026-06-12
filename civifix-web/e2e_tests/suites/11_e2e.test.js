const assert = require('node:assert/strict');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { TEST_AUTH_TOKEN } = require('../utils/testConfig');
const {
  openPath,
  visibleText,
  clickByText,
  assertCurrentPathContains,
  injectAuthenticatedSession,
} = require('../utils/webActions');

describe('End-to-End (E2E) Testing - Citizen Journey', function () {
  this.timeout(120000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('walks anonymous user from landing page to login and signup discovery', async () => {
    await openPath(driver, BASE_URL, '/');
    await clickByText(driver, 'Sign In');
    await assertCurrentPathContains(driver, '/login');
    await clickByText(driver, 'Sign Up');
    await assertCurrentPathContains(driver, '/signup');
    await visibleText(driver, 'Create Account');
  });

  it('opens authenticated dashboard when a valid test token is provided', async function () {
    if (!TEST_AUTH_TOKEN) this.skip();
    await openPath(driver, BASE_URL, '/');
    assert.equal(await injectAuthenticatedSession(driver), true);
    await openPath(driver, BASE_URL, '/dashboard');
    await visibleText(driver, 'Dashboard');
  });

  it('opens complaint creation workflow when a valid test token is provided', async function () {
    if (!TEST_AUTH_TOKEN) this.skip();
    await openPath(driver, BASE_URL, '/');
    await injectAuthenticatedSession(driver);
    await openPath(driver, BASE_URL, '/complaints/create');
    await visibleText(driver, 'Raise a Complaint');
    await visibleText(driver, "What's the issue?");
  });
});
