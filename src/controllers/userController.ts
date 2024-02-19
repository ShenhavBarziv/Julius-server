import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as userService from '../services/userService';
import * as authService from '../services/authService'
import * as jwtService from '../services/jwtService'
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, job, birthDate, phoneNumber, position, hireDate } = req.body;
    const user = { email, password, name, job, birthDate, phoneNumber, position, hireDate };
    const statusCode = await userService.AddRegister(user);
    res.json({ code: statusCode });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
export async function verification(req: Request, res: Response) {
  res.json(await authService.verification(req.cookies.token))
}
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  var user = await authService.verification(req.cookies.token);
  if (user && '_id' in user && user._id) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  else {
    res.status(401).json({ message: 'Authentication is required' });
  }

}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const id = new ObjectId(req.params.id);
    const user = await userService.GetUserById(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}