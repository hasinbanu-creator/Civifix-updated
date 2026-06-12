const assert = require('node:assert/strict');
const { By } = require('selenium-webdriver');
const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { openPath, visibleText, noHorizontalOverflow } = require('../utils/webActions');

describe('UI/UX Testing - Layout, Visual States, and Usability', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('renders primary call-to-action buttons with visible labels', async () => {
    await openPath(driver, BASE_URL, '/');
    await visibleText(driver, 'File a Complaint');
    await visibleText(driver, 'View Dashboard');
    const buttons = await driver.findElements(By.css('a, button'));
    assert.ok(buttons.length >= 8, 'Expected multiple visible navigation/actions');
  });

  it('does not horizontally overflow on desktop', async () => {
    await driver.manage().window().setRect({ width: 1440, height: 900 });
    await openPath(driver, BASE_URL, '/');
    await noHorizontalOverflow(driver);
  });

  it('shows clear validation styling on login errors', async () => {
    await openPath(driver, BASE_URL, '/login');
    const input = await driver.findElement(By.css('input[type="email"]'));
    await input.sendKeys('bad');
    await driver.findElement(By.css('button[type="submit"]')).click();
    const valid = await driver.executeScript((el) => el.checkValidity(), input);
    const message = await driver.executeScript((el) => el.validationMessage, input);
    assert.equal(valid, false);
    assert.ok(message.length > 0, 'Expected native email validation message');
    const borderColor = await driver.executeScript(
      (el) => getComputedStyle(el.closest('div')).borderColor,
      input
    );
    assert.ok(borderColor, 'Expected validation border color to be applied');
  });

  it('loads visible logo/image assets', async () => {
    await openPath(driver, BASE_URL, '/');
    const imagesOk = await driver.executeScript(() =>
      Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0)
    );
    assert.equal(imagesOk, true, 'All visible page images should load');
  });
});
