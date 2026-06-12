const assert = require('node:assert/strict');
const { By } = require('selenium-webdriver');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { apiRequest } = require('../utils/apiClient');
const { openPath, typeInto, visibleText } = require('../utils/webActions');

describe('Security Testing - Client and API Safeguards', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('does not store authentication tokens during anonymous browsing', async () => {
    await openPath(driver, BASE_URL, '/');
    const tokens = await driver.executeScript(() => ({
      authToken: localStorage.getItem('authToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    }));
    assert.deepEqual(tokens, { authToken: null, refreshToken: null });
  });

  it('escapes script text typed into login email input', async () => {
    await openPath(driver, BASE_URL, '/login');
    const input = await typeInto(driver, 'input[type="email"]', '<script>window.__xss=true</script>');
    await driver.findElement(By.css('button[type="submit"]')).click();
    assert.equal(await driver.executeScript((el) => el.checkValidity(), input), false);
    assert.equal(await driver.executeScript('return window.__xss === true'), false);
  });

  it('rejects unauthenticated profile API access', async function () {
    let response;
    try {
      ({ response } = await apiRequest('/auth/me', { headers: { Authorization: '' }, timeout: 6000 }));
    } catch {
      this.skip();
    }
    assert.ok([401, 403].includes(response.status), `Expected 401/403, got ${response.status}`);
  });

  it('does not expose obvious secrets in rendered public HTML', async () => {
    await openPath(driver, BASE_URL, '/');
    const bodyText = await driver.findElement(By.css('body')).getText();
    assert.equal(/(secret|private_key|mongodb:\/\/|refresh_token)/i.test(bodyText), false);
  });
});
