import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  readonly whatsappNumber = '+226 54 78 55 55';
  readonly whatsappLink = 'https://wa.me/22654785555';
  readonly phoneNumber = '+226 54 78 55 55';
  readonly phoneLink = 'tel:+22654785555';
  readonly emailAddress = 'admin@convergesas.com';
  readonly emailLink = 'mailto:admin@convergesas.com';

  fullName = '';
  email = '';
  subject = '';
  message = '';

  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);

  readonly nameError = signal<string | null>(null);
  readonly emailError = signal<string | null>(null);
  readonly messageError = signal<string | null>(null);

  readonly nameFocused = signal(false);
  readonly emailFocused = signal(false);
  readonly subjectFocused = signal(false);
  readonly messageFocused = signal(false);

  private validate(): boolean {
    let valid = true;
    this.nameError.set(null);
    this.emailError.set(null);
    this.messageError.set(null);

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
    if (!this.message.trim()) {
      this.messageError.set('Champ requis');
      valid = false;
    }

    return valid;
  }

  submitForm(): void {
    if (!this.validate()) return;

    this.isSubmitting.set(true);

    // TODO (Salomon) : remplacer par le vrai envoi (API backend ou service d'emailing type EmailJS/Formspree).
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitted.set(true);
      this.fullName = '';
      this.email = '';
      this.subject = '';
      this.message = '';
    }, 1000);
  }
}