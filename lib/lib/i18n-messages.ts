export type AppLocale = 'es' | 'en'

export const messages: Record<AppLocale, Record<string, string>> = {
  es: {
    'topbar.langEs': 'Español',
    'topbar.langEn': 'Inglés',
  },
  en: {
    'topbar.langEs': 'Spanish',
    'topbar.langEn': 'English',
  },
}