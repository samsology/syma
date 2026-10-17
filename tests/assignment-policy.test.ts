import test from 'node:test';
import assert from 'node:assert/strict';
import { canSubmitAssignment, normalizeAssignmentUrl, validateAssignmentScore } from '../lib/assignments/policy';

test('weekly assignment resubmission is permitted only after Needs Revision', () => {
  assert.equal(canSubmitAssignment(null), true);
  assert.equal(canSubmitAssignment('NEEDS_REVISION'), true);
  assert.equal(canSubmitAssignment('SUBMITTED'), false);
  assert.equal(canSubmitAssignment('REVIEWED'), false);
});

test('assignment URLs accept HTTP(S) and reject executable schemes', () => {
  assert.equal(normalizeAssignmentUrl('  https://example.com/work  '), 'https://example.com/work');
  assert.equal(normalizeAssignmentUrl('http://example.com/work'), 'http://example.com/work');
  assert.equal(normalizeAssignmentUrl('javascript:alert(1)'), null);
  assert.equal(normalizeAssignmentUrl('data:text/html,hi'), null);
  assert.equal(normalizeAssignmentUrl('not a URL'), null);
});

test('assignment scores are optional, nonnegative, and bounded when a maximum is configured', () => {
  assert.equal(validateAssignmentScore('', 10), null);
  assert.equal(validateAssignmentScore('0', 10), 0);
  assert.equal(validateAssignmentScore('9.5', 10), 9.5);
  assert.equal(validateAssignmentScore('-1', 10), undefined);
  assert.equal(validateAssignmentScore('10.1', 10), undefined);
  assert.equal(validateAssignmentScore('12', null), 12);
  assert.equal(validateAssignmentScore('NaN', null), undefined);
});
