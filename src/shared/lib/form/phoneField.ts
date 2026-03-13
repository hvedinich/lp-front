interface Country {
  code: string;
  name: string;
  dialCode: string;
  mask: string;
}

export const PHONE_COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', dialCode: '1', mask: '(###) ###-####' },
  { code: 'pl', name: 'Poland', dialCode: '48', mask: '### ### ###' },
  { code: 'at', name: 'Austria', dialCode: '43', mask: '### ### ####' },
  { code: 'be', name: 'Belgium', dialCode: '32', mask: '### ## ## ##' },
  { code: 'bg', name: 'Bulgaria', dialCode: '359', mask: '### ### ###' },
  { code: 'hr', name: 'Croatia', dialCode: '385', mask: '## ### ####' },
  { code: 'cy', name: 'Cyprus', dialCode: '357', mask: '## ### ###' },
  { code: 'cz', name: 'Czech Republic', dialCode: '420', mask: '### ### ###' },
  { code: 'dk', name: 'Denmark', dialCode: '45', mask: '## ## ## ##' },
  { code: 'ee', name: 'Estonia', dialCode: '372', mask: '### ####' },
  { code: 'fi', name: 'Finland', dialCode: '358', mask: '## ### ####' },
  { code: 'fr', name: 'France', dialCode: '33', mask: '# ## ## ## ##' },
  { code: 'de', name: 'Germany', dialCode: '49', mask: '### ### ####' },
  { code: 'gr', name: 'Greece', dialCode: '30', mask: '### ### ####' },
  { code: 'hu', name: 'Hungary', dialCode: '36', mask: '## ### ####' },
  { code: 'ie', name: 'Ireland', dialCode: '353', mask: '## ### ####' },
  { code: 'it', name: 'Italy', dialCode: '39', mask: '### ### ####' },
  { code: 'lv', name: 'Latvia', dialCode: '371', mask: '## ### ###' },
  { code: 'lt', name: 'Lithuania', dialCode: '370', mask: '### ### ###' },
  { code: 'lu', name: 'Luxembourg', dialCode: '352', mask: '### ### ###' },
  { code: 'mt', name: 'Malta', dialCode: '356', mask: '#### ####' },
  { code: 'nl', name: 'Netherlands', dialCode: '31', mask: '## ### ####' },
  { code: 'pt', name: 'Portugal', dialCode: '351', mask: '### ### ###' },
  { code: 'ro', name: 'Romania', dialCode: '40', mask: '### ### ###' },
  { code: 'sk', name: 'Slovakia', dialCode: '421', mask: '### ### ###' },
  { code: 'si', name: 'Slovenia', dialCode: '386', mask: '## ### ###' },
  { code: 'es', name: 'Spain', dialCode: '34', mask: '### ### ###' },
  { code: 'se', name: 'Sweden', dialCode: '46', mask: '## ### ## ##' },
  { code: 'ua', name: 'Ukraine', dialCode: '380', mask: '## ### ## ##' },
];

export const applyPhoneMask = (digits: string, mask: string): string => {
  let di = 0;
  let result = '';
  for (let mi = 0; mi < mask.length; mi++) {
    if (di >= digits.length) break;
    result += mask[mi] === '#' ? digits[di++] : mask[mi];
  }
  return result;
};

export const maskDigitCount = (mask: string): number =>
  mask.split('').filter((c) => c === '#').length;
