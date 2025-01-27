import { NEW_PASSWORD_IS_SAME, WRONG_CREDENTIALS } from "../../shared/exceptions/AuthExceptions";
import { IAuthService } from "./AuthServiceInterface";
import { CONFIG } from "../../shared/config/ServerConfiguration";
import bcrypt from 'bcrypt'
import { RedisClientType } from "redis";
import { withExceptionCatch } from "../../shared/decorators/WithExceptionCatch";
import { isException } from "../../shared/utils/guards/ExceptionGuard";
import { IUsersService } from "../users/UsersServiceInterface";
import { generateToken } from "../../shared/utils/jwt/TokenGenerator";
import { USER_NOT_AUTHORIZED } from "../../shared/exceptions/UserExceptions";

export class AuthService implements IAuthService {
    constructor(
        private usersService: IUsersService,
        private redis: RedisClientType 
    ) {}

    @withExceptionCatch
    public async authenticateAndGenerateToken(email: string, password: string) {
        
        const foundUser = await this.usersService.getUser("email", email)
        // error transformation
        if (isException(foundUser)) {
            if (foundUser.statusCode === 404) {
                return WRONG_CREDENTIALS
            }
            return foundUser
        }

        const passwordIsValid = await bcrypt.compare(password, foundUser.password)
        if (!passwordIsValid) {
            return WRONG_CREDENTIALS
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
            return USER_NOT_AUTHORIZED
        }
        
        return 
           
    }

    @withExceptionCatch
    public async changePassword(login: string, oldPassword: string, newPassword: string) {
        const foundUser = await this.usersService.getUser("login", login)
        if (isException(foundUser)) {
            if (foundUser.statusCode === 404) {
                return WRONG_CREDENTIALS
            }
            return foundUser
        }
        
        const passwordIsValid = await bcrypt.compare(oldPassword, foundUser.password)
        if (!passwordIsValid) {
            return WRONG_CREDENTIALS
        }
        if (oldPassword === newPassword) {
            return NEW_PASSWORD_IS_SAME
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