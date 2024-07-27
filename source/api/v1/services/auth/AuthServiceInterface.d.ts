import { AUTH_EXCEPTIONS } from "../../exceptions/AuthExceptions";
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions";

export declare interface IAuthService {
    authorizeAndGetToken(email: string, password: string): Promise<
        | [string, string]
        | typeof AUTH_EXCEPTIONS.WrongCredentials
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable
    >

    compareTokens(login: string, transmittedToken: string): Promise<
        | void
        | typeof USER_EXCEPTIONS.NotAuthorized
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable  
    >
    
    changePassword(login: string, oldPassword: string, newPassword: string): Promise<
        | { success: true }
        | typeof AUTH_EXCEPTIONS.WrongCredentials
        | typeof AUTH_EXCEPTIONS.NewPasswordIsSame
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable 
    >
}