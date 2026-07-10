/** Cameroon mobile: 9 digits starting with 6 (e.g. 678123456). */
const CM_MOBILE_REGEX = /^6\d{8}$/;

/** Strip non-digits and cap at 9 characters. */
export function normalizeCmPhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 9);
}

export function isValidCmMobile(phone: string): boolean {
  return CM_MOBILE_REGEX.test(normalizeCmPhone(phone));
}

export const CM_PHONE_HINT = '9 chiffres, commence par 6 (ex: 678123456)';
