// src/app/models/user.model.ts
export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name?: string;
  provider: string;
  providerId: string;
  createdAt: string;
  avatarUrl?: string;
  role?: UserRole;
}
