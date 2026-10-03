/**
 * Escape special regex characters in a string so it can be safely used
 * inside `new RegExp(...)` without risk of ReDoS or syntax errors.
 *
 * Characters escaped: \ ^ $ . | ? * + ( ) [ ] { }
 *
 * @param {string} str - Raw user-supplied string.
 * @returns {string} The escaped string safe for use in RegExp.
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
