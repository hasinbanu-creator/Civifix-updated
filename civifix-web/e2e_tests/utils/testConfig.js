const DEFAULT_API_URL = 'http://34.14.168.135:8000/api/v1';

function normalizeUrl(value, fallback) {
  return (value || fallback).replace(/\/$/, '');
}

const config = {
  BASE_URL: normalizeUrl(process.env.BASE_URL, 'http://localhost:3000'),
  API_BASE_URL: normalizeUrl(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL),
  HEADLESS: process.env.HEADLESS !== 'false',
  DEFAULT_TIMEOUT: Number(process.env.E2E_TIMEOUT_MS || 15000),
  PERFORMANCE_BUDGET_MS: Number(process.env.PERFORMANCE_BUDGET_MS || 5000),
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || '',
  TEST_USER_OTP: process.env.TEST_USER_OTP || '',
  TEST_AUTH_TOKEN: process.env.TEST_AUTH_TOKEN || '',
  TEST_REFRESH_TOKEN: process.env.TEST_REFRESH_TOKEN || '',
  TEST_USER_PROFILE: process.env.TEST_USER_PROFILE || '',
};

module.exports = config;
