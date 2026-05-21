import "server-only";

import {readdir, readFile} from "node:fs/promises";
import path from "node:path";

import type {AbstractIntlMessages} from "next-intl";
import {getRequestConfig} from "next-intl/server";

import {routing} from "./config";

function isSupportedLocale(locale: string | undefined): locale is string {
  const supportedLocales: readonly string[] = routing.locales;

  return typeof locale === "string" && supportedLocales.includes(locale);
}

export async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const localeDirectory = path.join(process.cwd(), "messages", locale);
  const files = await readdir(localeDirectory, {withFileTypes: true});
  const messages: AbstractIntlMessages = {};

  for (const file of files
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(localeDirectory, file.name);
    const content = await readFile(filePath, "utf8");

    Object.assign(messages, JSON.parse(content) as AbstractIntlMessages);
  }

  return messages;
}

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {locale, messages: await loadMessages(locale)};
});
