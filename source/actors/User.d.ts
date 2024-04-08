import { ObjectId } from "mongoose"
import { DeepPartial } from "../utils/DeepPartial"

export declare type User = {
    email: string
    password: string
    username: string
    personalColor: string
    validToken: string | null
    createdAt: string
    updatedAt: Date
    _id: ObjectId
}

export declare type UserUpdate = DeepPartial<
    Omit<User, "updatedAt" | "createdAt" | "_id" | "email">
>
export declare type UserCredentials = Pick<User, "email" | "password">
export declare type UserWithoutSensetives = Omit<User, "validToken" | "password">
export declare type UserWithoutMetadata = Omit<User, "updatedAt" | "createdAt" | "_id" | "validToken">