import { User } from "../../actors/User";
import { generateToken } from "../../auth/jwt/TokenGeneration";
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
                const foundUser = await this.usersService.getUserByEmail(email) as User
                if (foundUser.password === password) {
                    return resolve([
                        generateToken(foundUser._id.toString(), foundUser.email),
                        CONFIG.jwtExpiration
                    ])
                }
                return reject(AuthExceptions.WrongCredentials)
            } catch (error) {
                return (error as Exception).statusCode === 404 ? 
                    reject(AuthExceptions.WrongCredentials) :
                    reject(AuthExceptions.ServiceUnavailable)
            }
        })
    }
}