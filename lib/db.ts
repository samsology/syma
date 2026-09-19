import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getTunedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  let url = rawUrl;
  // Upgrade restrictive connection_limit=1 to allow proper concurrency in server runtime
  if (url.includes('connection_limit=1') && !url.includes('connection_limit=10')) {
    url = url.replace(/connection_limit=1(?![0-9])/, 'connection_limit=10');
  }
  // Ensure pool_timeout gives sufficient buffer for network latency
  if (!url.includes('pool_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}pool_timeout=30`;
  }
  // Ensure connect_timeout gives sufficient time for initial TLS handshake
  if (!url.includes('connect_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=15`;
  }
  return url;
}

const tunedDatabaseUrl = getTunedDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(tunedDatabaseUrl ? { datasources: { db: { url: tunedDatabaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = db;
