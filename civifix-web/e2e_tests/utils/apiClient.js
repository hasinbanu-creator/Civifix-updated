const { API_BASE_URL, DEFAULT_TIMEOUT, TEST_AUTH_TOKEN } = require('./testConfig');

async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(TEST_AUTH_TOKEN ? { Authorization: `Bearer ${TEST_AUTH_TOKEN}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const text = await response.text();
    let body = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function isApiReachable() {
  try {
    const { response } = await apiRequest('/admin/districts?active_only=false', { timeout: 6000 });
    return response.status < 500;
  } catch {
    return false;
  }
}

module.exports = { apiRequest, isApiReachable, API_BASE_URL };
