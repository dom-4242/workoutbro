export const SUPPORTED_LOCALES = ["de", "pt", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function validateLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}
