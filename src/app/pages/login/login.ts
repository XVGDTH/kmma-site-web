import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnDestroy {

  // ============================================================
  // ÉTAT DU FORMULAIRE
  // ============================================================
  email = '';
  password = '';
  rememberMe = false;
  obscurePassword = true;
  isLoading = false;

  // ============================================================
  // SIGNAUX
  // ============================================================
  readonly errorMessage = signal<string | null>(null);
  readonly emailFocused = signal(false);
  readonly passwordFocused = signal(false);
  readonly emailError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly lockedMessage = signal<string | null>(null);
  readonly countdown = signal<number>(0);
  readonly isStaffLogin = signal(false);

  // ============================================================
  // SIMULATION — AUCUN APPEL API, AUCUN AuthService
  // ============================================================
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCK_DURATION = 900; // 15 minutes
  private attemptsLeft = this.MAX_ATTEMPTS;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.isStaffLogin.set(this.route.snapshot.queryParamMap.get('role') === 'formateur');
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  // ============================================================
  // FORMULAIRE
  // ============================================================
  toggleObscure(): void { this.obscurePassword = !this.obscurePassword; }
  onEmailFocus(f: boolean): void { this.emailFocused.set(f); }
  onPasswordFocus(f: boolean): void { this.passwordFocused.set(f); }

  // ============================================================
  // COMPTE À REBOURS
  // ============================================================
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private startCountdown(seconds: number): void {
    this.countdown.set(seconds);
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      const remaining = this.countdown() - 1;
      if (remaining <= 0) {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdown.set(0);
        this.lockedMessage.set(null);
        this.attemptsLeft = this.MAX_ATTEMPTS;
        return;
      }
      this.countdown.set(remaining);
      this.lockedMessage.set(
        `🔒 Compte temporairement bloqué. Réessayez dans ${this.formatTime(remaining)}.`
      );
    }, 1000);
  }

  // ============================================================
  // VALIDATION
  // ============================================================
  private validate(): boolean {
    let valid = true;
    this.emailError.set(null);
    this.passwordError.set(null);

    if (!this.email.trim()) {
      this.emailError.set('Champ requis');
      valid = false;
    } else if (!this.email.includes('@') || !this.email.includes('.')) {
      this.emailError.set('Email invalide');
      valid = false;
    }

    if (!this.password) {
      this.passwordError.set('Champ requis');
      valid = false;
    } else if (this.password.length < 6) {
      this.passwordError.set('Minimum 6 caractères');
      valid = false;
    }

    return valid;
  }

  // ============================================================
  // ✅ CONNEXION — SIMULATION TOTALE (AUCUN BACKEND)
  // Règle : n'importe quel email valide + mot de passe >= 6 car.
  // ============================================================
  handleLogin(): void {
    this.errorMessage.set(null);
    this.lockedMessage.set(null);

    if (!this.validate()) return;

    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;

      // -----------------------------------------------------------
      // Détection du rôle à partir de l'email (simulation)
      // -----------------------------------------------------------
      const emailLower = this.email.trim().toLowerCase();
      let role: 'admin' | 'formateur' | 'etudiant' = 'etudiant';

      if (emailLower.includes('admin')) {
        role = 'admin';
      } else if (emailLower.includes('formateur') || emailLower.includes('expert')) {
        role = 'formateur';
      }

      // -----------------------------------------------------------
      // RÈGLE DE SIMULATION : tout email valide + mdp >= 6 car. passe
      // Pour tester un échec : tape le mot de passe "fail"
      // -----------------------------------------------------------
      if (this.password === 'fail') {
        this.attemptsLeft -= 1;

        if (this.attemptsLeft <= 0) {
          this.lockedMessage.set(
            `🔒 Compte temporairement bloqué. Réessayez dans ${this.formatTime(this.LOCK_DURATION)}.`
          );
          this.startCountdown(this.LOCK_DURATION);
          return;
        }

        this.errorMessage.set(
          `Identifiants incorrects. (${this.attemptsLeft} tentative${this.attemptsLeft > 1 ? 's' : ''} restante${this.attemptsLeft > 1 ? 's' : ''})`
        );
        return;
      }

      // -----------------------------------------------------------
      // ✅ SUCCÈS : on stocke la session simulée et on redirige
      // -----------------------------------------------------------
      this.attemptsLeft = this.MAX_ATTEMPTS;

      try {
        localStorage.setItem(
          'kmaa_user',
          JSON.stringify({
            email: this.email.trim(),
            role,
            name: emailLower.split('@')[0],
            loggedAt: new Date().toISOString(),
          })
        );
        if (this.rememberMe) localStorage.setItem('kmaa_remember', '1');
      } catch { /* ignore */ }

      // -----------------------------------------------------------
      // REDIRECTION :
      // 1. Si un ?redirect=... existe → on va dessus (ex: /paiement/6)
      // 2. Sinon selon le rôle
      // -----------------------------------------------------------
      const redirect = this.route.snapshot.queryParamMap.get('redirect');

      if (redirect) {
        this.router.navigateByUrl(redirect);
        return;
      }

      if (role === 'admin' || role === 'formateur') {
        this.router.navigate(['/formateur/tableau-de-bord']);
      } else {
        this.router.navigate(['/apprendre']);
      }
    }, 600);
  }
}