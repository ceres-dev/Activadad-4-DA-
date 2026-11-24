import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage),
  },
  {
    path: 'users/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-form/user-form.page').then((m) => m.UserFormPage),
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/user-form/user-form.page').then((m) => m.UserFormPage),
  },
];
