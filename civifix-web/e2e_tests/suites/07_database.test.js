const assert = require('node:assert/strict');
const { apiRequest, isApiReachable } = require('../utils/apiClient');

describe('Database Testing - Data Availability Through API', function () {
  this.timeout(60000);
  let reachable = false;

  before(async () => {
    reachable = await isApiReachable();
  });

  it('confirms district reference data can be read from backend storage', async function () {
    if (!reachable) this.skip();
    const { response, body } = await apiRequest('/admin/districts?active_only=false');
    assert.ok(response.ok, `Expected database-backed district read to succeed, got ${response.status}`);
    const rows = Array.isArray(body?.data) ? body.data : body;
    assert.ok(Array.isArray(rows), 'Expected district records to be returned');
  });

  it('keeps district records structurally consistent', async function () {
    if (!reachable) this.skip();
    const { body } = await apiRequest('/admin/districts?active_only=false');
    const rows = Array.isArray(body?.data) ? body.data : body;
    if (!rows.length) this.skip();
    const sample = rows[0];
    assert.ok(sample._id || sample.id, 'District record should include an id');
    assert.ok(sample.name, 'District record should include a name');
  });
});
