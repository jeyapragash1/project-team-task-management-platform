import type { User } from "@/types";

export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type UpdateProfilePayload = {
  name: string;
  email: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};
