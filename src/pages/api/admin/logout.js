import { SESSION_COOKIE_NAME } from "../../../lib/auth.js";

export const prerender = false;

export async function POST({ cookies, redirect }) {
  cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
  return redirect("/admin/login");
}
