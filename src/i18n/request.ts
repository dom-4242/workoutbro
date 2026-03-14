import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateLocale } from "@/lib/locale";

export default getRequestConfig(async () => {
  // For authenticated users: always read locale from DB.
  // This is reliable after locale changes via server action — no cookie
  // propagation race conditions.
  try {
    const session = await auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { locale: true },
      });
      const locale =
        user?.locale && validateLocale(user.locale) ? user.locale : "de";
      return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
      };
    }
  } catch {
    // Fallback gracefully if auth/DB unavailable
  }

  // Unauthenticated (login page etc.): use cookie or default to 'de'
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale =
    cookieLocale && validateLocale(cookieLocale) ? cookieLocale : "de";
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
