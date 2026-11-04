export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* Older in-app browsers can use the manual fallback. */ }
  const active = document.activeElement;
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('aria-label', 'Result to copy');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.append(field);
  field.select();
  let copied = false;
  try { copied = document.execCommand?.('copy') === true; } catch { /* Show selectable text. */ }
  field.remove();
  active?.focus();
  return copied;
}
export async function nativeShare(data) {
  if (!navigator.share) return 'fallback';
  try { await navigator.share(data); return 'shared'; }
  catch (error) { return error.name === 'AbortError' ? 'cancelled' : 'fallback'; }
}
