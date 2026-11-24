import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, createOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import {
  AlertController, IonBadge, IonButton, IonButtons, IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent,
  IonTitle, IonToolbar, ToastController, ViewWillEnter,
} from '@ionic/angular';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent,
    IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonBadge,
    IonFab, IonFabButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Usuarios</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="auth.logout()"><ion-icon slot="icon-only" name="log-out-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="load($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        @for (u of users(); track u.id) {
          <ion-item>
            <ion-label>
              <h2>{{ u.name }}</h2>
              <p>{{ u.email }}</p>
              <p><ion-badge>{{ u.role }}</ion-badge>
                 <ion-badge [color]="u.status === 'ACTIVE' ? 'success' : 'medium'">{{ u.status }}</ion-badge></p>
            </ion-label>
            <ion-button fill="clear" slot="end" (click)="edit(u)"><ion-icon slot="icon-only" name="create-outline"></ion-icon></ion-button>
            <ion-button fill="clear" color="danger" slot="end" (click)="confirmDelete(u)"><ion-icon slot="icon-only" name="trash-outline"></ion-icon></ion-button>
          </ion-item>
        } @empty {
          <ion-item><ion-label class="ion-text-center">Sin usuarios</ion-label></ion-item>
        }
      </ion-list>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="create()"><ion-icon name="add"></ion-icon></ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class UsersPage implements ViewWillEnter {
  auth = inject(AuthService);
  private api = inject(UsersService);
  private router = inject(Router);
  private alert = inject(AlertController);
  private toast = inject(ToastController);

  users = signal<User[]>([]);

  constructor() {
    addIcons({ add, createOutline, trashOutline, logOutOutline });
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(event?: any): void {
    this.api.getAll().subscribe({
      next: (list) => { this.users.set(list); event?.target.complete(); },
      error: () => { event?.target.complete(); this.showError('No se pudo cargar la lista'); },
    });
  }

  create(): void { this.router.navigateByUrl('/users/new'); }
  edit(u: User): void { this.router.navigate(['/users', u.id]); }

  async confirmDelete(u: User): Promise<void> {
    const a = await this.alert.create({
      header: 'Eliminar usuario',
      message: `¿Eliminar a ${u.name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.remove(u) },
      ],
    });
    a.present();
  }

  private remove(u: User) {
    this.api.delete(u.id).subscribe({
      next: () => this.users.update((l) => l.filter((x) => x.id !== u.id)),
      error: (e) => this.showError(e.error?.message ?? 'No se pudo eliminar'),
    });
  }

  private async showError(message: string) {
    (await this.toast.create({ message, duration: 3000, color: 'danger' })).present();
  }
}
