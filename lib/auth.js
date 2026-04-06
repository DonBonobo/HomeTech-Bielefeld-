function stripBrokenPathChars(value) {
  const decoded = value.includes("%")
    ? (() => {
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      })()
    : value;

  return decoded
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\u2060\uFEFF\uFFFD]/g, "")
    .trim();
}

const AUTH_HASH_KEYS = [
  "access_token",
  "refresh_token",
  "expires_in",
  "expires_at",
  "token_type",
  "provider_token",
  "provider_refresh_token",
  "error",
  "error_code",
  "error_description",
  "type",
];

export function sanitizePathname(pathname, fallback = "/") {
  if (!pathname || typeof pathname !== "string") {
    return fallback;
  }

  const cleaned = stripBrokenPathChars(pathname).replace(/\/{2,}/g, "/");
  if (!cleaned.startsWith("/")) {
    return fallback;
  }
  if (cleaned.startsWith("//")) {
    return fallback;
  }
  return cleaned || fallback;
}

export function sanitizeNextPath(nextPath, fallback = "/konto") {
  if (!nextPath || typeof nextPath !== "string") {
    return fallback;
  }

  const cleaned = stripBrokenPathChars(nextPath);
  if (!cleaned.startsWith("/")) {
    return fallback;
  }

  if (cleaned.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(cleaned, "https://hometech.local");
    if (url.origin !== "https://hometech.local") {
      return fallback;
    }
    return `${sanitizePathname(url.pathname, fallback)}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function buildAuthRedirectUrl(origin, nextPath, extraParams = {}) {
  const redirect = new URL("/konto", origin);
  redirect.searchParams.set("next", sanitizeNextPath(nextPath));
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value) {
      redirect.searchParams.set(key, String(value));
    }
  });
  return redirect.toString();
}

export function shouldRedirectAfterAuth(nextPath) {
  return nextPath && nextPath !== "/konto";
}

export function hasAuthLikeHash(hash) {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  if (hash === "#") {
    return true;
  }

  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  return AUTH_HASH_KEYS.some((key) => params.has(key));
}

export function normalizeAuthReturnUrl(currentUrl, fallbackPath = "/konto", pendingRedirect = "/konto") {
  try {
    const url = new URL(currentUrl, "https://hometech.local");
    if (!hasAuthLikeHash(url.hash)) {
      return null;
    }

    const cleanedPath = sanitizePathname(url.pathname, fallbackPath);
    const targetPath = cleanedPath === "/" ? fallbackPath : cleanedPath;
    const normalized = new URL(targetPath, url.origin);

    for (const [key, value] of url.searchParams.entries()) {
      if (key === "next" || key === "mode") {
        normalized.searchParams.set(key, value);
      }
    }

    if (!normalized.searchParams.has("next") && pendingRedirect && pendingRedirect !== "/konto") {
      normalized.searchParams.set("next", sanitizeNextPath(pendingRedirect, "/konto"));
    }

    return `${normalized.pathname}${normalized.search}`;
  } catch {
    return null;
  }
}
