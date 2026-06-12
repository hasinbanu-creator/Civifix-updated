const assert = require('node:assert/strict');
const { By } = require('selenium-webdriver');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { openPath } = require('../utils/webActions');

describe('Accessibility Testing - Semantic and Keyboard Checks', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('has one main heading on the landing page', async () => {
    await openPath(driver, BASE_URL, '/');
    const headings = await driver.findElements(By.css('h1'));
    assert.ok(headings.length >= 1, 'Expected at least one h1 heading');
  });

  it('labels form inputs on login and signup pages', async () => {
    await openPath(driver, BASE_URL, '/login');
    const loginLabels = await driver.findElements(By.css('label'));
    assert.ok(loginLabels.length >= 1, 'Login page should expose labels');
    await openPath(driver, BASE_URL, '/signup');
    const signupLabels = await driver.findElements(By.css('label'));
    assert.ok(signupLabels.length >= 3, 'Signup page should expose field labels');
  });

  it('allows keyboard focus to reach actionable elements', async () => {
    await openPath(driver, BASE_URL, '/');
    await driver.actions().sendKeys('\uE004').perform();
    const activeTag = await driver.executeScript(() => document.activeElement?.tagName);
    assert.ok(['A', 'BUTTON', 'INPUT'].includes(activeTag), `Expected focusable element, got ${activeTag}`);
  });

  it('has alternate text for all images', async () => {
    await openPath(driver, BASE_URL, '/');
    const missingAlt = await driver.executeScript(() =>
      Array.from(document.images).filter((img) => !img.getAttribute('alt')).length
    );
    assert.equal(missingAlt, 0, 'Every image should have alt text');
  });
});
