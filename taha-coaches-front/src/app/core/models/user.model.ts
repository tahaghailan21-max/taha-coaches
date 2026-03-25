// src/app/models/user.model.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  provider: string;
  providerId: string;
  createdAt: string;
  avatarUrl?: string; // <- add this
}
