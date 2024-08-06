import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../../database/entities/User";
import { IUsersService } from "./UsersServiceInterface";
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions";
import bcrypt from 'bcrypt'
import { Repository } from "typeorm";
import { withExceptionCatch } from "../../decorators/WithExceptionCatch";

export class UsersService implements IUsersService {
    /**
     * @mutable Mutates initial
     * @param user `User` to omit
     * @returns User without sensetive data such as `passoword` and `validToken`
     */
    public static omitSensetiveData(user: User): UserWithoutSensetives {
        try {
            user.password = undefined
            return user
        } catch(error) {
            return user
        }
    }

    constructor(private userRepository: Repository<User>) {}

    @withExceptionCatch
    public async createUser(user: UserWithoutMetadata) {
        
        const foundUserWithEmail = await this.userRepository.findOneBy({
            email: user.email
        })
        const foundUserWithLogin = await this.userRepository.findOneBy({
            login: user.login
        })
        if (foundUserWithEmail || foundUserWithLogin) {
            return USER_EXCEPTIONS.AlreadyExists
        }

        let creationData: UserWithoutMetadata & {validToken?: string} = {
            ...user,
        }
        creationData.password = await bcrypt.hash(creationData.password, 4)
        
        const createdUser = await this.userRepository.save(creationData)
        return createdUser as unknown as User
        
    }

    @withExceptionCatch
    public async getUser<TKey extends keyof UserWithoutMetadata>(key: TKey, value: UserWithoutMetadata[TKey]) {
        
        let query: Record<string, UserWithoutMetadata[TKey]> = {}
        query[key] = value

        const user = await this.userRepository.findOneBy(query)
        if (!user) return USER_EXCEPTIONS.NotFound

        return user as unknown as User
       
    }

    @withExceptionCatch
    public async updateUserByLogin(login: string, updateData: UserUpdate) {
        
        const state = await this.userRepository.update({ login }, updateData)
        // if user not found - raise error
        if (!state.affected) {
            return USER_EXCEPTIONS.NotFound
        }

        const updatedUser = await this.userRepository.findOneBy({ login })
        return updatedUser as unknown as User
            
    }
}