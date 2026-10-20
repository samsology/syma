import { Currency } from '@prisma/client';

export const CURRENCY_MINOR_UNIT_EXPONENT: Record<Currency, number> = {
  NGN: 2,
  USD: 2,
};

const MAX_MINOR_AMOUNT = 2_147_483_647;

export function getConfiguredPaystackCurrencies(): Currency[] {
  const configured = process.env.PAYSTACK_SUPPORTED_CURRENCIES;
  if (!configured) return [];

  const accepted = new Set<string>(Object.values(Currency));
  return [...new Set(configured.split(',').map((value) => value.trim().toUpperCase()))]
    .filter((value): value is Currency => accepted.has(value));
}

export function isPaystackCurrencyEnabled(currency: Currency): boolean {
  return getConfiguredPaystackCurrencies().includes(currency);
}

export function parseMajorAmountToMinor(value: unknown, currency: Currency): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim();
  const exponent = CURRENCY_MINOR_UNIT_EXPONENT[currency];
  if (!Number.isInteger(exponent) || exponent < 0) return null;

  const decimals = exponent === 0 ? '' : `(?:\\.(\\d{1,${exponent}}))?`;
  const match = new RegExp(`^(0|[1-9]\\d*)${decimals}$`).exec(text);
  if (!match) return null;

  try {
    const major = BigInt(match[1]);
    const fraction = exponent === 0 ? '' : (match[2] ?? '').padEnd(exponent, '0');
    const factor = BigInt(10) ** BigInt(exponent);
    const minor = major * factor + BigInt(fraction || '0');
    if (minor > BigInt(MAX_MINOR_AMOUNT)) return null;
    return Number(minor);
  } catch {
    return null;
  }
}

export function formatMinorAmount(amountMinor: number, currency: Currency): string {
  const exponent = CURRENCY_MINOR_UNIT_EXPONENT[currency];
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0 || exponent === undefined) {
    throw new Error('Invalid monetary amount.');
  }

  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(amountMinor / 10 ** exponent);
}
