import { User } from "../../actors/User";
import { generateToken } from "../../auth/jwt/TokenGenerator";
import { Exception } from "../../utils/Exception";
import { IUsersService } from "../users/IUsersService";
import { AuthExceptions } from "./AuthExceptions";
import { IAuthService } from "./IAuthService";
import { CONFIG } from "../../config/ServerConfiguration";

export class AuthService implements IAuthService {
    constructor(private usersService: IUsersService) {}

    public authorizateAndGetToken(email: string, password: string) {
        return new Promise(async (
            resolve: (state: [string, string]) => void,
            reject: (exception:
                | typeof AuthExceptions.WrongCredentials
                | typeof AuthExceptions.ServiceUnavailable
            ) => void
        ) => {
            try {
                const foundUser = await this.usersService.getUser("email", email) as User
                if (foundUser.password !== password) {
                    return reject(AuthExceptions.WrongCredentials)  
                }

                const token = generateToken(foundUser.email)
                await this.usersService.updateUserByEmail(email, {
                    validToken: token
                })

                return resolve([
                    token,
                    CONFIG.jwtExpiration
                ]) 
            } catch (error) {
                return (error as Exception).statusCode === 404 ? 
                    reject(AuthExceptions.WrongCredentials) :
                    reject(AuthExceptions.ServiceUnavailable)
            }
        })
    }
}