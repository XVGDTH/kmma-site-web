export interface PricingPlan {
  id: string;
  name: string;
  price: number;           // en FCFA
  badge?: string;
  features: string[];
  featured: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basique',
    price: 15000,
    features: [
      'Accès complet au cours',
      'Certificat de réussite',
      'Support par email',
    ],
    featured: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 25000,
    badge: 'Populaire',
    features: [
      'Tout ce qui est inclus dans Basique',
      'Correction personnalisée des devoirs',
      'Accès aux séances en direct',
    ],
    featured: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 40000,
    features: [
      'Tout ce qui est inclus dans Standard',
      'Coaching individuel (2 séances)',
      'Accès prioritaire aux nouvelles sessions',
    ],
    featured: false,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: 75000,
    features: [
      'Tout ce qui est inclus dans Premium',
      'Jusqu\'à 5 apprenants inclus',
      'Rapport de progression pour le manager',
    ],
    featured: false,
  },
];

export type PaymentProvider = 'orange' | 'moov' | 'coris';

export interface PaymentProviderInfo {
  id: PaymentProvider;
  name: string;
  color: string;
}

export const PAYMENT_PROVIDERS: PaymentProviderInfo[] = [
  { id: 'orange', name: 'Orange Money', color: '#ff6600' },
  { id: 'moov', name: 'Moov Money', color: '#0072bc' },
  { id: 'coris', name: 'Coris Money', color: '#0f9b4e' },
];