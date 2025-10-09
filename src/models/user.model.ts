export interface User {
    id: string,
    email:string,
    username: string,
    password:string,
    createdAt: Date,
    updatedAt:Date
}

export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
}

export interface UserFromTokenDto {
    userId: string;
    username: string;
    email: string;
    iat: Date;
    exp: Date;
}