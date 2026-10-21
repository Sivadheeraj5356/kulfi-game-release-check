const test = require('node:test');
const assert = require('node:assert/strict');
const { parseGames, missingStates, evaluate } = require('./app.js');

test('parses game rows and normalizes states', () => {
  const [game] = parseGames('Memory Match | long-distance couples | Loading, Error, Retry | completion');
  assert.equal(game.name, 'Memory Match');
  assert.deepEqual(game.states, ['loading', 'error', 'retry']);
});

test('detects every required missing product state', () => {
  const missing = missingStates({ states: ['loading'] });
  assert.deepEqual(missing, ['empty', 'error', 'retry']);
});

test('holds a game without audience or signal', () => {
  const [game] = evaluate('Prompt Remix |  | loading, error | ');
  assert.equal(game.status, 'hold');
  assert.match(game.action, /audience|signal/);
});
