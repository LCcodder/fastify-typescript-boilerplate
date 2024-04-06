import { AuthExceptions } from "./AuthExceptions";

export declare interface IAuthService {
    authorizateAndGetToken(email: string, password: string): Promise<
        | [string, string]
        | typeof AuthExceptions.WrongCredentials
        | typeof AuthExceptions.ServiceUnavailable
    >
}