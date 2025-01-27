import { NEW_PASSWORD_IS_SAME, WRONG_CREDENTIALS } from "../../shared/exceptions/AuthExceptions"
import { SERVICE_UNAVAILABLE } from "../../shared/exceptions/CommonException"
import { USER_NOT_AUTHORIZED } from "../../shared/exceptions/UserExceptions"

export declare interface IAuthService {
    authenticateAndGenerateToken(email: string, password: string): Promise<
        | { token: string, expiresIn: string }
        | typeof WRONG_CREDENTIALS
        | typeof SERVICE_UNAVAILABLE
    >

    checkTokenRelevance(login: string, transmittedToken: string): Promise<
        | undefined
        | typeof USER_NOT_AUTHORIZED
        | typeof SERVICE_UNAVAILABLE
    >
    
    changePassword(login: string, oldPassword: string, newPassword: string): Promise<
        | { success: true }
        | typeof WRONG_CREDENTIALS
        | typeof NEW_PASSWORD_IS_SAME
        | typeof SERVICE_UNAVAILABLE
    >
}