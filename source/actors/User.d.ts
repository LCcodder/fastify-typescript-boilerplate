import { ObjectId } from "mongoose"

export declare type User = {
    email: string
    password: string
    username: string
    personalColor: string
    createdAt: string
    updatedAt: Date
    _id: ObjectId
    __v: number
}

export declare type UserCredentials = Pick<User, "email" | "password">

export declare type UserWithoutMetadata = Omit<User, "updatedAt" | "createdAt" | "_id" | "__v">