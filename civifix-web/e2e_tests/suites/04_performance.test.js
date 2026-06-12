const assert = require('node:assert/strict');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { PERFORMANCE_BUDGET_MS } = require('../utils/testConfig');
const { openPath } = require('../utils/webActions');

describe('Performance Testing - Browser Timing Budgets', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  async function assertPageLoad(path) {
    await openPath(driver, BASE_URL, path);
    const timing = await driver.executeScript(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        duration: Math.round(nav.duration),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        transferSize: nav.transferSize || 0,
      };
    });
    assert.ok(
      timing.duration <= PERFORMANCE_BUDGET_MS,
      `${path} loaded in ${timing.duration}ms, over budget ${PERFORMANCE_BUDGET_MS}ms`
    );
  }

  it('loads the home page within the configured budget', async () => {
    await assertPageLoad('/');
  });

  it('loads the login page within the configured budget', async () => {
    await assertPageLoad('/login');
  });

  it('loads the signup page within the configured budget', async () => {
    await assertPageLoad('/signup');
  });
});
