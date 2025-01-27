import { DeepOptional } from "typing-assets"
import { User as UserEntity } from "../../database/entities/User"

export type User = UserEntity
export type UserUpdate = DeepOptional<
    Omit<User, "updatedAt" | "createdAt" | "email" | "login">
>
export type UserCredentials = Pick<User, "email" | "password">
export type UserWithoutSensetives = Omit<User,  "password">
export type UserWithoutMetadata = Omit<User, "updatedAt" | "createdAt" >