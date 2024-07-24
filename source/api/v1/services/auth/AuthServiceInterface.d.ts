import { AUTH_EXCEPTIONS } from "../../exceptions/AuthExceptions";

export declare interface IAuthService {
    authorizeAndGetToken(email: string, password: string): Promise<
        | [string, string]
        | typeof AUTH_EXCEPTIONS.WrongCredentials
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable
    >

    changePassword(login: string, oldPassword: string, newPassword: string): Promise<
        | { success: true }
        | typeof AUTH_EXCEPTIONS.WrongCredentials
        | typeof AUTH_EXCEPTIONS.ServiceUnavailable 
    >
}