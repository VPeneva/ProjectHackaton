export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
