import * as jwt from 'jsonwebtoken'
import { CONFIG } from '../../shared/config/ServerConfiguration'

export const validateSignature = (token: string): boolean => {
    try {
        jwt.verify(token, CONFIG.jwtSecret)
        return true        
    } catch (_error) {
        return false
    }
}