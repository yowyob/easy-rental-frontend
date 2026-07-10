import { fr } from '../locales/fr';
import { en } from '../locales/en';

export type ClientLang = 'FR' | 'EN';

export function useClientI18n(lang: ClientLang) {
  return lang === 'EN' ? en : fr;
}
