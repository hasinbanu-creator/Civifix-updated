const assert = require('node:assert/strict');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { openPath, visibleText, noHorizontalOverflow } = require('../utils/webActions');

describe('Mobile-Specific Testing - Responsive Citizen Workflows', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('renders home page cleanly on a mobile viewport', async () => {
    await driver.manage().window().setRect({ width: 390, height: 844 });
    await openPath(driver, BASE_URL, '/');
    await visibleText(driver, 'CiviFix');
    await noHorizontalOverflow(driver);
  });

  it('renders login flow on a mobile viewport', async () => {
    await driver.manage().window().setRect({ width: 390, height: 844 });
    await openPath(driver, BASE_URL, '/login');
    await visibleText(driver, 'Log in or sign up');
    await noHorizontalOverflow(driver);
  });

  it('shows tappable signup controls with adequate height', async () => {
    await driver.manage().window().setRect({ width: 390, height: 844 });
    await openPath(driver, BASE_URL, '/signup');
    const minButtonHeight = await driver.executeScript(() =>
      Math.min(
        ...Array.from(document.querySelectorAll('button, a'))
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.width >= 44)
          .map((rect) => rect.height)
      )
    );
    assert.ok(minButtonHeight >= 32, `Expected tappable controls, min height was ${minButtonHeight}px`);
  });
});
