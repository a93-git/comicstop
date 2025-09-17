// Lightweight phone utilities for ISD selection and formatting

const COUNTRY_TO_ISD = {
  US: '+1', CA: '+1',
  GB: '+44', IE: '+353',
  AU: '+61', NZ: '+64',
  IN: '+91', PK: '+92', BD: '+880',
  DE: '+49', FR: '+33', ES: '+34', IT: '+39', NL: '+31', BE: '+32', SE: '+46', NO: '+47', DK: '+45', FI: '+358', PT: '+351', GR: '+30', CH: '+41', AT: '+43', PL: '+48', CZ: '+420', SK: '+421', HU: '+36', RO: '+40', BG: '+359', UA: '+380', RU: '+7',
  BR: '+55', MX: '+52', AR: '+54', CL: '+56', CO: '+57', PE: '+51', VE: '+58',
  JP: '+81', KR: '+82', CN: '+86', HK: '+852', SG: '+65', MY: '+60', TH: '+66', VN: '+84', PH: '+63', ID: '+62',
  ZA: '+27', NG: '+234', KE: '+254', EG: '+20', MA: '+212', TN: '+216', GH: '+233', ET: '+251',
};

export const ISD_OPTIONS = Array.from(new Set(Object.values(COUNTRY_TO_ISD)))
  .sort((a, b) => parseInt(a.replace('+', ''), 10) - parseInt(b.replace('+', ''), 10));

export function detectRegionFromLocale() {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || 'en-US';
    const match = loc.match(/[-_](\w{2})$/);
    return match ? match[1].toUpperCase() : undefined;
  } catch {
    return undefined;
  }
}

export function getDefaultISD() {
  const region = detectRegionFromLocale();
  return (region && COUNTRY_TO_ISD[region]) || '+1';
}

export function combineISDWithLocal(isd, local) {
  const trimmed = String(local || '').trim();
  if (!trimmed) return '';
  if (/^\+/.test(trimmed)) return trimmed; // already has country code
  const code = String(isd || '').trim() || '+1';
  return `${code} ${trimmed}`.trim();
}
