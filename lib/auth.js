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

export function buildAuthRedirectUrl(origin, nextPath) {
  const redirect = new URL("/konto", origin);
  redirect.searchParams.set("next", sanitizeNextPath(nextPath));
  return redirect.toString();
}

export function shouldRedirectAfterAuth(nextPath) {
  return nextPath && nextPath !== "/konto";
}
