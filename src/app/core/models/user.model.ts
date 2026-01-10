export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

