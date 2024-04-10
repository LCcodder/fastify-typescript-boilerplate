import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'

export const generateToken = (login: string): string => {
    return jwt.sign({ login }, CONFIG.jwtSecret, {expiresIn: CONFIG.jwtExpiration})
}