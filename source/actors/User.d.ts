import { ObjectId } from "mongoose"
import { DeepOptional } from "typing-assets/src"


export declare type User = {
    login: string
    email: string
    password: string
    username: string
    personalColor: string
    isCollaborating: boolean
    validToken: string | null
    createdAt: string
    updatedAt: Date
    _id: ObjectId
}

export declare type UserUpdate = DeepOptional<
    Omit<User, "updatedAt" | "createdAt" | "_id" | "email" | "login">
>
export declare type UserCredentials = Pick<User, "email" | "password">
export declare type UserWithoutSensetives = Omit<User, "validToken" | "password">
export declare type UserWithoutMetadata = Omit<User, "updatedAt" | "createdAt" | "_id" | "validToken">