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
