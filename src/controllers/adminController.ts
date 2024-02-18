import { Request, Response } from 'express';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

export async function list(req: Request, res: Response) {
    try {
        const user = await authService.verification(req.cookies.token); // Await the result
        if (user && 'admin' in user && user.admin) { // Perform null check and admin property check
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
        console.log(req.query.id)
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
