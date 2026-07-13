import type { Role } from "./role";

export type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: Role[];
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};
