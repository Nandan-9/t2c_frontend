const GOOGLE_OAUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_AUTH_URL =
  `${GOOGLE_OAUTH_BASE}?` +
  `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}` +
  `&response_type=code` +
  `&scope=openid%20email%20profile` +
  `&access_type=offline` +
  `&prompt=consent`;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const ROUTES = {
  login: "/login",
  callback: "/auth/callback",
  setupUsername: "/setup-username",
  home: "/",
} as const;
