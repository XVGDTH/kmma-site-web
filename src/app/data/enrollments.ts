export interface Enrollment {
  courseId: string;
  progressPercent: number;
  enrolledAt: string;      // ex: '15 août 2026'
  lastAccessedAt: string;  // ex: 'Il y a 2 jours'
  certificateIssued: boolean;
}

export interface PaymentRecord {
  id: string;
  courseId: string;
  planName: string;
  amount: number;
  provider: string;
  date: string;
  status: 'paye' | 'rembourse';
}

// TODO (Salomon) : remplacer par un vrai appel API filtré sur l'apprenant connecté.
export const MY_ENROLLMENTS: Enrollment[] = [
  {
    courseId: 'comp-01',
    progressPercent: 35,
    enrolledAt: '15 août 2026',
    lastAccessedAt: 'Il y a 2 jours',
    certificateIssued: false,
  },
  {
    courseId: 'lang-08',
    progressPercent: 100,
    enrolledAt: '2 juillet 2026',
    lastAccessedAt: 'Il y a 3 semaines',
    certificateIssued: true,
  },
];

// TODO (Salomon) : remplacer par le vrai historique de paiement du backend.
export const MY_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    courseId: 'comp-01',
    planName: 'Standard',
    amount: 25000,
    provider: 'Orange Money',
    date: '15 août 2026',
    status: 'paye',
  },
];