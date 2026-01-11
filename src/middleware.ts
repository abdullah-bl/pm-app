import { defineMiddleware } from "astro:middleware";
import { isAuth } from "@/lib/isAuth";
import { languages, defaultLang, type Lang } from "@/i18n/ui";
import pb from "./client";
import type { TypedPocketBase } from "./types";

// Routes that don't require authentication (without locale prefix)
const PUBLIC_ROUTES = ["/login"] as const;

const locales = Object.keys(languages) as Lang[];

/**
 * Extract locale from pathname
 * Returns the locale if valid, otherwise null
 */
function getLocaleFromPath(pathname: string): Lang | null {
    const segment = pathname.split("/")[1];
    return locales.includes(segment as Lang) ? (segment as Lang) : null;
}

/**
 * Check if a path is public (doesn't require auth)
 */
function isPublicPath(pathname: string): boolean {
    // API routes are always public (handled separately)
    if (pathname.startsWith("/api/")) return true;

    // Get the path without locale prefix
    const locale = getLocaleFromPath(pathname);
    const pathWithoutLocale = locale
        ? pathname.replace(`/${locale}`, "") || "/"
        : pathname;

    return PUBLIC_ROUTES.includes(pathWithoutLocale as (typeof PUBLIC_ROUTES)[number]);
}

export const onRequest = defineMiddleware((context, next) => {
    const { pathname } = context.url;

    // Skip locale redirect for API routes
    if (pathname.startsWith("/api/")) {
        return next();
    }

    // Redirect non-locale paths to default locale
    const locale = getLocaleFromPath(pathname);
    if (!locale) {
        const newPath = `/${defaultLang}${pathname === "/" ? "" : pathname}`;
        return Response.redirect(new URL(newPath, context.url), 302);
    }

    // Allow public routes without auth
    if (isPublicPath(pathname)) {
        return next();
    }

    // Auth check for protected routes
    if (!isAuth(context.cookies)) {
        return Response.redirect(new URL(`/${locale}/login`, context.url), 302);
    }

    // Load auth store from cookie
    pb.authStore.loadFromCookie(context.cookies.get("pb_auth")?.value || "");

    // set auth store to locals
    context.locals.pb = pb as unknown as TypedPocketBase;

    return next();
});

