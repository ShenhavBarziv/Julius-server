import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function Login(req: Request, res: Response) {
  const { email, password } = req.body;
  const { token, ...result } = await authService.login(email, password);
  if (token) {
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
  }
  res.json(result);
}
export async function Logout(rq: Request, res: Response) {
  res.cookie('token', '', { expires: new Date(0) });
  res.end()
}
