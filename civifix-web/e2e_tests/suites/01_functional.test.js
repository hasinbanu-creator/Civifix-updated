const assert = require('node:assert/strict');
const { By } = require('selenium-webdriver');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const {
  openPath,
  visibleText,
  clickByText,
  typeInto,
  assertCurrentPathContains,
} = require('../utils/webActions');

describe('Functional Testing - Public Authentication and Navigation', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('loads the landing page and shows core CiviFix content', async () => {
    await openPath(driver, BASE_URL, '/');
    await visibleText(driver, 'CiviFix');
    await visibleText(driver, 'File a Complaint');
    await visibleText(driver, 'View Dashboard');
  });

  it('navigates from landing page to login', async () => {
    await openPath(driver, BASE_URL, '/');
    await clickByText(driver, 'Sign In');
    await assertCurrentPathContains(driver, '/login');
    await visibleText(driver, 'Log in or sign up');
  });

  it('validates login email field before requesting OTP', async () => {
    await openPath(driver, BASE_URL, '/login');
    const input = await typeInto(driver, 'input[type="email"]', 'invalid-email');
    await clickByText(driver, 'CONTINUE');
    const valid = await driver.executeScript((el) => el.checkValidity(), input);
    const message = await driver.executeScript((el) => el.validationMessage, input);
    assert.equal(valid, false);
    assert.ok(message.length > 0, 'Expected native email validation message');
  });

  it('navigates from login to signup', async () => {
    await openPath(driver, BASE_URL, '/login');
    await clickByText(driver, 'Sign Up');
    await assertCurrentPathContains(driver, '/signup');
    await visibleText(driver, 'Personal Info');
  });

  it('validates signup required fields on step 1', async () => {
    await openPath(driver, BASE_URL, '/signup');
    await clickByText(driver, 'NEXT');
    await visibleText(driver, 'Name is required');
    await visibleText(driver, 'Mobile number is required');
    await visibleText(driver, 'Email is required');
  });

  it('accepts valid signup step 1 details and moves to location step', async () => {
    await openPath(driver, BASE_URL, '/signup');
    const inputs = await driver.findElements(By.css('input'));
    await inputs[0].sendKeys('Test Citizen');
    await inputs[1].sendKeys('9876543210');
    await inputs[2].sendKeys(`citizen.${Date.now()}@example.com`);
    await clickByText(driver, 'NEXT');
    await visibleText(driver, 'Security Info');
    await visibleText(driver, 'ADDRESS');
  });
});
