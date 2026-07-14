import type { Role } from "./role";

export type UserRole = Role | string;

export type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: UserRole[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};
