import { PrismaClient } from '@prisma/client';

async function testUrl(name: string, url: string) {
  console.log(`Testing connection for: ${name}...`);
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log(`✅ [${name}] SUCCESS:`, result);
    return true;
  } catch (err) {
    console.error(`❌ [${name}] FAILED:`, (err as Error).message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const password = 'Zm1AQDp0dQdKHZgV';
  const projectRef = 'qboaxloypjeqhdgumqun';

  // 1. Session pooler (Port 5432)
  await testUrl(
    'Session Pooler (Port 5432)',
    `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`
  );

  // 2. Transaction pooler (Port 6543 with pgbouncer=true)
  await testUrl(
    'Transaction Pooler (Port 6543 + pgbouncer)',
    `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
  );

  // 3. Direct Connection (Port 5432)
  await testUrl(
    'Direct DB (db.qboaxloypjeqhdgumqun.supabase.co:5432)',
    `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`
  );
}

main().catch(console.error);
