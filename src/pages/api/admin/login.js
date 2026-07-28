import { createSessionToken, verifyPassword, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "../../../lib/auth.js";

export const prerender = false;

export async function POST({ request, cookies, redirect }) {
  const form = await request.formData();
  const password = form.get("password");

  if (!verifyPassword(password)) {
    return redirect("/admin/login?error=1");
  }

  cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return redirect("/admin");
}
