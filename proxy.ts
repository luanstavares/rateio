import { NextRequest, NextResponse } from "next/server";
import { refreshSessionTokens } from "./lib/auth/session-refresh";
import {
  ACCESS_TOKEN_COOKIE,
  clearSessionCookies,
  REFRESH_TOKEN_COOKIE,
  setSessionCookies,
} from "./lib/auth/session-cookies";

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

type AccessTokenPayload = {
  exp?: unknown;
};

function accessTokenExpiresAt(accessToken: string): number | null {
  const payload = accessToken.split(".")[1];
  if (!payload) return null;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);
    if (typeof parsed !== "object" || parsed === null) return null;

    const expiration = (parsed as AccessTokenPayload).exp;
    return typeof expiration === "number" && Number.isFinite(expiration)
      ? expiration * 1000
      : null;
  } catch {
    return null;
  }
}

function requestWithSessionCookies(
  request: NextRequest,
  accessToken: string,
  refreshToken: string,
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const requestCookies = new Map(
    request.cookies.getAll().map(({ name, value }) => [name, value]),
  );
  requestCookies.set(ACCESS_TOKEN_COOKIE, accessToken);
  requestCookies.set(REFRESH_TOKEN_COOKIE, refreshToken);
  requestHeaders.set(
    "cookie",
    [...requestCookies]
      .map(([name, value]) => `${name}=${value}`)
      .join("; "),
  );

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessTokenExpiry =
    accessToken === undefined ? null : accessTokenExpiresAt(accessToken);
  if (
    accessToken !== undefined &&
    accessTokenExpiry !== null &&
    accessTokenExpiry > Date.now()
  ) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken === undefined) {
    if (accessToken !== undefined) {
      const response = NextResponse.next();
      clearSessionCookies(response);
      return response;
    }
    return NextResponse.next();
  }

  const tokens = await refreshSessionTokens(refreshToken);
  if (tokens === null) {
    const response = NextResponse.next();
    clearSessionCookies(response);
    return response;
  }

  const response = requestWithSessionCookies(
    request,
    tokens.accessToken,
    tokens.refreshToken,
  );
  setSessionCookies(response, tokens);
  return response;
}
