export type PaidProgram = {
  id: string;
  name: string;
  amountKobo: number;
  currency: 'NGN';
};

export const paidPrograms: Record<string, PaidProgram> = {
  'Data-Analytics-Fundamentals': {
    id: 'Data-Analytics-Fundamentals',
    name: 'Healthcare Data Analytics',
    amountKobo: 7000000,
    currency: 'NGN',
  },
  'Python-for-Data-Science': {
    id: 'Python-for-Data-Science',
    name: 'Python for Data Science',
    amountKobo: 12000000,
    currency: 'NGN',
  },
  'Business-Intelligence': {
    id: 'Business-Intelligence',
    name: 'Business Intelligence',
    amountKobo: 15000000,
    currency: 'NGN',
  },
};

export function getPaidProgram(programId: string) {
  return paidPrograms[programId] ?? null;
}

