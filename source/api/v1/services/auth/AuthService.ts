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
import { withExceptionCatch } from "../../decorators/WithExceptionCatch";
import { isException } from "../../utils/guards/ExceptionGuard";

export class AuthService implements IAuthService {
    constructor(
        private usersService: IUsersService,
        private redis: RedisClientType 
    ) {}

    @withExceptionCatch
    public async authorizeAndGetToken(email: string, password: string) {
        
                const foundUser = await this.usersService.getUser("email", email)
                if (isException(foundUser)) {
                    if (foundUser.statusCode === 404) {
                        return AUTH_EXCEPTIONS.WrongCredentials
                    }
                    return foundUser
                }
                const passwordIsValid = await bcrypt.compare(password, foundUser.password)
                if (!passwordIsValid) {
                    return AUTH_EXCEPTIONS.WrongCredentials
                }

                const token = generateToken(foundUser.login)
                await this.redis.SET(foundUser.login, token)
                // await this.usersService.updateUserByLogin(foundUser.login, {
                //     validToken: token
                // })

                return [
                    token,
                    CONFIG.jwtExpiration
                ] as [string, string]
            
        
    }

    @withExceptionCatch
    public async compareTokens(login: string, transmittedToken: string) {
        
                const foundToken = await this.redis.GET(login)
                if (!foundToken || foundToken !== transmittedToken) {
                    return USER_EXCEPTIONS.NotAuthorized
                }
                
                return 
           
    }

    @withExceptionCatch
    public async changePassword(login: string, oldPassword: string, newPassword: string) {
        
                const foundUser = await this.usersService.getUser("login", login)
                if (isException(foundUser)) {
                    if (foundUser.statusCode === 404) {
                        return AUTH_EXCEPTIONS.WrongCredentials
                    }
                    return foundUser
                }
                const passwordIsValid = await bcrypt.compare(oldPassword, foundUser.password)
                if (!passwordIsValid) {
                    return AUTH_EXCEPTIONS.WrongCredentials
                }
                if (oldPassword === newPassword) {
                    return AUTH_EXCEPTIONS.NewPasswordIsSame
                }

                const newHashedPassword = await bcrypt.hash(newPassword, 4)
                await this.usersService.updateUserByLogin(login, {
                    password: newHashedPassword,
                })
                await this.redis.DEL(foundUser.login)

                return { success: true as true }
           
    }
}