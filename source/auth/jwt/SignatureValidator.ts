import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../config/ServerConfiguration'

export const validateSignature = (token: string): boolean => {
    try {
        jwt.verify(token, CONFIG.jwtSecret)
        return true        
    } catch (_error) {
        return false
    }
}