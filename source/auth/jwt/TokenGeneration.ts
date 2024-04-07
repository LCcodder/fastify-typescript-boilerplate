import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'

export const generateToken = (id: string, email: string, username: string): string => {
    return jwt.sign({ id, email, username }, CONFIG.jwtSecret, {expiresIn: CONFIG.jwtExpiration})
}