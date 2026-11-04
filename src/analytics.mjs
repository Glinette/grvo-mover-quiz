// No requests, cookies, identifiers, storage, or SDKs by default.
const allowed = new Set(['quiz_start', 'question_answer', 'quiz_complete', 'result_share', 'grvo_cta_click']);
export function track(name, data = {}) {
  if (!allowed.has(name)) return;
  const detail = { name, ...data };
  window.dispatchEvent(new CustomEvent('grvo:analytics', { detail }));
  const config = window.GRVO_ANALYTICS;
  if (config?.consent === true && typeof config.send === 'function') {
    try { Promise.resolve(config.send(detail)).catch(() => {}); } catch { /* Quiz always works. */ }
  }
}
