import { Request, Response } from 'express';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import { UserTypeWithoutPassword } from '../types';
import { ObjectId } from 'mongodb';

export async function list(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token);
        if (user && 'admin' in user && user.admin) {
            const registeredUsers = await userService.getAllRegisteredUsers();
            res.json(registeredUsers);
        } else {
            res.status(401).json({ message: 'Authentication as admin required' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export async function approve(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token);
        if (user && 'admin' in user && user.admin) {
            res.json(await userService.ApproveReg(req.body.id));
        } else {
            res.status(401).json({ message: 'Authentication as admin required' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export async function deleteReg(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token);
        if (user && 'admin' in user && user.admin) {
            res.json(await userService.DeleteReg(req.query.id as string));
        } else {
            res.status(401).json({ message: 'Authentication as admin required' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token);
        if (user && 'admin' in user && user.admin) {
            res.json(await userService.DeleteUser(req.query.id as string));
        } else {
            res.status(401).json({ message: 'Authentication as admin required' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export async function updateUser(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token);
        if (user && 'admin' in user && user.admin) {
            res.json(await userService.UpdateUser(req.body.user as UserTypeWithoutPassword));
        } else {
            res.status(401).json({ message: 'Authentication as admin required' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export async function fetchUser(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token);
        if (user && 'admin' in user && user.admin) {
            res.json(await userService.GetUserById(new ObjectId(String(req.query.id))));
        } else {
            res.status(401).json({ message: 'Authentication as admin required' });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}