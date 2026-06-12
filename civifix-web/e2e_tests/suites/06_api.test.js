const assert = require('node:assert/strict');
const { apiRequest, isApiReachable, API_BASE_URL } = require('../utils/apiClient');

describe('API Testing - Backend Contract Checks', function () {
  this.timeout(60000);
  let reachable = false;

  before(async () => {
    reachable = await isApiReachable();
  });

  it('reaches the configured API base URL', async function () {
    if (!reachable) this.skip();
    assert.ok(API_BASE_URL.startsWith('http'), 'API_BASE_URL should be an HTTP URL');
  });

  it('returns district list with a valid response envelope', async function () {
    if (!reachable) this.skip();
    const { response, body } = await apiRequest('/admin/districts?active_only=false');
    assert.ok(response.ok, `Expected 2xx district response, got ${response.status}`);
    assert.ok(Array.isArray(body?.data) || Array.isArray(body), 'Expected district array or data array');
  });

  it('validates malformed login payloads', async function () {
    if (!reachable) this.skip();
    const { response } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    assert.ok(response.status >= 400 && response.status < 500, `Expected 4xx, got ${response.status}`);
  });
});
