import * as userService from './userService';
import * as jwtService from './jwtService';
import { compare } from 'bcryptjs';
import { UserType, UserTypeWithoutPassword } from '../types';
import { ObjectId } from 'mongodb';

export async function login(emailInput: string, passwordInput: string): Promise<{ success: boolean, token?: string, user?: UserTypeWithoutPassword, message?: string }> {
  try {
    const user = await userService.getUserByEmail(emailInput) as UserType;
    console.log(user)
    if (user) {
      const { password, ...userWithoutPassword } = user
      if (await compare(passwordInput, password)) {
        const token = jwtService.createToken(user._id);
        return { success: true, token, user: userWithoutPassword as UserTypeWithoutPassword };
      }
    }
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login' };
  }
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

