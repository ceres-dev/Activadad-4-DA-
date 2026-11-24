import type { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary"><ion-title>Iniciar sesión</ion-title></ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-list lines="full">
          <ion-item>
            <ion-input
              label="Email"
              labelPlacement="floating"
              type="email"
              formControlName="email"
              autocomplete="email"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Contraseña"
              labelPlacement="floating"
              type="password"
              formControlName="password"
            ></ion-input>
          </ion-item>
        </ion-list>
        <ion-button expand="block" type="submit" class="ion-margin-top" [disabled]="form.invalid || loading()">
          @if (loading()) {
            <ion-spinner name="dots"></ion-spinner>
          } @else {
            Entrar
          }
        </ion-button>
      </form>
    </ion-content>
  `,
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastController);

  loading = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);

    const { email, password } = this.form.getRawValue();

    this.auth.login({ email: email.trim(), password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res?.accessToken) {
          console.error('Respuesta de login sin token:', res);
          this.showError('El servidor no devolvió un token. Revisa el formato de la respuesta.');
          return;
        }
        this.router.navigateByUrl('/users', { replaceUrl: true });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        console.error('Error de login:', err);
        this.showError(this.buildMessage(err));
      },
    });
  }

  private buildMessage(err: HttpErrorResponse): string {
    const serverMsg: string | undefined = err.error?.message ?? err.error?.error;

    switch (err.status) {
      case 0:
        return `Sin respuesta del servidor (https://alfa.cerez.dev). Puede ser red, HTTPS o CORS.`;
      case 400:
        return serverMsg ?? 'Datos inválidos: revisa el email y la contraseña.';
      case 401:
      case 403:
        return serverMsg ?? 'Credenciales inválidas';
      case 404:
        return 'Ruta no encontrada. Revisa la URL base en environment.ts.';
      default:
        return err.status >= 500
          ? 'Error interno del servidor. Inténtalo más tarde.'
          : (serverMsg ?? 'Error al iniciar sesión');
    }
  }

  private async showError(message: string) {
    (await this.toast.create({ message, duration: 4000, color: 'danger' })).present();
  }
}
