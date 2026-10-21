(function (root) {
  const requiredStates = ['loading', 'empty', 'error', 'retry'];

  function parseGames(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [name = '', audience = '', states = '', signal = ''] = line.split('|').map((part) => part.trim());
        return {
          index: index + 1,
          name,
          audience,
          states: states.split(',').map((state) => state.trim().toLowerCase()).filter(Boolean),
          signal
        };
      })
      .filter((game) => game.name);
  }

  function missingStates(game) {
    return requiredStates.filter((state) => !game.states.includes(state));
  }

  function scoreGame(game) {
    const missing = missingStates(game);
    let score = 100 - missing.length * 13;
    if (!game.audience) score -= 14;
    if (!game.signal) score -= 16;
    if (!/couple|partner|together|both/i.test(game.audience)) score -= 8;
    if (!/completion|return|share|match|time|score|feedback/i.test(game.signal)) score -= 8;
    return Math.max(0, score);
  }

  function actionFor(game, score) {
    const missing = missingStates(game);
    const fixes = [];
    if (missing.length) fixes.push(`add ${missing.join(', ')} state${missing.length > 1 ? 's' : ''}`);
    if (!game.audience) fixes.push('name the couple context this game is for');
    if (!game.signal) fixes.push('define the user signal that proves the game worked');
    if (!fixes.length) return score >= 90 ? 'Release candidate. Track the named signal after launch.' : 'Ready after normal QA.';
    return `Before release: ${fixes.join('; ')}.`;
  }

  function evaluate(text) {
    return parseGames(text)
      .map((game) => {
        const score = scoreGame(game);
        return { ...game, score, missing: missingStates(game), action: actionFor(game, score), status: score >= 80 ? 'ready' : 'hold' };
      })
      .sort((a, b) => b.score - a.score);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function render(games) {
    const output = document.querySelector('#results');
    if (!output) return;
    if (!games.length) {
      output.innerHTML = '<p class="empty-state">Add one game per line: name | audience | states | success signal.</p>';
      return;
    }
    output.innerHTML = games.map((game) => `
      <article class="card ${game.status}">
        <div class="card-top"><h3>${escapeHtml(game.name)}</h3><strong>${game.score}</strong></div>
        <p class="status">${game.status === 'ready' ? 'Release ready' : 'Hold for fixes'}</p>
        <p>${escapeHtml(game.action)}</p>
      </article>`).join('');
  }

  function boot() {
    const input = document.querySelector('#gameInput');
    const button = document.querySelector('#checkButton');
    if (!input || !button) return;
    button.addEventListener('click', () => render(evaluate(input.value)));
  }

  const api = { parseGames, missingStates, scoreGame, evaluate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) root.KulfiGameReleaseCheck = api;
  if (root.document) root.addEventListener('DOMContentLoaded', boot);
})(typeof window !== 'undefined' ? window : globalThis);
