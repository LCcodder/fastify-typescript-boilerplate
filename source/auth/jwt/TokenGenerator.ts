import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'

export const generateToken = (email: string): string => {
    return jwt.sign({ email }, CONFIG.jwtSecret, {expiresIn: CONFIG.jwtExpiration})
}