// lib/getRequestCookie.ts
import { SessionUser } from "@/api/user";
import { unsealData } from "iron-session";
import { ReadonlyRequestCookies } from "next/dist/server/app-render";

/**
 * Can be called in page/layout server component.
 * @param cookies ReadonlyRequestCookies
 * @returns SessionUser or null
 */
export async function getRequestCookie(
  cookies: ReadonlyRequestCookies
): Promise<SessionUser | null> {
  const cookieName = process.env.SESSION_COOKIE_NAME as string;
  const found = cookies.get(cookieName);

  if (!found) return null;

  const { user } = await unsealData(found.value, {
    password: process.env.SESSION_COOKIE_PASSWORD as string,
  });

  return user as unknown as SessionUser;
}
