import type { OnInit} from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem,
  IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular';

import { ROLES, STATUSES } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

/** UUID v4. randomUUID solo existe en contextos seguros (https/localhost), por eso el fallback. */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // versión 4
  b[8] = (b[8] & 0x3f) | 0x80; // variante RFC 4122
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'));
  return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/users"></ion-back-button></ion-buttons>
        <ion-title>{{ id ? 'Editar usuario' : 'Nuevo usuario' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="save()">
        <ion-list lines="full">
          <ion-item>
            <ion-input label="Nombre (mín. 3 caracteres)" labelPlacement="floating"
                       formControlName="name"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Email" labelPlacement="floating" type="email"
                       formControlName="email"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              [label]="id ? 'Nueva contraseña (opcional, mín. 8)' : 'Contraseña (mín. 8 caracteres)'"
              labelPlacement="floating" type="password" formControlName="password"></ion-input>
          </ion-item>
          <ion-item>
            <ion-select label="Rol" labelPlacement="floating" formControlName="role">
              @for (r of roles; track r) { <ion-select-option [value]="r">{{ r }}</ion-select-option> }
            </ion-select>
          </ion-item>
          @if (id) {
            <ion-item>
              <ion-select label="Estado" labelPlacement="floating" formControlName="status">
                @for (s of statuses; track s) { <ion-select-option [value]="s">{{ s }}</ion-select-option> }
              </ion-select>
            </ion-item>
          }
        </ion-list>
        <ion-button expand="block" type="submit" class="ion-margin-top"
                    [disabled]="form.invalid || saving()">
          Guardar
        </ion-button>
      </form>
    </ion-content>
  `,
})
export class UserFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastController);

  roles = ROLES;
  statuses = STATUSES;
  id: string | null = this.route.snapshot.paramMap.get('id');
  saving = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    // minLength solo se evalúa si hay texto, así que en edición sigue siendo opcional
    password: ['', [Validators.minLength(8)]],
    role: ['USER', Validators.required],
    status: ['ACTIVE'],
  });

  ngOnInit(): void {
    if (this.id) {
      this.api.getById(this.id).subscribe({
        next: (u) =>
          this.form.patchValue({ name: u.name, email: u.email, role: u.role, status: u.status }),
        error: () => this.msg('No se pudo cargar el usuario', 'danger'),
      });
    } else {
      this.form.controls.password.addValidators(Validators.required);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const v = this.form.getRawValue();

    const req$ = this.id
      ? this.api.update(this.id, {
        name: v.name, email: v.email, role: v.role, status: v.status,
        ...(v.password ? { password: v.password } : {}),
      })
      : this.api.create({
        id: generateUuid(),
        name: v.name,
        email: v.email,
        password: v.password,
        role: v.role,
      });

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigateByUrl('/users', { replaceUrl: true });
      },
      error: (e) => {
        this.saving.set(false);
        this.msg(e.error?.message ?? 'No se pudo guardar', 'danger');
      },
    });
  }

  private async msg(message: string, color: string) {
    (await this.toast.create({ message, duration: 3000, color })).present();
  }
}
