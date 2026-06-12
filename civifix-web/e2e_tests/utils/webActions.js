const assert = require('node:assert/strict');
const { By, until } = require('selenium-webdriver');
const { DEFAULT_TIMEOUT } = require('./testConfig');

function xpathLiteral(text) {
  if (!text.includes("'")) return `'${text}'`;
  if (!text.includes('"')) return `"${text}"`;
  return `concat('${text.replace(/'/g, "',\"'\",'")}')`;
}

async function openPath(driver, baseUrl, path = '/') {
  await driver.get(`${baseUrl}${path}`);
  await driver.wait(until.elementLocated(By.css('body')), DEFAULT_TIMEOUT);
}

async function visibleText(driver, text) {
  const xpath = `//*[contains(normalize-space(.), ${xpathLiteral(text)})]`;
  const element = await driver.wait(until.elementLocated(By.xpath(xpath)), DEFAULT_TIMEOUT);
  await driver.wait(until.elementIsVisible(element), DEFAULT_TIMEOUT);
  return element;
}

async function clickByText(driver, text) {
  const interactiveXpath = `//*[self::a or self::button or @role='button'][contains(normalize-space(.), ${xpathLiteral(text)})]`;
  const element = await driver.wait(until.elementLocated(By.xpath(interactiveXpath)), DEFAULT_TIMEOUT);
  await driver.wait(until.elementIsVisible(element), DEFAULT_TIMEOUT);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', element);
  await element.click();
}

async function typeInto(driver, selector, value) {
  const element = await driver.wait(until.elementLocated(By.css(selector)), DEFAULT_TIMEOUT);
  await element.clear();
  await element.sendKeys(value);
  return element;
}

async function assertCurrentPathContains(driver, expected) {
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(expected), DEFAULT_TIMEOUT);
  assert.match(await driver.getCurrentUrl(), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

async function noHorizontalOverflow(driver) {
  const overflow = await driver.executeScript(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 2, `Page has horizontal overflow of ${overflow}px`);
}

async function injectAuthenticatedSession(driver) {
  const { TEST_AUTH_TOKEN, TEST_REFRESH_TOKEN, TEST_USER_PROFILE } = require('./testConfig');
  if (!TEST_AUTH_TOKEN) return false;
  await driver.executeScript(
    (token, refresh, profile) => {
      localStorage.setItem('authToken', token);
      if (refresh) localStorage.setItem('refreshToken', refresh);
      if (profile) localStorage.setItem('userProfile', profile);
    },
    TEST_AUTH_TOKEN,
    TEST_REFRESH_TOKEN,
    TEST_USER_PROFILE
  );
  return true;
}

module.exports = {
  openPath,
  visibleText,
  clickByText,
  typeInto,
  assertCurrentPathContains,
  noHorizontalOverflow,
  injectAuthenticatedSession,
};
