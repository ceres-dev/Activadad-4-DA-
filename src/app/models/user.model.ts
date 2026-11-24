// Ajusta estos valores a los enums reales de tu backend.
export const ROLES = ['ADMIN', 'USER'] as const;
export const STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface CreateUserRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
