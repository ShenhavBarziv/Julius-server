import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function Login(req: Request, res: Response) {
  const { email, password } = req.body;
  const { token, ...result } = await authService.login(email, password);
  if (token) {
    res.cookie('token', token, {
      httpOnly: false,
      sameSite: 'none',
      secure: false,
    });
  }
  res.cookie('email', req.body.email, {
    httpOnly: false,
    sameSite: 'none',
    secure: false,
  });
  res.json(result);
}

