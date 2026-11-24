import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Observable} from 'rxjs';
import { tap } from 'rxjs';

import type { LoginRequest, LoginResponse } from '../models/user.model';

const TOKEN_KEY = 'jwt_token';
const EXP_KEY = 'jwt_exp';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`https://alfa.cerez.dev/api/auth/login`, body).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        localStorage.setItem(EXP_KEY, String(Date.now() + res.expiresIn * 1000));
        this.token.set(res.accessToken);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXP_KEY);
    this.token.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  isAuthenticated(): boolean {
    const exp = Number(localStorage.getItem(EXP_KEY) ?? 0);
    return !!this.token() && Date.now() < exp;
  }
}
