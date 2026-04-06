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
