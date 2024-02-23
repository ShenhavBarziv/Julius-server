import * as userService from './userService';
import * as jwtService from './jwtService';
import { compare } from 'bcryptjs';
import { UserType, UserTypeWithoutPassword } from '../types';
import { ObjectId } from 'mongodb';

export async function login(emailInput: string, passwordInput: string): Promise<{ success: boolean, token?: string, user?: UserTypeWithoutPassword, message?: string }> {
  return await userService.login(emailInput, passwordInput);
}

export async function verification(token: string) {
  try {
    const decoded = await jwtService.verifyToken(token);
    return await userService.GetUserById(new ObjectId(decoded as string));
  } catch (error) {
    console.error(error);
    return null;
  }
}

