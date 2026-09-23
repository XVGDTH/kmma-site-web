// // import { Component, inject, signal } from '@angular/core';
// import { Component, OnDestroy, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { AuthService } from '../../shared/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './login.html',
//   styleUrl: './login.scss',
// })
// export class Login implements OnDestroy{
//   email = '';
//   password = '';
//   rememberMe = false;
//   obscurePassword = true;
//   isLoading = false;

//   readonly errorMessage = signal<string | null>(null);
//   readonly emailFocused = signal(false);
//   readonly passwordFocused = signal(false);
//   readonly emailError = signal<string | null>(null);
//   readonly passwordError = signal<string | null>(null);

//   //////
  
//   /////

//   //////////////////////////////////////////
//   readonly lockedMessage = signal<string | null>(null);
// readonly countdown = signal<number>(0);
// private countdownInterval: any = null;

// formatTime(seconds: number): string {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return `${m}:${s.toString().padStart(2, '0')}`;
// }

// startCountdown(seconds: number): void {
//   this.countdown.set(seconds);

//   if (this.countdownInterval) {
//     clearInterval(this.countdownInterval);
//   }

//   this.countdownInterval = setInterval(() => {
//     const remaining = this.countdown() - 1;

//     if (remaining <= 0) {
//       clearInterval(this.countdownInterval);
//       this.countdown.set(0);
//       this.lockedMessage.set(null);
//       return;
//     }

//     this.countdown.set(remaining);
//     this.lockedMessage.set(
//       `🔒 Compte temporairement bloqué. Réessayez dans ${this.formatTime(remaining)}.`
//     );
//   }, 1000);
// } ngOnDestroy(): void {
//     if (this.countdownInterval) {
//       clearInterval(this.countdownInterval);
//     }
//   }



//   ////////////////////////////////////////

//   /** true si on arrive via le lien "Espace formateur" (ex: ?role=formateur) — sert uniquement à l'affichage, plus à la redirection */
//   readonly isStaffLogin = signal(false);

//   private auth = inject(AuthService);

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute,
//   ) {
//     this.isStaffLogin.set(this.route.snapshot.queryParamMap.get('role') === 'formateur');
//   }

//   toggleObscure(): void {
//     this.obscurePassword = !this.obscurePassword;
//   }

//   onEmailFocus(focused: boolean): void {
//     this.emailFocused.set(focused);
//   }

//   onPasswordFocus(focused: boolean): void {
//     this.passwordFocused.set(focused);
//   }

//   private validate(): boolean {
//     let valid = true;
//     this.emailError.set(null);
//     this.passwordError.set(null);

//     if (!this.email.trim()) {
//       this.emailError.set('Champ requis');
//       valid = false;
//     } else if (!this.email.includes('@')) {
//       this.emailError.set('Email invalide');
//       valid = false;
//     }

//     if (!this.password) {
//       this.passwordError.set('Champ requis');
//       valid = false;
//     } else if (this.password.length < 6) {
//       this.passwordError.set('Minimum 6 caractères');
//       valid = false;
//     }

//     return valid;
//   }

//   // ↓↓↓ C'EST ICI QUE L'API EST APPELÉE ↓↓↓

// //   handleLogin(): void {
// //     this.errorMessage.set(null);
// //     if (!this.validate()) return;

// //     this.isLoading = true;

// //     this.auth.login(this.email, this.password).subscribe({
// //       next: (res) => {
// //         this.isLoading = false;

// //         // res.user.role vient du serveur (Spatie), jamais de l'URL ni du client.
// //         if (res.user.role === 'admin' || res.user.role === 'formateur') {
// //           this.router.navigate(['/formateur/tableau-de-bord']);
// //         } else {
// //           // const redirect = this.route.snapshot.queryParamMap.get('redirect');
// //           // this.router.navigateByUrl(redirect ?? '/compte/espace');
// //           // APRÈS :
// // const redirect = this.route.snapshot.queryParamMap.get('redirect');
// // this.router.navigateByUrl(redirect ?? '/apprendre');  
// //         }
// //       },
// //       error: (err) => {
// //         this.isLoading = false;
// //         this.errorMessage.set(err.error?.message ?? 'Identifiants incorrects.');
// //       },
// //     });
// //   }

// handleLogin(): void {
//   this.errorMessage.set(null);
//   this.lockedMessage.set(null);

//   if (!this.validate()) return;

//   this.isLoading = true;

//   this.auth.login(this.email, this.password).subscribe({
//     next: (res) => {
//       this.isLoading = false;

//       if (res.user.role === 'admin' || res.user.role === 'formateur') {
//         this.router.navigate(['/formateur/tableau-de-bord']);
//       } else {
//         const redirect = this.route.snapshot.queryParamMap.get('redirect');
//         this.router.navigateByUrl(redirect ?? '/apprendre');
//       }
//     },
//     error: (err) => {
//       this.isLoading = false;

//       // Erreur 429 : compte bloqué
//       if (err.status === 429) {
//         const seconds = err.error?.remaining_seconds ?? 900;
//         this.lockedMessage.set(
//           `🔒 Compte temporairement bloqué. Réessayez dans ${this.formatTime(seconds)}.`
//         );
//         this.startCountdown(seconds);
//         return;
//       }

//       // Autres erreurs
//       const left = err.error?.attempts_left;
//       const baseMsg = err.error?.message ?? 'Identifiants incorrects.';

//       if (typeof left === 'number' && left > 0) {
//         this.errorMessage.set(`${baseMsg} (${left} tentative${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''})`);
//       } else {
//         this.errorMessage.set(baseMsg);
//       }
//     },
//   });
// }


// }



import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
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
  // ÉTAT INTERNE
  // ============================================================
  private countdownInterval: any = null;
  private auth = inject(AuthService);

  // ============================================================
  // CONSTRUCTEUR
  // ============================================================
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.isStaffLogin.set(this.route.snapshot.queryParamMap.get('role') === 'formateur');
  }

  // ============================================================
  // CYCLE DE VIE
  // ============================================================
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================
  toggleObscure(): void {
    this.obscurePassword = !this.obscurePassword;
  }

  onEmailFocus(focused: boolean): void {
    this.emailFocused.set(focused);
  }

  onPasswordFocus(focused: boolean): void {
    this.passwordFocused.set(focused);
  }

  // ============================================================
  // COMPTE À REBOURS
  // ============================================================
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  startCountdown(seconds: number): void {
    this.countdown.set(seconds);

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      const remaining = this.countdown() - 1;

      if (remaining <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown.set(0);
        this.lockedMessage.set(null);
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
    } else if (!this.email.includes('@')) {
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
  // CONNEXION
  // ============================================================
  handleLogin(): void {
    this.errorMessage.set(null);
    this.lockedMessage.set(null);

    if (!this.validate()) return;

    this.isLoading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.user.role === 'admin' || res.user.role === 'formateur') {
          this.router.navigate(['/formateur/tableau-de-bord']);
        } else {
          const redirect = this.route.snapshot.queryParamMap.get('redirect');
          this.router.navigateByUrl(redirect ?? '/apprendre');
        }
      },
      error: (err) => {
        this.isLoading = false;

        // Erreur 429 : compte bloqué
        if (err.status === 429) {
          const seconds = err.error?.remaining_seconds ?? 900;
          this.lockedMessage.set(
            `🔒 Compte temporairement bloqué. Réessayez dans ${this.formatTime(seconds)}.`
          );
          this.startCountdown(seconds);
          return;
        }

        // Autres erreurs
        const left = err.error?.attempts_left;
        const baseMsg = err.error?.message ?? 'Identifiants incorrects.';

        if (typeof left === 'number' && left > 0) {
          this.errorMessage.set(
            `${baseMsg} (${left} tentative${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''})`
          );
        } else {
          this.errorMessage.set(baseMsg);
        }
      },
    });
  }
}