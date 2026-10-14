import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { EntreprisePricingPlan, getPricingForCourse } from '../../../data/pricing-plan-entreprise';


type DeliveryMode = 'En ligne' | 'Présentiel' | 'Mixte';

interface CourseModule {
  week: number;
  title: string;
  topics: string[];
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceNote?: string;
  description: string;
  popular: boolean;
  features: string[];
}

interface EntrepriseCourseDetailItem {
  id: number;
  title: string;
  provider: string;
  providerLogo: string;
  mode: DeliveryMode;
  badge: string;
  description: string;
  longDescription: string;
  duration: string;
  hoursPerWeek: string;
  level: string;
  language: string;
  startDate: string;
  image: string;
  imageAlt: string;
  modules: CourseModule[];
//   pricingPlans: PricingPlan[];
}

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-entreprise-course-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, UpperCasePipe],
  templateUrl: './entreprise-course-detail.html',
  styleUrl: './entreprise-course-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrepriseCourseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ✅ ID des formations entreprises : 10001 à 10012
private readonly allCourses: EntrepriseCourseDetailItem[] = [
    {
      id: 10001,
      title: 'Commissariat aux comptes : Normes OHADA et ISA pour les entreprises',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Mixte',
      badge: 'Certifiant',
      description: 'Formez vos équipes aux missions de commissariat aux comptes conformément aux normes OHADA et ISA.',
      longDescription: `<p>Cette formation intensive prépare vos collaborateurs à mener des missions de commissariat aux comptes en conformité avec les normes OHADA et les normes internationales d'audit (ISA).</p><p>Elle combine théorie, cas pratiques et mises en situation réelles pour garantir une application immédiate en entreprise.</p>`,
      duration: '12 semaines',
      hoursPerWeek: '6h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '15 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Commissariat aux comptes entreprise',
      modules: [
        { week: 1, title: 'Cadre juridique OHADA', topics: ['Rôle du commissaire aux comptes', 'Nomination et révocation', 'Déontologie'] },
        { week: 2, title: 'Normes ISA', topics: ['ISA 200 à 299', 'ISA 300 à 499', 'ISA 500 à 599'] },
        { week: 3, title: 'Évaluation des risques', topics: ['Risque d\'audit', 'Seuil de signification', 'Approche par les risques'] },
        { week: 4, title: 'Contrôle des comptes', topics: ['Vérification des actifs', 'Vérification des passifs', 'Vérification des capitaux propres'] },
        { week: 5, title: 'Rapport du commissaire', topics: ['Types de rapports', 'Certification des comptes', 'Refus de certification'] },
        { week: 6, title: 'Missions spéciales', topics: ['Audit d\'acquisition', 'Audit de fusion', 'Audit de transformation'] },
        { week: 7, title: 'Cas pratiques OHADA', topics: ['Étude de cas réels', 'Simulation de mission', 'Rédaction du rapport'] },
        { week: 8, title: 'Évaluation finale', topics: ['Examen blanc', 'Correction collective', 'Certification'] },
      ],

    },

    // ✅ Ajoute ici les autres cours (10002 à 10012) en copiant le même modèle
    // Pour l'exemple, je te donne juste le premier. Tu peux dupliquer et adapter.
        // ✅ COURS 10002 - Actuariat
    {
      id: 10002,
      title: 'Actuariat : Modélisation des risques et provisionnement',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'En ligne',
      badge: 'Certifiant',
      description: 'Maîtrisez les techniques actuarielles pour évaluer et provisionner les risques de votre entreprise.',
      longDescription: `<p>Cette formation avancée en actuariat vous prépare à modéliser les risques financiers, à calculer les provisions techniques et à conseiller votre direction sur les stratégies de couverture.</p><p>Un accent particulier est mis sur les applications concrètes dans le contexte africain, notamment pour les compagnies d'assurance et les institutions financières.</p>`,
      duration: '16 semaines',
      hoursPerWeek: '5h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '20 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Actuariat entreprise',
      modules: [
        { week: 1, title: 'Introduction à l\'actuariat', topics: ['Définition et rôle de l\'actuaire', 'Domaines d\'application', 'Éthique professionnelle'] },
        { week: 2, title: 'Mathématiques financières', topics: ['Valeur temps de l\'argent', 'Actualisation', 'Taux d\'intérêt'] },
        { week: 3, title: 'Théorie du risque', topics: ['Lois de probabilité', 'Espérance et variance', 'Théorème central limite'] },
        { week: 4, title: 'Assurance vie', topics: ['Tables de mortalité', 'Primes et réserves', 'Produits d\'assurance vie'] },
        { week: 5, title: 'Assurance non-vie', topics: ['Modèles de fréquence', 'Modèles de coût', 'Tarification'] },
        { week: 6, title: 'Provisionnement', topics: ['Provisions mathématiques', 'Provisions pour sinistres', 'Méthodes Chain-Ladder'] },
        { week: 7, title: 'Solvabilité II', topics: ['Pilier 1 : exigences quantitatives', 'Pilier 2 : gouvernance', 'Pilier 3 : reporting'] },
        { week: 8, title: 'Régression et modélisation', topics: ['Régression linéaire', 'Régression logistique', 'Modèles GLM'] },
        { week: 9, title: 'Séries temporelles', topics: ['ARIMA', 'Lissage exponentiel', 'Prévisions'] },
        { week: 10, title: 'Applications en finance', topics: ['Gestion de portefeuille', 'Dérivés', 'Risque de marché'] },
        { week: 11, title: 'Actuariat et big data', topics: ['Machine learning en actuariat', 'Analytique prédictive', 'Automatisation'] },
        { week: 12, title: 'Cas pratiques', topics: ['Études de cas réels', 'Travaux dirigés', 'Présentations'] },
        { week: 13, title: 'Projet final', topics: ['Choix du sujet', 'Collecte des données', 'Modélisation'] },
        { week: 14, title: 'Rédaction du mémoire', topics: ['Structure', 'Analyse des résultats', 'Recommandations'] },
        { week: 15, title: 'Soutenance', topics: ['Présentation', 'Questions du jury', 'Feedback'] },
        { week: 16, title: 'Évaluation finale', topics: ['Examen écrit', 'Certification', 'Remise des diplômes'] },
      ],

    },

    // ✅ COURS 10003 - Audit interne avancé
    {
      id: 10003,
      title: 'Audit interne avancé pour les grands groupes',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Présentiel',
      badge: 'Best-seller',
      description: 'Formation intensive en présentiel pour structurer votre fonction d\'audit interne.',
      longDescription: `<p>Cette formation intensive en présentiel prépare vos équipes à structurer et piloter une fonction d'audit interne performante au sein de grands groupes.</p><p>Elle couvre l'ensemble du cycle d'audit, de la planification à la rédaction du rapport, avec des mises en situation réelles.</p>`,
      duration: '8 semaines',
      hoursPerWeek: '12h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '5 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Audit interne avancé',
      modules: [
        { week: 1, title: 'Cadre de l\'audit interne', topics: ['Normes IIA', 'Charte d\'audit', 'Positionnement organisationnel'] },
        { week: 2, title: 'Planification annuelle', topics: ['Cartographie des risques', 'Plan d\'audit basé sur les risques', 'Allocation des ressources'] },
        { week: 3, title: 'Préparation de la mission', topics: ['Prise de connaissance', 'Analyse des processus', 'Programme de travail'] },
        { week: 4, title: 'Techniques d\'audit avancées', topics: ['Échantillonnage statistique', 'Tests de conformité', 'Tests substantifs'] },
        { week: 5, title: 'Audit des SI', topics: ['Contrôles généraux IT', 'Contrôles applicatifs', 'Cybersécurité'] },
        { week: 6, title: 'Rédaction du rapport', topics: ['Structure et contenu', 'Recommandations', 'Suivi des actions'] },
        { week: 7, title: 'Audit de la gouvernance', topics: ['Évaluation du conseil', 'Gestion des risques', 'Conformité'] },
        { week: 8, title: 'Évaluation finale', topics: ['Cas pratique complet', 'Examen', 'Certification'] },
      ],

    },

    // ✅ COURS 10004 - Expertise comptable
    {
      id: 10004,
      title: 'Expertise comptable : Consolidation et normes IFRS',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Mixte',
      badge: 'Certifiant',
      description: 'Perfectionnez vos équipes comptables sur la consolidation et les normes internationales.',
      longDescription: `<p>Cette formation complète prépare vos équipes à maîtriser la consolidation des comptes selon les normes IFRS et le référentiel OHADA.</p><p>Idéal pour les groupes souhaitant professionnaliser leur fonction comptable et financière.</p>`,
      duration: '14 semaines',
      hoursPerWeek: '7h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '10 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Expertise comptable',
      modules: [
        { week: 1, title: 'Introduction à la consolidation', topics: ['Objectifs', 'Périmètre', 'Méthodes'] },
        { week: 2, title: 'Cadre juridique OHADA', topics: ['Acte uniforme', 'Obligations', 'Sanctions'] },
        { week: 3, title: 'Normes IFRS', topics: ['IFRS 1 à 9', 'IFRS 10 à 17', 'Application pratique'] },
        { week: 4, title: 'Retraitements', topics: ['Homogénéisation', 'Conversion devises', 'Éliminations'] },
        { week: 5, title: 'Consolidation : méthode globale', topics: ['Intégration globale', 'Partage capitaux', 'Écarts d\'acquisition'] },
        { week: 6, title: 'Consolidation : autres méthodes', topics: ['Intégration proportionnelle', 'Mise en équivalence', 'Cas complexes'] },
        { week: 7, title: 'Documents de synthèse', topics: ['Bilan consolidé', 'Compte de résultat', 'Annexes'] },
        { week: 8, title: 'Analyse financière', topics: ['Ratios', 'Flux de trésorerie', 'Rentabilité'] },
        { week: 9, title: 'Cas pratiques simples', topics: ['Groupe mono-activité', 'Groupe familial'] },
        { week: 10, title: 'Cas pratiques complexes', topics: ['Groupe multi-activités', 'Groupes internationaux'] },
        { week: 11, title: 'Outils informatiques', topics: ['Logiciels de consolidation', 'Tableaux croisés', 'Automatisation'] },
        { week: 12, title: 'Projet final', topics: ['Cas complet', 'Analyse', 'Présentation'] },
        { week: 13, title: 'Révisions', topics: ['Rappels clés', 'Questions-réponses', 'Exercices'] },
        { week: 14, title: 'Évaluation finale', topics: ['Examen', 'Certification', 'Feedback'] },
      ],

    },

    // ✅ COURS 10005 - Conseil en stratégie
    {
      id: 10005,
      title: 'Conseil en stratégie et transformation digitale',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'En ligne',
      badge: 'Nouveau',
      description: 'Accompagnez la transformation digitale de vos clients avec une méthode éprouvée.',
      longDescription: `<p>Cette formation prépare vos consultants à accompagner les entreprises dans leur transformation digitale, du diagnostic à la mise en œuvre.</p><p>Elle combine frameworks stratégiques, outils digitaux et études de cas réels.</p>`,
      duration: '6 semaines',
      hoursPerWeek: '4h / semaine',
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '1 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Conseil stratégie',
      modules: [
        { week: 1, title: 'Diagnostic stratégique', topics: ['Analyse SWOT', 'Matrice BCG', 'Chaîne de valeur'] },
        { week: 2, title: 'Transformation digitale', topics: ['Maturité digitale', 'Feuille de route', 'Priorisation'] },
        { week: 3, title: 'Modèles économiques', topics: ['Business Model Canvas', 'Innovation', 'Plateformes'] },
        { week: 4, title: 'Conduite du changement', topics: ['Kotter', 'Communication', 'Formation'] },
        { week: 5, title: 'Outils digitaux', topics: ['CRM', 'ERP', 'Analytics'] },
        { week: 6, title: 'Cas pratiques', topics: ['Études de cas', 'Présentations', 'Certification'] },
      ],

    },

    // ✅ COURS 10006 - Finance d'entreprise
    {
      id: 10006,
      title: 'Finance d\'entreprise : Analyse financière et évaluation',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Mixte',
      badge: 'Certifiant',
      description: 'Maîtrisez l\'analyse financière et l\'évaluation des entreprises pour vos décisions stratégiques.',
      longDescription: `<p>Cette formation complète prépare vos équipes financières à analyser la santé financière des entreprises, à les évaluer et à conseiller la direction sur les décisions d'investissement.</p>`,
      duration: '10 semaines',
      hoursPerWeek: '5h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '15 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Finance entreprise',
      modules: [
        { week: 1, title: 'Analyse des états financiers', topics: ['Bilan', 'Compte de résultat', 'Tableau de flux'] },
        { week: 2, title: 'Ratios financiers', topics: ['Liquidité', 'Solvabilité', 'Rentabilité'] },
        { week: 3, title: 'Analyse de la trésorerie', topics: ['Flux de trésorerie', 'BFR', 'Cash-flow'] },
        { week: 4, title: 'Évaluation d\'entreprise', topics: ['DCF', 'Comparables', 'Patrimoniale'] },
        { week: 5, title: 'Décisions d\'investissement', topics: ['VAN', 'TRI', 'Délai de récupération'] },
        { week: 6, title: 'Décisions de financement', topics: ['Coût du capital', 'Structure financière', 'Levier'] },
        { week: 7, title: 'Gestion des risques', topics: ['Risque de change', 'Risque de taux', 'Couverture'] },
        { week: 8, title: 'Planification financière', topics: ['Prévisions', 'Budgets', 'Scénarios'] },
        { week: 9, title: 'Cas pratiques', topics: ['Études de cas', 'Modélisation Excel', 'Présentations'] },
        { week: 10, title: 'Évaluation finale', topics: ['Examen', 'Certification', 'Feedback'] },
      ],

    },

    // ✅ COURS 10007 - Fiscalité internationale
    {
      id: 10007,
      title: 'Fiscalité internationale et prix de transfert',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Présentiel',
      badge: 'Certifiant',
      description: 'Formation présentielle pour maîtriser la fiscalité internationale et les prix de transfert.',
      longDescription: `<p>Cette formation avancée en présentiel prépare vos équipes fiscales à maîtriser les enjeux de la fiscalité internationale et des prix de transfert.</p><p>Elle couvre les conventions fiscales, les prix de transfert et les obligations BEPS.</p>`,
      duration: '5 semaines',
      hoursPerWeek: '10h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '8 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Fiscalité internationale',
      modules: [
        { week: 1, title: 'Introduction à la fiscalité internationale', topics: ['Principes', 'Sources', 'Conventions fiscales'] },
        { week: 2, title: 'Prix de transfert', topics: ['Méthodes OCDE', 'Documentation', 'Études de comparables'] },
        { week: 3, title: 'BEPS', topics: ['Actions BEPS', 'Impact', 'Conformité'] },
        { week: 4, title: 'Optimisation fiscale', topics: ['Structures', 'Régimes', 'Risques'] },
        { week: 5, title: 'Contentieux', topics: ['Contrôles', 'Procédures', 'Recours'] },
      ],

    },

    // ✅ COURS 10008 - Data Analytics
    {
      id: 10008,
      title: 'Data Analytics pour la finance et l\'audit',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'En ligne',
      badge: 'Nouveau',
      description: 'Exploitez la data pour améliorer vos missions d\'audit et de conseil.',
      longDescription: `<p>Cette formation prépare vos équipes à exploiter les données pour améliorer leurs missions d'audit, de contrôle et de conseil.</p><p>Excel avancé, Power BI, SQL et Python appliqués à la finance.</p>`,
      duration: '8 semaines',
      hoursPerWeek: '4h / semaine',
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '25 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Data Analytics',
      modules: [
        { week: 1, title: 'Introduction à la data', topics: ['Types de données', 'Sources', 'Qualité'] },
        { week: 2, title: 'Excel avancé', topics: ['TCD', 'Power Query', 'Fonctions'] },
        { week: 3, title: 'SQL pour la finance', topics: ['Requêtes', 'Jointures', 'Agrégations'] },
        { week: 4, title: 'Power BI', topics: ['Modélisation', 'Visualisation', 'DAX'] },
        { week: 5, title: 'Python pour l\'analyse', topics: ['Pandas', 'NumPy', 'Visualisation'] },
        { week: 6, title: 'Automatisation', topics: ['Scripts', 'Scheduling', 'Reporting'] },
        { week: 7, title: 'Applications audit', topics: ['Analyse de risques', 'Détection d\'anomalies', 'Tests'] },
        { week: 8, title: 'Projet final', topics: ['Cas pratique', 'Tableau de bord', 'Présentation'] },
      ],

    },

    // ✅ COURS 10009 - Management et leadership
    {
      id: 10009,
      title: 'Management et leadership pour cadres dirigeants',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Présentiel',
      badge: 'Best-seller',
      description: 'Développez les compétences de leadership de vos managers et dirigeants.',
      longDescription: `<p>Cette formation intensive en présentiel prépare vos managers et dirigeants à développer leur leadership, à motiver leurs équipes et à piloter la performance.</p><p>Un accompagnement personnalisé pour révéler le potentiel de vos leaders.</p>`,
      duration: '4 semaines',
      hoursPerWeek: '15h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '3 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Management leadership',
      modules: [
        { week: 1, title: 'Fondamentaux du leadership', topics: ['Styles', 'Intelligence émotionnelle', 'Vision'] },
        { week: 2, title: 'Communication', topics: ['Écoute active', 'Feedback', 'Prise de parole'] },
        { week: 3, title: 'Motivation des équipes', topics: ['Reconnaissance', 'Objectifs', 'Autonomie'] },
        { week: 4, title: 'Pilotage de la performance', topics: ['Évaluation', 'Coaching', 'Développement'] },
      ],

    },

    // ✅ COURS 10010 - Cybersécurité
    {
      id: 10010,
      title: 'Cybersécurité pour les entreprises : Stratégie et gouvernance',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Mixte',
      badge: 'Certifiant',
      description: 'Protégez votre entreprise contre les cybermenaces avec une stratégie de gouvernance solide.',
      longDescription: `<p>Cette formation prépare vos équipes IT et vos dirigeants à mettre en place une stratégie de cybersécurité efficace et une gouvernance adaptée.</p>`,
      duration: '6 semaines',
      hoursPerWeek: '5h / semaine',
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '28 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Cybersécurité entreprise',
      modules: [
        { week: 1, title: 'Panorama des menaces', topics: ['Types d\'attaques', 'Acteurs', 'Tendances'] },
        { week: 2, title: 'Gouvernance', topics: ['Politiques', 'Rôles', 'Conformité'] },
        { week: 3, title: 'Sécurité technique', topics: ['Firewall', 'Antivirus', 'Chiffrement'] },
        { week: 4, title: 'Sécurité humaine', topics: ['Formation', 'Phishing', 'Bonnes pratiques'] },
        { week: 5, title: 'Réponse aux incidents', topics: ['Détection', 'Réaction', 'Communication'] },
        { week: 6, title: 'Plan de continuité', topics: ['PRA', 'Sauvegardes', 'Tests'] },
      ],

    },

    // ✅ COURS 10011 - Audit des SI
    {
      id: 10011,
      title: 'Audit des systèmes d\'information (SI)',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'En ligne',
      badge: 'Certifiant',
      description: 'Auditez la sécurité et la performance des systèmes d\'information de votre entreprise.',
      longDescription: `<p>Cette formation prépare vos équipes à auditer les systèmes d'information, à évaluer les risques IT et à recommander des améliorations.</p>`,
      duration: '7 semaines',
      hoursPerWeek: '4h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '12 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Audit SI',
      modules: [
        { week: 1, title: 'Introduction à l\'audit SI', topics: ['Objectifs', 'Normes', 'Référentiels'] },
        { week: 2, title: 'Gouvernance IT', topics: ['COBIT', 'ITIL', 'Alignement stratégique'] },
        { week: 3, title: 'Contrôles généraux', topics: ['Accès', 'Changements', 'Exploitation'] },
        { week: 4, title: 'Contrôles applicatifs', topics: ['Intégrité', 'Validation', 'Piste d\'audit'] },
        { week: 5, title: 'Cybersécurité', topics: ['Vulnérabilités', 'Tests d\'intrusion', 'SIEM'] },
        { week: 6, title: 'Continuité', topics: ['PRA', 'PCA', 'Tests'] },
        { week: 7, title: 'Rapport d\'audit SI', topics: ['Structure', 'Recommandations', 'Suivi'] },
      ],
      
    },

    // ✅ COURS 10012 - Fusion-acquisition
    {
      id: 10012,
      title: 'Commissariat aux apports et fusion-acquisition',
      provider: 'KMAA Entreprises',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      mode: 'Présentiel',
      badge: 'Best-seller',
      description: 'Formation avancée sur le commissariat aux apports et les opérations de fusion-acquisition.',
      longDescription: `<p>Cette formation avancée en présentiel prépare vos équipes aux missions de commissariat aux apports et aux opérations de fusion-acquisition.</p>`,
      duration: '6 semaines',
      hoursPerWeek: '8h / semaine',
      level: 'Avancé',
      language: 'Français',
      startDate: '18 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Fusion acquisition',
      modules: [
        { week: 1, title: 'Cadre juridique', topics: ['OHADA', 'Fusion', 'Scission'] },
        { week: 2, title: 'Commissariat aux apports', topics: ['Rôle', 'Méthodes', 'Rapport'] },
        { week: 3, title: 'Évaluation', topics: ['Méthodes', 'Choix', 'Application'] },
        { week: 4, title: 'Due diligence', topics: ['Financière', 'Juridique', 'Fiscale'] },
        { week: 5, title: 'Négociation', topics: ['Term sheet', 'Closing', 'Intégration'] },
        { week: 6, title: 'Cas pratiques', topics: ['Études de cas', 'Simulation', 'Certification'] },
      ],
    //   pricingPlans: [
    //     {
    //       id: 'basique',
    //       name: 'Basique',
    //       price: 210000,
    //       description: 'Accès individuel',
    //       popular: false,
    //       features: ['Accès complet', 'Certificat', 'Support email'],
    //     },
    //     {
    //       id: 'standard',
    //       name: 'Standard',
    //       price: 380000,
    //       description: 'Équipes de 2 à 5',
    //       popular: true,
    //       features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],
    //     },
    //     {
    //       id: 'premium',
    //       name: 'Premium',
    //       price: 580000,
    //       description: 'Équipes jusqu\'à 10',
    //       popular: false,
    //       features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],
    //     },
    //     {
    //       id: 'entreprise',
    //       name: 'Entreprise',
    //       price: 1050000,
    //       description: 'Grandes équipes',
    //       popular: false,
    //       features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],
    //     },
    //   ],
    },
  ];

//   readonly course = signal<EntrepriseCourseDetail | null>(null);
readonly course = signal<EntrepriseCourseDetailItem | null>(null);
  readonly activeTab = signal<string>('apercu');
  readonly openFaqIndex = signal<number | null>(null);
  readonly openWeekIndex = signal<number | null>(null);
  readonly selectedPlan = signal<string | null>(null);
  readonly pricingPlans = signal<EntreprisePricingPlan[]>([]);
  readonly teamSize = signal<number>(1);

  readonly faqs: FaqItem[] = [
    { question: 'Comment fonctionne la facturation entreprise ?', answer: 'Nous émettons une facture officielle avec TVA applicable. Le paiement peut se faire par virement bancaire, Orange Money, Moov Money ou Wave.' },
    { question: 'Puis-je former plus de 20 personnes ?', answer: 'Oui ! Contactez-nous pour un devis sur mesure adapté à votre effectif.' },
    { question: 'Les sessions sont-elles personnalisables ?', answer: 'Absolument. Nous adaptons le contenu, le rythme et les cas pratiques aux réalités de votre entreprise.' },
    { question: 'Y a-t-il un suivi de progression ?', answer: 'Oui, un tableau de bord manager est inclus dans les formules Premium et Entreprise.' },
    { question: 'Les formations sont-elles certifiantes ?', answer: 'Oui, chaque participant reçoit une attestation de réussite KMAA Academy reconnue par les entreprises locales.' },
  ];


ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    const courseId = Number(idParam);
    const foundCourse = this.allCourses.find(c => c.id === courseId);
    if (foundCourse) {
      this.course.set(foundCourse);
      // ✅ Récupération automatique de la grille tarifaire
      this.pricingPlans.set(getPricingForCourse(courseId));
    }
  }
}

  setTab(tab: string): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.update(current => current === index ? null : index);
  }

  toggleWeek(index: number): void {
    this.openWeekIndex.update(current => current === index ? null : index);
  }

  // ✅ Sélection d'une formule
  // ✅ Sélection d'une formule → redirige vers la connexion
  selectPlan(planId: string): void {
    const c = this.course();
    if (!c) return;

    this.selectedPlan.set(planId);

    // ✅ On redirige vers la connexion en passant TOUTES les infos nécessaires
    // this.router.navigate(['/compte/connexion'], {
    //   queryParams: {
    //     redirect: `/entreprises/devis?courseId=${c.id}&plan=${planId}&teamSize=${this.teamSize()}`,
    //   },
    // });
    // ✅ APRÈS
this.router.navigate(['/compte/connexion'], {
  queryParams: {
    redirect: `/achats-entreprise/devis?courseId=${c.id}&plan=${planId}&teamSize=${this.teamSize()}`,
  },
});
  }

  // ✅ Redirection vers la page de paiement/devis
  goToCheckout(): void {
    const c = this.course();
    const plan = this.selectedPlan();
    if (!c || !plan) return;

    this.router.navigate(['/entreprises/devis'], {
      queryParams: {
        courseId: c.id,
        plan: plan,
        teamSize: this.teamSize(),
      },
    });
  }

  // ✅ Demande de devis sur mesure
  requestCustomQuote(): void {
    const c = this.course();
    if (!c) return;

    this.router.navigate(['/contact'], {
      queryParams: {
        subject: 'devis-entreprise',
        courseId: c.id,
      },
    });
  }

  // ✅ Change la taille de l'équipe
  setTeamSize(size: number): void {
    if (size >= 1 && size <= 100) {
      this.teamSize.set(size);
    }
  }

    // ✅ Scroll vers la section des formules
scrollToFormules(): void {
  // ✅ 1. Active l'onglet "formules"
  this.activeTab.set('formules');
  
  // ✅ 2. Attend que le DOM soit mis à jour, puis scrolle
  setTimeout(() => {
    const el = document.getElementById('formules');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}



}