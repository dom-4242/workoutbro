import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Read language from cookie, default to 'de'
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "de";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});