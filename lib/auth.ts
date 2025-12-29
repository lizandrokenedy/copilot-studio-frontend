export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('copilot:token');
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('copilot:token', token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('copilot:token');
}