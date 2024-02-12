// types.ts
import { ObjectId } from 'mongodb';

interface UserType {
    _id?: ObjectId;
    email: string;
    password?: string;
    name: string;
    job: string;
    birthDate: string;
    phoneNumber: string;
    position: string;
    hireDate: string;
    admin?: boolean;
}

interface UserVerificationType {
    status: boolean;
    user?: UserType;
}

interface LoginResponseType {
    user?: UserType;
    msg: string;
}

interface ApiResponseType {
    status?: boolean | string;
    data?: UserType[] | UserType;
    admin?: boolean;
    code?: number;
    msg?: string;
}

export { UserType, UserVerificationType, LoginResponseType, ApiResponseType };

