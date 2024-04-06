import { ObjectId } from "mongoose"

export declare type User = {
    email: string
    password: string
    createdAt: string
    _id: ObjectId
    __v: number
}

export declare type UserCredentials = Pick<User, "email" | "password">

export declare type UserWithoutMetadata = Omit<User, "createdAt" | "_id" | "__v">