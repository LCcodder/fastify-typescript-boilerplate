import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'
import { User } from '../../actors/User'

export const extractJwtPayload = (token: string): Pick<User, "email" | "username"> => {
    return jwt.decode(token) as Pick<User, "email" | "username">
}