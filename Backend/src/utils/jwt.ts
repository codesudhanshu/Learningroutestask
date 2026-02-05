import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (user: IUser): string => {
  const payload = { 
    id: user._id, 
    email: user.email 
  };
  
  const options: SignOptions = {
    expiresIn: JWT_EXPIRE as any
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Alternative simpler version:
export const generateTokenSimple = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRE } as SignOptions
  );
};