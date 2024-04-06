import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'

export const generateToken = (id: string, email: string): string => {
    return jwt.sign({ id, email }, CONFIG.jwtSecret, {expiresIn: CONFIG.jwtExpiration})
}