import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { CreateUserRequest, UpdateUserRequest, User } from '../models/user.model';



@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private url = `https://alfa.cerez.dev/api/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }
  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }
  create(body: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.url, body);
  }
  update(id: string, body: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, body);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
