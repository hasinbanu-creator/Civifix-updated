const { getDriver, BASE_URL } = require('../utils/driverSetup');
const { openPath, visibleText, assertCurrentPathContains, clickByText } = require('../utils/webActions');

describe('Regression Testing - Critical Routes Stay Available', function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    driver = await getDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('keeps home route available', async () => {
    await openPath(driver, BASE_URL, '/');
    await visibleText(driver, 'How CiviFix Helps Your City');
  });

  it('keeps login route available', async () => {
    await openPath(driver, BASE_URL, '/login');
    await visibleText(driver, 'EMAIL ADDRESS');
  });

  it('keeps signup route available', async () => {
    await openPath(driver, BASE_URL, '/signup');
    await visibleText(driver, 'FULL NAME');
  });

  it('keeps repeated login to signup navigation stable', async () => {
    await openPath(driver, BASE_URL, '/login');
    await clickByText(driver, 'Sign Up');
    await assertCurrentPathContains(driver, '/signup');
    await clickByText(driver, 'Sign In');
    await assertCurrentPathContains(driver, '/login');
  });
});
