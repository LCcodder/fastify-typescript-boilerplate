import { AuthExceptions } from "../../exceptions/AuthExceptions";

export declare interface IAuthService {
    authorizeAndGetToken(email: string, password: string): Promise<
        | [string, string]
        | typeof AuthExceptions.WrongCredentials
        | typeof AuthExceptions.ServiceUnavailable
    >

    changePassword(login: string, oldPassword: string, newPassword: string): Promise<
        | { success: true }
        | typeof AuthExceptions.WrongCredentials
        | typeof AuthExceptions.ServiceUnavailable 
    >
}