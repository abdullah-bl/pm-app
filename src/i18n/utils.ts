import { ui, defaultLang, type Lang } from "./ui";

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname;
  const lang = getLangFromUrl(url);

  // If it's the default language without prefix, return the path as-is
  if (lang === defaultLang && !pathname.startsWith(`/${lang}/`)) {
    return pathname;
  }

  // Remove the language prefix
  const pathWithoutLang = pathname.replace(`/${lang}`, "") || "/";
  return pathWithoutLang;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  // With [locale] dynamic routing, always add the locale prefix
  return `/${lang}${path === "/" ? "" : path}`;
}

export function isRtl(lang: Lang): boolean {
  return lang === "ar";
}

export function getDirection(lang: Lang): "ltr" | "rtl" {
  return isRtl(lang) ? "rtl" : "ltr";
}

// Format currency based on locale
export function formatCurrency(amount: number, lang: Lang): string {
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat('en-US', {
    style: "currency",
    currency: lang === "ar" ? "SAR" : "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date based on locale
export function formatDate(date: string, lang: Lang, options?: Intl.DateTimeFormatOptions): string {
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(locale, options || defaultOptions);
}

export function formatDateFull(date: string, lang: Lang): string {
  return formatDate(date, lang, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
