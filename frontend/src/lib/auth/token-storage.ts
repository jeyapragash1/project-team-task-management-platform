const TOKEN_KEY = "cyphlab_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}
