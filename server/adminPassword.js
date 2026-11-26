'use strict';
/**
 * Admin password checks for /api/ingest (security fix, 26 Nov 2026).
 *
 * - A password that is publicly known is refused even if it is still set in
 *   the environment. The old hard-coded fallback is readable in the history
 *   of the public Ashom-iOS-App repository, and the live value matched it.
 *   Only its SHA-256 is listed here.
 * - Comparison is constant time over SHA-256 digests (no length leak).
 * - Repeated failures from one client lock that client out for 15 minutes.
 */
const crypto = require('crypto');

const KNOWN_PUBLIC_SHA256 = new Set([
  '76204049b52d876bef9b7f8241466ea1795668ed9d74f3ac04f6d8edab4b91b2',
]);
const MIN_LENGTH = 12;
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;

const sha256 = (s) => crypto.createHash('sha256').update(String(s), 'utf8').digest();

/** Why the configured password must not be used, or null when it is acceptable. */
function adminPasswordProblem(pw = process.env.ADMIN_PASSWORD) {
  if (!pw) return 'ADMIN_PASSWORD is not set';
  if (pw.length < MIN_LENGTH) return `ADMIN_PASSWORD is shorter than ${MIN_LENGTH} characters`;
  if (KNOWN_PUBLIC_SHA256.has(sha256(pw).toString('hex'))) return 'ADMIN_PASSWORD is a publicly known value and must be rotated';
  return null;
}

function passwordMatches(provided, configured) {
  if (typeof provided !== 'string' || !provided || !configured) return false;
  return crypto.timingSafeEqual(sha256(provided), sha256(configured));
}

const failures = new Map(); // client -> timestamps
function recent(key, now) {
  const list = (failures.get(key) || []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, list);
  return list;
}
function isLockedOut(key, now = Date.now()) { return recent(key, now).length >= MAX_FAILURES; }
function recordFailure(key, now = Date.now()) {
  recent(key, now).push(now);
  if (failures.size > 10000) failures.clear();
}
function resetFailures() { failures.clear(); }

module.exports = { adminPasswordProblem, passwordMatches, isLockedOut, recordFailure, resetFailures, MAX_FAILURES };
