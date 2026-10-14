import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MyAcademy } from './pages/page_academie/my-academy';
import { CoursDetail } from './pages/cours-detail/cours-detail';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CoursePlayer } from './pages/course-player/course-player';
import { LiveSession } from './pages/live-session/live-session';
import { LiveSessionHost } from './pages/formateur/live-session-host/live-session-host';
import { FormateurDashboard } from './pages/formateur/dashboard/formateur-dashboard';
import { Contact } from './pages/contact/contact';
import { PaymentOtp } from './pages/payment-otp/payment-otp';
import { PaymentMethod } from './pages/payment-method/payment-method';
import { PaymentPlans } from './pages/payment-plans/payment-plans';
import { StudentSpace } from './pages/student-space/student-space';
import { Actualites } from './pages/actualites/actualite';
import { Blog } from './pages/blog/blog';
import { Apprentissage } from './pages/apprentissage/apprentissage';
import { ImporterCours } from './pages/formateur/importer-cours/importer-cours';
import { authGuard } from './shared/auth.guard';
import { staffGuard } from './shared/role.guard';
import { CreerCours } from './pages/formateur/creer-cours/creer-cours';
import { studentGuard } from './shared/student-guard';
import { Newsletter } from './pages/newsletter/newsletter';
import { Apprendre } from './pages/apprendre/apprendre';


export const routes: Routes = [
  { path: '', component: Home, title: 'KMAA' },
  { path: 'academy', component: MyAcademy },

  // Redirection vers mes cours
  {
    path: 'mes-cours/:subjectId',
    loadComponent: () =>
      import('./pages/home/sections/mes-cours/mes-cours').then((m) => m.MesCours),
  },

  // Redirection vers le détail de chaque cours
  { path: 'cours/:id', component: CoursDetail },

  // ============================================================
  // AUTHENTIFICATION (publiques)
  // ============================================================
  { path: 'compte/connexion', component: Login },
  { path: 'compte/inscription', component: Register },

  // ============================================================
  // ESPACE APPRENANT (protégé)
  // ============================================================
  {
    path: 'compte/espace',
    component: StudentSpace,
    canActivate: [authGuard, studentGuard],
  },

  {
    path: 'apprentissage/:id',
    component: CoursePlayer,
    canActivate: [authGuard],
    title: 'Mon apprentissage — KMAA',
  },

  {
    path: 'apprentissage/:id/direct',
    component: LiveSession,
    canActivate: [authGuard],
  },

  // ============================================================
  // ESPACE FORMATEUR (protégé : rôle staff)
  // ============================================================
  {
    path: 'formateur/tableau-de-bord',
    component: FormateurDashboard,
    canActivate: [authGuard, staffGuard],
  },
  {
    path: 'formateur/cours/:id/direct',
    component: LiveSessionHost,
    canActivate: [authGuard, staffGuard],
  },
  {
    path: 'formateur/importer-cours/:courseId',
    component: ImporterCours,
    canActivate: [authGuard, staffGuard],
    title: 'Importer un cours — KMAA',
  },
  {
    path: 'formateur/nouveau-cours',
    component: CreerCours,
    canActivate: [authGuard, staffGuard],
  },

  // ============================================================
  // PAGES PUBLIQUES
  // ============================================================
  { path: 'contact', component: Contact },

  // Paiements
  { path: 'paiement/:id', component: PaymentPlans },
  { path: 'paiement/:id/moyen', component: PaymentMethod },
  { path: 'paiement/:id/numero', component: PaymentOtp },

  // Actualités
  { path: 'actualites', component: Actualites, title: 'KMAA Actualités' },
  {
    path: 'actualites/:slug',
    loadComponent: () =>
      import('./pages/actualite-detail/actualite-detail').then((m) => m.ActualiteDetail),
    title: 'KMAA Article',
  },
  { path: 'blog', component: Blog },

  // Équipe
  {
    path: 'equipe',
    loadComponent: () =>
      import('./pages/equipe/equipe').then((m) => m.Equipe),
    title: 'KMAA Équipe',
  },

  // Emploi
  {
    path: 'emploi',
    loadComponent: () =>
      import('./pages/emploi/emploi').then((m) => m.Emploi),
    title: 'Emploi & Carrières — KMAA',
  },
  {
    path: 'emploi/:id',
    loadComponent: () =>
      import('./pages/emploi-detail/emploi-detail').then((m) => m.EmploiDetail),
    title: "Offre d'emploi — KMAA",
  },

  // Masterclass
  {
    path: 'masterclass',
    loadComponent: () =>
      import('./pages/masterclass/masterclass').then((m) => m.Masterclass),
  },

  // Outils
  {
    path: 'calendrier-fiscal',
    loadComponent: () =>
      import('./pages/fiscal-calendar/fiscal-calendar').then((m) => m.FiscalCalendar),
  },
  {
    path: 'modeles-documents',
    loadComponent: () =>
      import('./pages/document-models/document-models').then((m) => m.DocumentModels),
  },
  {
    path: 'simulateur',
    loadComponent: () =>
      import('./pages/fiscal-simulator/fiscal-simulator').then((m) => m.FiscalSimulator),
  },

  // Newsletter
  { path: 'newsletter', component: Newsletter, title: 'KMAA Brief — Newsletter' },

  // ============================================================
  // TABLEAU DE BORD APPRENANT (protégé)
  // ============================================================
  {
    path: 'apprendre',
    component: Apprendre,
    canActivate: [authGuard, studentGuard],
    title: 'Mon tableau de bord — KMAA',
  },

  // Syllabus (HEC Paris)
  {
    path: 'formations/:slug/syllabus',
    loadComponent: () =>
      import('./pages/syllabus/syllabus').then((m) => m.Syllabus),
  },

  // ============================================================
  // FORMATIONS PRÉSENTIELLES (formateur)
  // ============================================================
  {
    path: 'formateur/formations-presentielles',
    loadComponent: () =>
      import('./pages/formateur/formations-presentielles/formations-presentielles')
        .then(m => m.FormationsPresentielles),
    canActivate: [authGuard, staffGuard],
    title: 'Formations présentielles — KMAA',
  },
  {
    path: 'formateur/formations-presentielles/:id/participants',
    loadComponent: () =>
      import('./pages/formateur/formations-presentielles/participants/participants')
        .then(m => m.ParticipantsPage),
    canActivate: [authGuard, staffGuard],
    title: 'Participants — KMAA',
  },

  // ============================================================
  // CATALOGUE / SUJETS
  // ============================================================
  {
    path: 'sujets',
    loadComponent: () =>
      import('./pages/sujet/sujet').then((m) => m.Sujet),
  },
  {
    path: 'sujets/cours/:id',
    loadComponent: () =>
      import('./pages/sujet/sujet-detail/sujet-detail').then((m) => m.SujetDetail),
    title: 'Détail du cours — KMAA Academy',
  },

  // ============================================================
  // ENTREPRISES
  // ============================================================
  {
    path: 'entreprises/formations',
    loadComponent: () =>
      import('./pages/entreprise-course/entreprise-course').then((m) => m.EntrepriseCourse),
    title: 'Formations pour Entreprises — KMAA Academy',
  },
  {
    path: 'entreprises/formation/:id',
    loadComponent: () =>
      import('./pages/entreprise-course/entreprise-course-detail/entreprise-course-detail')
        .then((m) => m.EntrepriseCourseDetail),
    title: 'Détail de la formation — KMAA Entreprises',
  },

  // ============================================================
  // ✅ PARCOURS D'ACHAT (nouveau — simulation paiement)
  // ============================================================
  {
    path: 'achats-cours/paiement/:id',
    loadComponent: () =>
      import('./achats-cours/paiement.component').then(m => m.PaiementComponent),
    title: 'Paiement — KMAA Academy',
  },
  {
    path: 'achats-cours/confirmation/:id',
    loadComponent: () =>
      import('./achats-cours/confirmation-paiement.component').then(
        m => m.ConfirmationPaiementComponent
      ),
    title: 'Confirmation de paiement — KMAA Academy',
  },






  // ============================================================
// ACHATS ENTREPRISE (abonnements)
// ============================================================

// ============================================================
// ACHATS ENTREPRISE (abonnements)
// ============================================================
{
  path: 'achats-entreprise/devis',
  loadComponent: () =>
    import('./achats-entreprise/devis-entreprise.component')
      .then(m => m.DevisEntrepriseComponent),
  canActivate: [authGuard],
  title: 'Devis Entreprise — KMAA',
},
{
  path: 'achats-entreprise/paiement',
  loadComponent: () =>
    import('./achats-entreprise/paiement-entreprise.component')
      .then(m => m.PaiementEntrepriseComponent),
  canActivate: [authGuard],
  title: 'Paiement Entreprise — KMAA',
},
{
  path: 'achats-entreprise/confirmation',
  loadComponent: () =>
    import('./achats-entreprise/confirmation-entreprise.component')
      .then(m => m.ConfirmationEntrepriseComponent),
  canActivate: [authGuard],
  title: 'Confirmation — KMAA',
},
{
  path: 'achats-entreprise/licences',
  loadComponent: () =>
    import('./achats-entreprise/licences-entreprise.component')
      .then(m => m.LicencesEntrepriseComponent),
  canActivate: [authGuard],
  title: 'Mes licences — KMAA',
},



// nouvelles routes pour la page commandes et vues d"ensembles des commandes clients via plateforme

{
  path: 'compte/mes-commandes',
  loadComponent: () =>
    import('./pages/compte/mes-commandes/mes-commandes')
      .then(m => m.MesCommandes),
  canActivate: [authGuard],
  title: 'Mes commandes — KMAA',
},


  // ============================================================
  // FALLBACK
  // ============================================================
  { path: '**', redirectTo: '' },
];