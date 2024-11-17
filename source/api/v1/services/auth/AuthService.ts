import { generateToken } from "../../auth/jwt/TokenGenerator";
import { AUTH_EXCEPTIONS } from "../../shared/exceptions/AuthExceptions";
import { IAuthService } from "./AuthServiceInterface";
import { CONFIG } from "../../shared/config/ServerConfiguration";
import bcrypt from 'bcrypt'
import { USER_EXCEPTIONS } from "../../shared/exceptions/UserExceptions";
import { RedisClientType } from "redis";
import { withExceptionCatch } from "../../shared/decorators/WithExceptionCatch";
import { isException } from "../../shared/utils/guards/ExceptionGuard";
import { IUsersService } from "../users/UsersServiceInterface";

export class AuthService implements IAuthService {
    constructor(
        private usersService: IUsersService,
        private redis: RedisClientType 
    ) {}

    @withExceptionCatch
    public async authorizeAndGenerateToken(email: string, password: string) {
        
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
        

        return {
            token,
            expiresIn: CONFIG.jwtExpiration
        }
    }

    // checks if token exists in Redis token storage
    @withExceptionCatch
    public async checkTokenRelevance(login: string, transmittedToken: string) {
        
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

        // removing relevant token from storage
        await this.redis.DEL(foundUser.login)

        return { success: true as true }
           
    }
}