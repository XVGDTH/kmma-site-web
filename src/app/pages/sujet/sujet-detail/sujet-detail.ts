import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, UpperCasePipe } from '@angular/common';

interface CourseModule {
  week: number;
  title: string;
  topics: string[];
}

interface CourseDetail {
  id: number;
  title: string;
  provider: string;
  providerLogo: string;
  badge: string;
  description: string;
  longDescription: string;
  duration: string;
  weeklyHours: string;
  price: number;
  level: string;
  language: string;
  startDate: string;
  image: string;
  imageAlt: string;
  modules: CourseModule[]; // ✅ AJOUT
}

interface FaqItem {
  question: string;
  answer: string;
}
interface NewsArticle {
  title: string;
  category: string;
  date: string;
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-sujet-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, UpperCasePipe],
  templateUrl: './sujet-detail.html',
  styleUrl: './sujet-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SujetDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router); // 

  private readonly allCourses: CourseDetail[] = [
    {
      id: 1,
      title: 'Fondamentaux de l\'audit interne et gestion des risques',
      provider: 'KMAA Academy',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Certifiant',
      description: 'Maîtrisez les techniques d\'audit interne pour identifier, évaluer et gérer les risques au sein des organisations burkinabè.',
      longDescription: `<p>Cette formation intensive vous prépare à devenir un acteur clé de la gouvernance d'entreprise. Vous apprendrez à mener des missions d'audit interne conformément aux normes internationales (IIA) tout en tenant compte des spécificités du tissu économique local (PME, ONG, administrations publiques).</p><p>À travers des cas pratiques réels et des simulations, vous développerez les compétences nécessaires pour élaborer une cartographie des risques, construire un plan d'audit annuel, et rédiger des rapports percutants qui apportent une réelle valeur ajoutée à la direction générale.</p>`,
      duration: '6 semaines',
      weeklyHours: '3h / semaine',
      price: 150000,
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '7 Octobre 2026',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Audit interne',
      modules: [
        { week: 1, title: 'Introduction à l\'audit interne', topics: ['Définition et rôle de l\'audit interne', 'Les normes IIA', 'Le cadre légal au Burkina Faso'] },
        { week: 2, title: 'Planification de la mission d\'audit', topics: ['Prise de connaissance de l\'entité', 'Analyse des risques', 'Programme de travail'] },
        { week: 3, title: 'Techniques d\'audit', topics: ['Entretiens et questionnaires', 'Tests de conformité', 'Sondages statistiques'] },
        { week: 4, title: 'Rédaction du rapport d\'audit', topics: ['Structure du rapport', 'Formulation des recommandations', 'Suivi des actions correctives'] },
        { week: 5, title: 'Audit des cycles spécifiques', topics: ['Cycle achats-ventes', 'Cycle paie', 'Cycle trésorerie'] },
        { week: 6, title: 'Évaluation finale', topics: ['Cas pratique complet', 'Examen de certification', 'Feedback personnalisé'] },
      ],
    },
    {
      id: 2,
      title: 'Commissariat aux comptes : Normes OHADA et ISA',
      provider: 'KMAA Audit',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Best-seller',
      description: 'Devenez un expert du commissariat aux comptes et maîtrisez les normes OHADA et ISA.',
      longDescription: `<p>Cette formation vous plonge au cœur des missions de commissariat aux comptes. Vous apprendrez à vérifier la conformité des comptes, à évaluer les risques et à rédiger des rapports d'audit légaux. Un accent particulier sera mis sur le contexte juridique OHADA et les normes internationales d'audit (ISA).</p>`,
      duration: '8 semaines',
      weeklyHours: '4h / semaine',
      price: 250000,
      level: 'Avancé',
      language: 'Français',
      startDate: '15 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Commissariat aux comptes',
      modules: [
        { week: 1, title: 'Cadre juridique du commissariat', topics: ['Rôle et responsabilités', 'Nomination et révocation', 'Déontologie'] },
        { week: 2, title: 'Normes ISA', topics: ['ISA 200 à 299', 'ISA 300 à 499', 'ISA 500 à 599'] },
        { week: 3, title: 'Évaluation des risques', topics: ['Risque d\'audit', 'Seuil de signification', 'Approche par les risques'] },
        { week: 4, title: 'Contrôle des comptes', topics: ['Vérification des actifs', 'Vérification des passifs', 'Vérification des capitaux propres'] },
        { week: 5, title: 'Rapport du commissaire', topics: ['Types de rapports', 'Certification des comptes', 'Refus de certification'] },
        { week: 6, title: 'Missions spéciales', topics: ['Audit d\'acquisition', 'Audit de fusion', 'Audit de transformation'] },
        { week: 7, title: 'Cas pratiques OHADA', topics: ['Étude de cas réels', 'Simulation de mission', 'Rédaction du rapport'] },
        { week: 8, title: 'Évaluation finale', topics: ['Examen blanc', 'Correction collective', 'Certification'] },
      ],
    },
    {
      id: 3,
      title: 'Consolidation des comptes et normes IFRS',
      provider: 'KMAA Academy',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Certifiant',
      description: 'Maîtrisez la consolidation des comptes et les normes internationales IFRS.',
      longDescription: `<p>Apprenez à établir des comptes consolidés conformément aux normes IFRS. Cette formation couvre les méthodes de consolidation, les retraitements et les obligations légales.</p>`,
      duration: '10 semaines',
      weeklyHours: '5h / semaine',
      price: 300000,
      level: 'Avancé',
      language: 'Français',
      startDate: '5 Décembre 2026',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Consolidation comptable',
      modules: [
        { week: 1, title: 'Introduction à la consolidation', topics: ['Définition et objectifs', 'Cadre juridique OHADA', 'Périmètre de consolidation'] },
        { week: 2, title: 'Méthodes de consolidation', topics: ['Intégration globale', 'Intégration proportionnelle', 'Mise en équivalence'] },
        { week: 3, title: 'Retraitements IFRS', topics: ['Retraitements des comptes sociaux', 'Homogénéisation des méthodes', 'Conversion des devises'] },
        { week: 4, title: 'Élimination des comptes réciproques', topics: ['Élimination des créances et dettes', 'Élimination des produits et charges', 'Élimination des dividendes'] },
        { week: 5, title: 'Partage des capitaux propres', topics: ['Part du groupe', 'Intérêts minoritaires', 'Écarts d\'acquisition'] },
        { week: 6, title: 'Consolidation et IFRS', topics: ['IFRS 3', 'IFRS 10', 'IFRS 11'] },
        { week: 7, title: 'Documents de synthèse consolidés', topics: ['Bilan consolidé', 'Compte de résultat consolidé', 'Annexes'] },
        { week: 8, title: 'Analyse financière des comptes consolidés', topics: ['Ratios', 'Flux de trésorerie', 'Rentabilité'] },
        { week: 9, title: 'Cas pratiques', topics: ['Groupe simple', 'Groupe complexe', 'Cas OHADA'] },
        { week: 10, title: 'Évaluation finale', topics: ['Examen de certification', 'Cas complet', 'Remise des certificats'] },
      ],
    },
    {
      id: 4,
      title: 'Stratégie de digitalisation pour les PME africaines',
      provider: 'KMAA Conseil',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Nouveau',
      description: 'Accompagnez la transformation digitale de votre entreprise.',
      longDescription: `<p>Un guide pratique pour réussir la digitalisation de votre PME.</p>`,
      duration: '4 semaines',
      weeklyHours: '2h / semaine',
      price: 100000,
      level: 'Débutant',
      language: 'Français',
      startDate: '1 Octobre 2026',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Digitalisation PME',
      modules: [
        { week: 1, title: 'Diagnostic digital', topics: ['État des lieux', 'Analyse des besoins', 'Priorisation'] },
        { week: 2, title: 'Outils digitaux', topics: ['CRM', 'ERP', 'Réseaux sociaux'] },
        { week: 3, title: 'Mise en œuvre', topics: ['Plan d\'action', 'Budget', 'Formation des équipes'] },
        { week: 4, title: 'Évaluation', topics: ['KPI', 'Retour sur investissement', 'Ajustements'] },
      ],
    },
    {
      id: 5,
      title: 'Contrôle de gestion : Outils et pilotage de la performance',
      provider: 'KMAA Academy',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Certifiant',
      description: 'Pilotez la performance de votre organisation avec des outils efficaces.',
      longDescription: `<p>Apprenez à construire des tableaux de bord et à analyser les écarts.</p>`,
      duration: '6 semaines',
      weeklyHours: '3h / semaine',
      price: 180000,
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '10 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Contrôle de gestion',
      modules: [
        { week: 1, title: 'Introduction au contrôle de gestion', topics: ['Définition et rôle', 'Positionnement dans l\'entreprise', 'Évolution'] },
        { week: 2, title: 'Comptabilité analytique', topics: ['Charges directes et indirectes', 'Méthodes de calcul des coûts', 'Coût de revient'] },
        { week: 3, title: 'Budgets', topics: ['Budget des ventes', 'Budget de production', 'Budget de trésorerie'] },
        { week: 4, title: 'Tableaux de bord', topics: ['Indicateurs de performance', 'Balanced Scorecard', 'Reporting'] },
        { week: 5, title: 'Analyse des écarts', topics: ['Écarts sur charges', 'Écarts sur produits', 'Actions correctives'] },
        { week: 6, title: 'Évaluation finale', topics: ['Cas pratique', 'Examen', 'Certification'] },
      ],
    },
    {
      id: 6,
      title: 'Fiscalité des entreprises : Optimisation et contentieux',
      provider: 'KMAA Juridique',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Best-seller',
      description: 'Maîtrisez la fiscalité des entreprises et gérez les contentieux.',
      longDescription: `<p>Un tour d'horizon complet de la fiscalité applicable aux entreprises.</p>`,
      duration: '8 semaines',
      weeklyHours: '3h / semaine',
      price: 200000,
      level: 'Avancé',
      language: 'Français',
      startDate: '20 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Fiscalité entreprise',
      modules: [
        { week: 1, title: 'Introduction à la fiscalité', topics: ['Principes fondamentaux', 'Sources du droit fiscal', 'Organisation de l\'administration fiscale'] },
        { week: 2, title: 'TVA', topics: ['Champ d\'application', 'Territorialité', 'Déclarations'] },
        { week: 3, title: 'Impôt sur les sociétés', topics: ['Champ d\'application', 'Calcul du résultat fiscal', 'Taux et paiements'] },
        { week: 4, title: 'Impôt sur le revenu', topics: ['Traitements et salaires', 'Revenus fonciers', 'BIC et BNC'] },
        { week: 5, title: 'Optimisation fiscale', topics: ['Choix de la structure', 'Régimes fiscaux', 'Incitations fiscales'] },
        { week: 6, title: 'Contentieux fiscal', topics: ['Contrôle fiscal', 'Procédures de redressement', 'Recours'] },
        { week: 7, title: 'Cas pratiques', topics: ['Étude de cas', 'Simulation de contrôle', 'Rédaction de mémoires'] },
        { week: 8, title: 'Évaluation finale', topics: ['Examen blanc', 'Correction', 'Certification'] },
      ],
    },
    {
      id: 7,
      title: 'Analyse de données avec Excel et Power BI',
      provider: 'KMAA Tech',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Nouveau',
      description: 'Transformez vos données en décisions stratégiques.',
      longDescription: `<p>Maîtrisez Excel avancé et Power BI pour analyser vos données.</p>`,
      duration: '5 semaines',
      weeklyHours: '3h / semaine',
      price: 120000,
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '5 Octobre 2026',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Analyse de données',
      modules: [
        { week: 1, title: 'Excel avancé', topics: ['Tableaux croisés dynamiques', 'Fonctions avancées', 'Power Query'] },
        { week: 2, title: 'Introduction à Power BI', topics: ['Interface', 'Connexion aux données', 'Modélisation'] },
        { week: 3, title: 'Visualisation de données', topics: ['Types de graphiques', 'Mise en forme', 'Interactivité'] },
        { week: 4, title: 'DAX', topics: ['Mesures', 'Colonnes calculées', 'Fonctions temps'] },
        { week: 5, title: 'Projet final', topics: ['Construction d\'un tableau de bord', 'Storytelling', 'Présentation'] },
      ],
    },
    {
      id: 8,
      title: 'Cybersécurité pour les dirigeants et managers',
      provider: 'KMAA Tech',
      providerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Certifiant',
      description: 'Protégez votre organisation contre les cybermenaces.',
      longDescription: `<p>Comprenez les enjeux de la cybersécurité et mettez en place une stratégie de protection.</p>`,
      duration: '3 semaines',
      weeklyHours: '2h / semaine',
      price: 90000,
      level: 'Débutant',
      language: 'Français',
      startDate: '15 Octobre 2026',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Cybersécurité',
      modules: [
        { week: 1, title: 'Panorama des menaces', topics: ['Types d\'attaques', 'Phishing', 'Rançongiciels'] },
        { week: 2, title: 'Bonnes pratiques', topics: ['Gestion des mots de passe', 'Sauvegardes', 'Mises à jour'] },
        { week: 3, title: 'Plan de réponse', topics: ['Détection', 'Réaction', 'Communication de crise'] },
      ],
    },
    {
      id: 9,
      title: 'Leadership et Management d\'équipe à distance',
      provider: 'KMAA RH',
      providerLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Best-seller',
      description: 'Développez vos compétences de leader pour manager à distance.',
      longDescription: `<p>Apprenez à fédérer et à motiver une équipe dispersée géographiquement.</p>`,
      duration: '4 semaines',
      weeklyHours: '2h / semaine',
      price: 110000,
      level: 'Intermédiaire',
      language: 'Français',
      startDate: '1 Novembre 2026',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Management équipe',
      modules: [
        { week: 1, title: 'Les fondamentaux du leadership', topics: ['Styles de leadership', 'Intelligence émotionnelle', 'Confiance'] },
        { week: 2, title: 'Communication à distance', topics: ['Outils collaboratifs', 'Réunions efficaces', 'Feedback'] },
        { week: 3, title: 'Motivation et engagement', topics: ['Reconnaissance', 'Objectifs SMART', 'Autonomie'] },
        { week: 4, title: 'Gestion de la performance', topics: ['Évaluation', 'Coaching', 'Développement des talents'] },
      ],
    },
    {
      id: 10,
      title: 'Création et gestion d\'une entreprise individuelle',
      provider: 'KMAA Conseil',
      providerLogo: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&h=200&q=80',
      badge: 'Nouveau',
      description: 'De l\'idée à la création : lancez votre entreprise.',
      longDescription: `<p>Un accompagnement pas à pas pour créer votre entreprise individuelle.</p>`,
      duration: '6 semaines',
      weeklyHours: '3h / semaine',
      price: 80000,
      level: 'Débutant',
      language: 'Français',
      startDate: '10 Octobre 2026',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80',
      imageAlt: 'Entrepreneuriat',
      modules: [
        { week: 1, title: 'L\'idée d\'entreprise', topics: ['Identification de l\'opportunité', 'Étude de marché', 'Analyse concurrentielle'] },
        { week: 2, title: 'Le business plan', topics: ['Structure', 'Prévisions financières', 'Stratégie marketing'] },
        { week: 3, title: 'Formalités juridiques', topics: ['Choix du statut', 'Immatriculation', 'Obligations comptables'] },
        { week: 4, title: 'Financement', topics: ['Sources de financement', 'Dossier bancaire', 'Aides et subventions'] },
        { week: 5, title: 'Gestion au quotidien', topics: ['Comptabilité simplifiée', 'Gestion de trésorerie', 'Fiscalité'] },
        { week: 6, title: 'Développement', topics: ['Stratégie de croissance', 'Digitalisation', 'Réseautage'] },
      ],
    },
  ];

  readonly course = signal<CourseDetail | null>(null);
  readonly activeTab = signal<string>('apercu');
  readonly openFaqIndex = signal<number | null>(null);
  readonly openWeekIndex = signal<number | null>(null); // ✅ Pour gérer l'ouverture des semaines

  readonly faqs: FaqItem[] = [
    { question: 'Comment puis-je payer pour cette formation ?', answer: 'Orange Money, Moov Money, Wave, virements bancaires.' },
    { question: 'Puis-je changer d\'avis ?', answer: 'Oui, sous 14 jours si le cours n\'a pas commencé.' },
    { question: 'Le certificat est-il reconnu ?', answer: 'Oui, nos certifications sont reconnues par les entreprises locales.' },
    { question: 'Y a-t-il des prérequis ?', answer: 'Aucune connaissance préalable n\'est requise.' },
    { question: 'Dois-je être disponible à des heures précises ?', answer: 'Non, la formation est 100% en ligne et asynchrone.' },
  ];


    // ✅ NOUVELLE SECTION : 8 actualités à afficher en bas de page
  readonly latestNews: NewsArticle[] = [
    {
      title: 'Les 5 tendances fiscales à surveiller au Burkina Faso en 2027',
      category: 'Fiscalité',
      date: '15 Oct 2026',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Tendances fiscales',
    },
    {
      title: 'Comment l\'IA transforme le métier d\'auditeur interne',
      category: 'Technologie',
      date: '10 Oct 2026',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'IA et audit',
    },
    {
      title: 'OHADA : ce qui change pour les entreprises en 2027',
      category: 'Droit des affaires',
      date: '05 Oct 2026',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Réforme OHADA',
    },
    {
      title: 'Leadership au féminin : briser le plafond de verre en Afrique',
      category: 'Management',
      date: '30 Sep 2026',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Leadership féminin',
    },
    {
      title: 'Cybersécurité : 7 erreurs fatales que commettent les PME',
      category: 'Sécurité',
      date: '25 Sep 2026',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Cybersécurité PME',
    },
    {
      title: 'Comment réussir sa transformation digitale en Afrique de l\'Ouest',
      category: 'Digital',
      date: '20 Sep 2026',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Transformation digitale',
    },
    {
      title: 'Financement des PME : les nouvelles opportunités en 2027',
      category: 'Finance',
      date: '15 Sep 2026',
      image: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Financement PME',
    },
    {
      title: 'Les soft skills les plus recherchées par les recruteurs en 2027',
      category: 'Carrière',
      date: '10 Sep 2026',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Soft skills',
    },
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const courseId = Number(idParam);
      const foundCourse = this.allCourses.find(c => c.id === courseId);
      if (foundCourse) {
        this.course.set(foundCourse);
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

  // ✅ Méthode pour ouvrir/fermer une semaine
  toggleWeek(index: number): void {
    this.openWeekIndex.update(current => current === index ? null : index);
  }

    // ✅ AJOUT : Méthode de redirection vers la connexion
  // goToEnroll(): void {
  //   const c = this.course();
  //   if (!c) return;

  //   // On redirige vers la page de connexion en passant l'ID du cours en paramètre
  //   // Une fois connecté, l'utilisateur sera redirigé vers /paiement/{id}
  //   this.router.navigate(['/compte/connexion'], {
  //     queryParams: { redirect: '/paiement/' + c.id },
  //   });
  // }
  
  goToEnroll(): void {
  const c = this.course();
  if (!c) return;

  // On passe par le login, puis on redirige vers le paiement
  this.router.navigate(['/compte/connexion'], {
    queryParams: { redirect: `/achats-cours/paiement/${c.id}` },
  });
}
}