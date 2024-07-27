import { User } from "../../database/entities/User";
import { generateToken } from "../../auth/jwt/TokenGenerator";
import { Exception } from "../../utils/Exception";
import { IUsersService } from "../users/UsersServiceInterface";
import { AUTH_EXCEPTIONS } from "../../exceptions/AuthExceptions";
import { IAuthService } from "./AuthServiceInterface";
import { CONFIG } from "../../config/ServerConfiguration";
import bcrypt from 'bcrypt'
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions";
import { RedisClientType } from "redis";

export class AuthService implements IAuthService {
    constructor(
        private usersService: IUsersService,
        private redis: RedisClientType 
    ) {}

    public authorizeAndGetToken(email: string, password: string) {
        return new Promise(async (
            resolve: (state: [string, string]) => void,
            reject: (exception:
                | typeof AUTH_EXCEPTIONS.WrongCredentials
                | typeof AUTH_EXCEPTIONS.ServiceUnavailable
            ) => void
        ) => {
            try {
                const foundUser = await this.usersService.getUser("email", email) as User
                const passwordIsValid = await bcrypt.compare(password, foundUser.password)
                if (!passwordIsValid) {
                    return reject(AUTH_EXCEPTIONS.WrongCredentials)  
                }

                const token = generateToken(foundUser.login)
                await this.redis.SET(foundUser.login, token)
                // await this.usersService.updateUserByLogin(foundUser.login, {
                //     validToken: token
                // })

                return resolve([
                    token,
                    CONFIG.jwtExpiration
                ]) 
            } catch (error) {
                if ((error as Exception).statusCode === 404) {
                    return reject(AUTH_EXCEPTIONS.WrongCredentials)
                }
                console.log(error)
                return reject(AUTH_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public compareTokens(login: string, transmittedToken: string) {
        return new Promise(async (
            resolve: (state: void) => void,
            reject: (exception: 
                | typeof USER_EXCEPTIONS.NotAuthorized
                | typeof AUTH_EXCEPTIONS.ServiceUnavailable    
            ) => void
        ) => {
            try {
                const foundToken = await this.redis.GET(login)
                if (!foundToken || foundToken !== transmittedToken) {
                    return reject(USER_EXCEPTIONS.NotAuthorized)
                }
                
                return resolve()
            } catch (error) {
                console.log(error)
                return reject(AUTH_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public changePassword(login: string, oldPassword: string, newPassword: string) {
        return new Promise(async (
            resolve: (state: { success: true }) => void,
            reject: (exception: 
                | typeof AUTH_EXCEPTIONS.WrongCredentials
                | typeof AUTH_EXCEPTIONS.ServiceUnavailable    
                | typeof AUTH_EXCEPTIONS.NewPasswordIsSame
            ) => void
        ) => {
            try {
                const foundUser = await this.usersService.getUser("login", login) as User
                const passwordIsValid = await bcrypt.compare(oldPassword, foundUser.password)
                if (!passwordIsValid) {
                    return reject(AUTH_EXCEPTIONS.WrongCredentials)  
                }
                if (oldPassword === newPassword) {
                    return reject(AUTH_EXCEPTIONS.NewPasswordIsSame)  
                }

                const newHashedPassword = await bcrypt.hash(newPassword, 4)
                await this.usersService.updateUserByLogin(login, {
                    password: newHashedPassword,
                })
                await this.redis.DEL(foundUser.login)

                return resolve({ success: true })
            } catch (error) {
                if ((error as Exception).statusCode === 404) {
                    return reject(AUTH_EXCEPTIONS.WrongCredentials)
                }
                console.log(error)
                return reject(AUTH_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }
}