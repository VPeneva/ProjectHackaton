import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
}
