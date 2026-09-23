import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  obscurePassword = true;
  obscureConfirm = true;
  isLoading = false;

  readonly errorMessage = signal<string | null>(null);
  readonly nameFocused = signal(false);
  readonly emailFocused = signal(false);
  readonly passwordFocused = signal(false);
  readonly confirmFocused = signal(false);

  readonly nameError = signal<string | null>(null);
  readonly emailError = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly confirmError = signal<string | null>(null);
  readonly termsError = signal<string | null>(null);

  private auth = inject(AuthService);

  constructor(private router: Router) {}

  toggleObscurePassword(): void {
    this.obscurePassword = !this.obscurePassword;
  }

  toggleObscureConfirm(): void {
    this.obscureConfirm = !this.obscureConfirm;
  }

  onNameFocus(focused: boolean): void {
    this.nameFocused.set(focused);
  }

  onEmailFocus(focused: boolean): void {
    this.emailFocused.set(focused);
  }

  onPasswordFocus(focused: boolean): void {
    this.passwordFocused.set(focused);
  }

  onConfirmFocus(focused: boolean): void {
    this.confirmFocused.set(focused);
  }

  private validate(): boolean {
    let valid = true;
    this.nameError.set(null);
    this.emailError.set(null);
    this.passwordError.set(null);
    this.confirmError.set(null);
    this.termsError.set(null);

    if (!this.fullName.trim()) {
      this.nameError.set('Champ requis');
      valid = false;
    }

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

    if (!this.confirmPassword) {
      this.confirmError.set('Champ requis');
      valid = false;
    } else if (this.confirmPassword !== this.password) {
      this.confirmError.set('Les mots de passe ne correspondent pas');
      valid = false;
    }

    if (!this.acceptTerms) {
      this.termsError.set('Vous devez accepter les conditions');
      valid = false;
    }

    return valid;
  }

  // ↓↓↓ C'EST ICI QUE L'API EST APPELÉE ↓↓↓
  handleRegister(): void {
    this.errorMessage.set(null);
    if (!this.validate()) return;

    this.isLoading = true;

    this.auth.register(this.fullName, this.email, this.password, this.confirmPassword).subscribe({
      next: () => {
        this.isLoading = false;
        // Le compte est créé ET connecté automatiquement (le token est déjà stocké par AuthService).
        // On peut soit rediriger direct vers l'espace apprenant, soit vers la connexion — je choisis
        // ici de rediriger directement puisque le serveur nous a déjà donné un token valide.
        this.router.navigate(['/compte/espace']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue. Réessayez.');
      },
    });
  }
}