// types.ts
import { ObjectId } from 'mongodb';

export type UserType = {
    _id: ObjectId,
    email: string,
    password: string,
    admin: boolean,
    name: string,
    job: string,
    position: string,
    phoneNumber: string,
    hireDate: string,
    birthDate: string,
}

export type UserTypeWithoutAdminAndId = {
    email: string,
    password: string,
    name: string,
    job: string,
    position: string,
    phoneNumber: string,
    hireDate: string,
    birthDate: string,
}

export type UserTypeWithoutPassword = {
    _id: ObjectId,
    email: string,
    password: string,
    admin: boolean,
    name: string,
    job: string,
    position: string,
    phoneNumber: string,
    hireDate: string,
    birthDate: string
}

export type UserTypeWithoutAdminAndPassword = {
    _id: ObjectId,
    email: string,
    password: string,
    admin: boolean,
    name: string,
    job: string,
    position: string,
    phoneNumber: string,
    hireDate: string,
    birthDate: string,
}

export interface UserVerificationType {
    status: boolean;
    user?: UserType;
}

export interface LoginResponseType {
    user?: UserType;
    msg: string;
}

export interface ApiResponseType {
    status?: boolean | string;
    data?: UserType[] | UserType;
    admin?: boolean;
    code?: number;
    msg?: string;
}
