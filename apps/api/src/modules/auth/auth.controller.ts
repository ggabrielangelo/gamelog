import type { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema } from './auth.schema';
import { authenticateUser, registerUser } from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authenticateUser(payload);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
