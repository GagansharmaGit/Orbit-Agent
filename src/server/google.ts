import "server-only";
import { google } from "googleapis";

/**
 * Creates an authenticated Google OAuth2 client from the user's stored tokens.
 * This is used by mail and calendar routers to make real API calls.
 */
export function createGoogleClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

/**
 * Get an authenticated Gmail API client
 */
export function getGmailClient(accessToken: string, refreshToken?: string) {
  const auth = createGoogleClient(accessToken, refreshToken);
  return google.gmail({ version: "v1", auth });
}

/**
 * Get an authenticated Google Calendar API client
 */
export function getCalendarClient(accessToken: string, refreshToken?: string) {
  const auth = createGoogleClient(accessToken, refreshToken);
  return google.calendar({ version: "v3", auth });
}
