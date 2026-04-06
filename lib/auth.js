export function sanitizeNextPath(nextPath, fallback = "/konto") {
  if (!nextPath || typeof nextPath !== "string") {
    return fallback;
  }

  if (!nextPath.startsWith("/")) {
    return fallback;
  }

  if (nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
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
