const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  'Europe/Kyiv': 'ua',
  'Europe/Uzhgorod': 'ua',
  'Europe/Zaporozhye': 'ua',
  'Europe/Simferopol': 'ua',
  'Europe/Moscow': 'ru',
  'Europe/Kaliningrad': 'ru',
  'Europe/Warsaw': 'pl',
  'Europe/Berlin': 'de',
  'Europe/Paris': 'fr',
  'Europe/London': 'gb',
  'Europe/Madrid': 'es',
  'Europe/Rome': 'it',
  'Europe/Prague': 'cz',
  'Europe/Vienna': 'at',
  'Europe/Bratislava': 'sk',
  'Europe/Budapest': 'hu',
  'Europe/Bucharest': 'ro',
  'Europe/Sofia': 'bg',
  'Europe/Athens': 'gr',
  'Europe/Stockholm': 'se',
  'Europe/Oslo': 'no',
  'Europe/Copenhagen': 'dk',
  'Europe/Helsinki': 'fi',
  'Europe/Vilnius': 'lt',
  'Europe/Riga': 'lv',
  'Europe/Tallinn': 'ee',
  'Europe/Dublin': 'ie',
  'Europe/Lisbon': 'pt',
  'Europe/Amsterdam': 'nl',
  'Europe/Brussels': 'be',
  'Europe/Luxembourg': 'lu',
  'Europe/Monaco': 'mc',
  'Europe/Vaduz': 'li',
  'Europe/Malta': 'mt',
  'Europe/Ljubljana': 'si',
  'Europe/Zagreb': 'hr',
  'Europe/Sarajevo': 'ba',
  'Europe/Podgorica': 'me',
  'Europe/Belgrade': 'rs',
  'Europe/Skopje': 'mk',
  'Europe/Tirane': 'al',
  'Europe/Chisinau': 'md',
  'Europe/Minsk': 'by',
  'Europe/Istanbul': 'tr',
  'America/New_York': 'us',
  'America/Chicago': 'us',
  'America/Denver': 'us',
  'America/Los_Angeles': 'us',
  'America/Phoenix': 'us',
  'America/Anchorage': 'us',
  'America/Honolulu': 'us',
  'America/Toronto': 'ca',
  'America/Vancouver': 'ca',
  'America/Montreal': 'ca',
  'America/Mexico_City': 'mx',
  'America/Sao_Paulo': 'br',
  'America/Argentina/Buenos_Aires': 'ar',
  'America/Santiago': 'cl',
  'America/Bogota': 'co',
  'America/Lima': 'pe',
  'Asia/Tokyo': 'jp',
  'Asia/Shanghai': 'cn',
  'Asia/Seoul': 'kr',
  'Asia/Dubai': 'ae',
  'Asia/Jerusalem': 'il',
  'Asia/Kolkata': 'in',
  'Asia/Bangkok': 'th',
  'Asia/Singapore': 'sg',
  'Asia/Hong_Kong': 'hk',
  'Asia/Taipei': 'tw',
  'Australia/Sydney': 'au',
  'Australia/Melbourne': 'au',
  'Australia/Perth': 'au',
  'Pacific/Auckland': 'nz',
  'Africa/Cairo': 'eg',
  'Africa/Casablanca': 'ma',
  'Africa/Johannesburg': 'za',
  'Africa/Lagos': 'ng',
  'Africa/Nairobi': 'ke',
};

export function detectBrowserCountry(): string | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromTz = TIMEZONE_COUNTRY_MAP[timezone];
    if (fromTz) return fromTz;
  } catch {
    /* Intl not available */
  }

  try {
    const lang = navigator.language;
    const parts = lang.split('-');
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toLowerCase();
      if (/^[a-z]{2}$/.test(region)) {
        return region;
      }
    }
  } catch {
    /* navigator not available */
  }

  return null;
}
