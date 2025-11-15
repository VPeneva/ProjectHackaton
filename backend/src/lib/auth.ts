import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId } as JwtPayload, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
