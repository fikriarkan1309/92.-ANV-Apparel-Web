// Toast helper using window custom events to allow clean modal-free alerts anywhere
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const event = new CustomEvent('anv-toast', { detail: { message, type } });
  window.dispatchEvent(event);
}
