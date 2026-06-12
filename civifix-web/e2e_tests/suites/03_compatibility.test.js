const assert = require('node:assert/strict');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { openPath, visibleText, noHorizontalOverflow } = require('../utils/webActions');

describe('Compatibility Testing - Browser Capabilities and Viewports', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('runs in Chrome with JavaScript enabled', async () => {
    await openPath(driver, BASE_URL, '/');
    const capabilities = await driver.getCapabilities();
    assert.equal(capabilities.getBrowserName(), 'chrome');
    assert.equal(await driver.executeScript('return !!window.localStorage && !!window.fetch'), true);
  });

  it('supports modern browser APIs used by the application', async () => {
    await openPath(driver, BASE_URL, '/');
    const support = await driver.executeScript(() => ({
      fetch: typeof fetch === 'function',
      localStorage: typeof localStorage !== 'undefined',
      geolocation: 'geolocation' in navigator,
      formData: typeof FormData === 'function',
    }));
    assert.deepEqual(support, { fetch: true, localStorage: true, geolocation: true, formData: true });
  });

  it('renders key pages at tablet viewport width', async () => {
    await driver.manage().window().setRect({ width: 768, height: 1024 });
    await openPath(driver, BASE_URL, '/login');
    await visibleText(driver, 'Log in or sign up');
    await noHorizontalOverflow(driver);
  });
});
