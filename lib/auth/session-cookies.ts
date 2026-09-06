import "server-only";

import type { NextResponse } from "next/server";
import { z } from "zod";

export const OAUTH_STATE_COOKIE = "rateio_oauth_state";
export const OAUTH_RETURN_TO_COOKIE = "rateio_oauth_return_to";
export const ACCESS_TOKEN_COOKIE = "rateio_access_token";
export const REFRESH_TOKEN_COOKIE = "rateio_refresh_token";
export const ANONYMOUS_SESSION_TOKEN_COOKIE = "rateio_anonymous_session_token";

export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
export const ANONYMOUS_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const sessionCookieDomain = process.env.RATEIO_COOKIE_DOMAIN?.trim();

export const authTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(20),
  expiresAt: z.iso.datetime(),
});

export const anonymousSessionTokenSchema = z
  .string()
  .length(64)
  .regex(/^[0-9a-f]+$/i);

export const authenticatedUserSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  name: z.string().nullable(),
  pictureUrl: z.url().nullable(),
  preferredLocale: z.string().min(2),
});

export const successResponseSchema = z.object({
  success: z.literal(true),
});

export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;
export type AnonymousSessionToken = z.infer<typeof anonymousSessionTokenSchema>;

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    ...(sessionCookieDomain ? { domain: sessionCookieDomain } : {}),
  };
}

type SessionCookieOptions = ReturnType<typeof sessionCookieOptions> & {
  name: string;
  value: string;
};

type SessionCookieStore = {
  set(options: SessionCookieOptions): unknown;
};

export function setOAuthStateCookie(
  response: NextResponse,
  state: string,
): void {
  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    ...sessionCookieOptions(OAUTH_STATE_MAX_AGE_SECONDS),
  });
}

export function clearOAuthStateCookie(response: NextResponse): void {
  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: "",
    ...sessionCookieOptions(0),
  });
}

export function setOAuthReturnToCookie(
  response: NextResponse,
  returnTo: string,
): void {
  response.cookies.set({
    name: OAUTH_RETURN_TO_COOKIE,
    value: returnTo,
    ...sessionCookieOptions(OAUTH_STATE_MAX_AGE_SECONDS),
  });
}

export function clearOAuthReturnToCookie(response: NextResponse): void {
  response.cookies.set({
    name: OAUTH_RETURN_TO_COOKIE,
    value: "",
    ...sessionCookieOptions(0),
  });
}

export function setSessionCookies(
  response: NextResponse,
  tokens: AuthTokenResponse,
): void {
  const refreshExpiresAt = Date.parse(tokens.expiresAt);
  const refreshMaxAge = Math.max(
    0,
    Math.floor((refreshExpiresAt - Date.now()) / 1000),
  );

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: tokens.accessToken,
    ...sessionCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS),
  });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: tokens.refreshToken,
    ...sessionCookieOptions(refreshMaxAge),
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    ...sessionCookieOptions(0),
  });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    ...sessionCookieOptions(0),
  });
}

export function setAnonymousSessionCookie(
  response: NextResponse,
  sessionToken: string,
): void {
  setAnonymousSessionCookieStore(response.cookies, sessionToken);
}

export function setAnonymousSessionCookieStore(
  cookieStore: SessionCookieStore,
  sessionToken: string,
): void {
  const parsedToken = anonymousSessionTokenSchema.safeParse(sessionToken);
  if (!parsedToken.success) {
    throw new Error("Invalid anonymous session token");
  }

  cookieStore.set({
    name: ANONYMOUS_SESSION_TOKEN_COOKIE,
    value: parsedToken.data,
    ...sessionCookieOptions(ANONYMOUS_SESSION_MAX_AGE_SECONDS),
  });
}

export function clearAnonymousSessionCookie(response: NextResponse): void {
  clearAnonymousSessionCookieStore(response.cookies);
}

export function clearAnonymousSessionCookieStore(
  cookieStore: SessionCookieStore,
): void {
  cookieStore.set({
    name: ANONYMOUS_SESSION_TOKEN_COOKIE,
    value: "",
    ...sessionCookieOptions(0),
  });
}

export function isCurrentAuthTokenResponse(tokens: AuthTokenResponse): boolean {
  return Date.parse(tokens.expiresAt) > Date.now();
}
