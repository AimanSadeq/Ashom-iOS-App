'use strict';
// Run: node --test server/tests/adminPassword.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const ap = require('../adminPassword');

test('missing, short and publicly known passwords are refused', () => {
  assert.match(ap.adminPasswordProblem(''), /not set/);
  assert.match(ap.adminPasswordProblem('short'), /shorter/);
  assert.equal(ap.adminPasswordProblem('a-new-random-admin-password-2026'), null);
  // The leaked value is checked against its hash; LEAKED_ADMIN_PASSWORD lets a
  // maintainer prove it locally without the value ever being committed.
  if (process.env.LEAKED_ADMIN_PASSWORD) {
    assert.match(ap.adminPasswordProblem(process.env.LEAKED_ADMIN_PASSWORD), /publicly known/);
  }
});

test('password comparison', () => {
  assert.equal(ap.passwordMatches('right-password-123', 'right-password-123'), true);
  assert.equal(ap.passwordMatches('wrong', 'right-password-123'), false);
  assert.equal(ap.passwordMatches(undefined, 'right-password-123'), false);
  assert.equal(ap.passwordMatches('', ''), false);
});

test('a client is locked out after repeated failures', () => {
  ap.resetFailures();
  const t0 = 1_000_000;
  for (let i = 0; i < ap.MAX_FAILURES; i++) ap.recordFailure('1.2.3.4', t0);
  assert.equal(ap.isLockedOut('1.2.3.4', t0 + 1000), true);
  assert.equal(ap.isLockedOut('5.6.7.8', t0 + 1000), false);
  assert.equal(ap.isLockedOut('1.2.3.4', t0 + 16 * 60 * 1000), false);
});
