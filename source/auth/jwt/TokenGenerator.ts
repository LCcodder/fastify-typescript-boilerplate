import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'

export const generateToken = (email: string, username: string): string => {
    return jwt.sign({ email, username }, CONFIG.jwtSecret, {expiresIn: CONFIG.jwtExpiration})
}