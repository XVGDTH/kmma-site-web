// ============================================================
// GRILLES TARIFAIRES POUR LES FORMATIONS ENTREPRISES
// ============================================================

export interface EntreprisePricingPlan {
  id: string;
  name: string;
  price: number;          // en FCFA (par apprenant)
  badge?: string;
  description: string;
  features: string[];
  popular: boolean; 
  maxTeamSize: number;    // nombre max d'apprenants inclus
}

// ============================================================
// 12 GRILLES TARIFAIRES (une par formation)
// ============================================================

// Grille 10001 - Commissariat aux comptes
export const PRICING_10001: EntreprisePricingPlan[] = [
  {
    id: 'basique',
    name: 'Basique',
    price: 150000,
    description: 'Accès individuel pour un collaborateur',
    features: ['Accès complet au cours', 'Certificat de réussite', 'Support par email'],
     popular: false,
    maxTeamSize: 1,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 250000,
    badge: 'Populaire',
    description: 'Idéal pour les équipes de 2 à 5 personnes',
    features: ['Tout ce qui est inclus dans Basique', 'Correction personnalisée des devoirs', 'Accès aux séances en direct', 'Jusqu\'à 5 apprenants'],
     popular: true,
    maxTeamSize: 5,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 400000,
    description: 'Pour les équipes jusqu\'à 10 personnes',
    features: ['Tout ce qui est inclus dans Standard', 'Coaching individuel (2 séances)', 'Accès prioritaire aux nouvelles sessions', 'Jusqu\'à 10 apprenants'],
     popular: false,
    maxTeamSize: 10,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: 750000,
    description: 'Solution complète pour les grandes équipes',
    features: ['Tout ce qui est inclus dans Premium', 'Jusqu\'à 20 apprenants inclus', 'Rapport de progression pour le manager', 'Sessions intra-entreprise possibles'],
     popular: false,
    maxTeamSize: 20,
  },
];

// Grille 10002 - Actuariat
export const PRICING_10002: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 250000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 450000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 700000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 1200000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10003 - Audit interne avancé
export const PRICING_10003: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 180000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 320000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 500000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 900000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10004 - Expertise comptable
export const PRICING_10004: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 200000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 350000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 550000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 1000000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10005 - Conseil en stratégie
export const PRICING_10005: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 120000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 220000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 380000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 700000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10006 - Finance d'entreprise
export const PRICING_10006: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 160000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 280000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 450000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 850000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10007 - Fiscalité internationale
export const PRICING_10007: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 190000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 340000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 520000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 950000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10008 - Data Analytics
export const PRICING_10008: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 140000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 250000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 400000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 750000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10009 - Management et leadership
export const PRICING_10009: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 170000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 300000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 480000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 880000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10010 - Cybersécurité
export const PRICING_10010: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 130000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 240000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 390000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 720000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10011 - Audit SI
export const PRICING_10011: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 135000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 245000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 395000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 730000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// Grille 10012 - Fusion-acquisition
export const PRICING_10012: EntreprisePricingPlan[] = [
  { id: 'basique', name: 'Basique', price: 210000, description: 'Accès individuel', features: ['Accès complet', 'Certificat', 'Support email'],  popular: false, maxTeamSize: 1 },
  { id: 'standard', name: 'Standard', price: 380000, badge: 'Populaire', description: 'Équipes de 2 à 5', features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],  popular: true, maxTeamSize: 5 },
  { id: 'premium', name: 'Premium', price: 580000, description: 'Équipes jusqu\'à 10', features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],  popular: false, maxTeamSize: 10 },
  { id: 'entreprise', name: 'Entreprise', price: 1050000, description: 'Grandes équipes', features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],  popular: false, maxTeamSize: 20 },
];

// ============================================================
// FONCTION UTILITAIRE : Récupérer la grille selon l'ID
// ============================================================
export function getPricingForCourse(courseId: number): EntreprisePricingPlan[] {
  const map: Record<number, EntreprisePricingPlan[]> = {
    10001: PRICING_10001,
    10002: PRICING_10002,
    10003: PRICING_10003,
    10004: PRICING_10004,
    10005: PRICING_10005,
    10006: PRICING_10006,
    10007: PRICING_10007,
    10008: PRICING_10008,
    10009: PRICING_10009,
    10010: PRICING_10010,
    10011: PRICING_10011,
    10012: PRICING_10012,
  };
  return map[courseId] ?? PRICING_10001;
}