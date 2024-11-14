import { AUTH_EXCEPTIONS } from "../../shared/exceptions/AuthExceptions";
import { USER_EXCEPTIONS } from "../../shared/exceptions/UserExceptions";

export declare interface IAuthService {
    authorizeAndGenerateToken(email: string, password: string): Promise<
        | { token: string, expiresIn: string }
        | typeof AUTH_EXCEPTIONS.WrongCredentials
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable
        | typeof USER_EXCEPTIONS.ServiceUnavailable
    >

    checkTokenRelevance(login: string, transmittedToken: string): Promise<
        | undefined
        | typeof USER_EXCEPTIONS.NotAuthorized
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable  
    >
    
    changePassword(login: string, oldPassword: string, newPassword: string): Promise<
        | { success: true }
        | typeof AUTH_EXCEPTIONS.WrongCredentials
        | typeof AUTH_EXCEPTIONS.NewPasswordIsSame
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable 
        | typeof USER_EXCEPTIONS.ServiceUnavailable
    >
}