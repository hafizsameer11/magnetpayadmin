const TOKEN_KEY = "mp.admin.accessToken";
const USER_KEY = "mp.admin.user";

export function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSession(accessToken: string, user?: unknown) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSessionUser(): { id?: string; name?: string; platformRole?: string; phone?: string; email?: string } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { id?: string; name?: string; platformRole?: string; phone?: string; email?: string };
  } catch {
    return null;
  }
}
