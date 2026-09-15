export type PaystackEnvironment = 'test' | 'live' | 'unconfigured';

export type SafePaystackConfig = {
  isConfigured: boolean;
  environment: PaystackEnvironment;
  publicKeyMasked: string | null;
  secretKeyMasked: string | null;
};

export function getPaystackSecretKey(): string | undefined {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  return key || undefined;
}

export function getPaystackPublicKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
  return key || undefined;
}

export function isPaystackConfigured(): boolean {
  const key = getPaystackSecretKey();
  return Boolean(key && key.length > 0);
}

export function getPaystackEnvironment(): PaystackEnvironment {
  const key = getPaystackSecretKey();
  if (!key) return 'unconfigured';
  if (key.startsWith('sk_test_')) return 'test';
  if (key.startsWith('sk_live_')) return 'live';
  return 'test';
}

export function maskKey(key?: string | null): string | null {
  if (!key) return null;
  if (key.length <= 8) return '***';
  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}

export function getSafePaystackConfig(): SafePaystackConfig {
  const secretKey = getPaystackSecretKey();
  const publicKey = getPaystackPublicKey();

  return {
    isConfigured: isPaystackConfigured(),
    environment: getPaystackEnvironment(),
    publicKeyMasked: maskKey(publicKey),
    secretKeyMasked: maskKey(secretKey),
  };
}
