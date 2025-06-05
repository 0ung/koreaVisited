import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import api from "@/axios/axiosConfig";
import { API_PATH } from "../constants/apiPath";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const messages = await fetchTranslations(locale);
  return {
    locale: locale,
    messages: messages,
  };
});

async function fetchTranslations(locale: String) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SPRING_API_URL;
    const response = await fetch(`${baseUrl}${API_PATH.LOCALE}/${locale}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accpet: "application/json",
      },
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`translations-${locale}`],
      },
    });

    if (!response.status) {
      console.error("번역 요청 실패1");
    }
    return response.json();
  } catch (error: any) {
    console.error(
      `Failed to fetch translations from Spring Boot for locale ${locale}:`,
      error
    );

    console.log(`Falling back to local JSON for locale: ${locale}`);
    const fallbackMessages = (await import(`../../messages/${locale}.json`))
      .default;
    return fallbackMessages;
  }
}
