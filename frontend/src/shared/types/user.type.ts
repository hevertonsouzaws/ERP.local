export type UserRole = 'ADMIN' | 'OPERADOR';

export interface User {
    uuid: string;
    name: string;
    role: UserRole;
    avatarColor: string;
    password?: string;
    avatarUrl: string | null; 
}

export interface LoginSession {
    uuid: string;
    userUuid: string;
    userName: string;
    loginTime: string;
    logoutTime: string | null;
}