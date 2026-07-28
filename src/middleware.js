import { defineMiddleware } from "astro:middleware";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth.js";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) {
    return next();
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return next();
  }

  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = verifySessionToken(token);

  if (!authenticated) {
    if (isAdminApi) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return context.redirect("/admin/login");
  }

  return next();
});
