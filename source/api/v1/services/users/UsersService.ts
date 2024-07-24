import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../../database/entities/_User";
import { IUsersService } from "./UsersServiceInterface";
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions";
import bcrypt from 'bcrypt'
import { Repository } from "typeorm";

export class UsersService implements IUsersService {
    /**
     * @mutable Mutates initial
     * @param user `User` to omit
     * @returns User without sensetive data such as `passoword` and `validToken`
     */
    public static omitSensetiveData(user: User): UserWithoutSensetives {
        try {
            user.password = undefined
            user.validToken = undefined
            return user
        } catch(error) {
            return user
        }
    }

    constructor(private userRepository: Repository<User>) {}

    public createUser(user: UserWithoutMetadata) {
        return new Promise(async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof USER_EXCEPTIONS.ServiceUnavailable
                | typeof USER_EXCEPTIONS.AlreadyExists 
            ) => void
        ) => {
            try {
                const foundUserWithEmail = await this.userRepository.findOneBy({
                    email: user.email
                })
                const foundUserWithLogin = await this.userRepository.findOneBy({
                    login: user.login
                })
                if (foundUserWithEmail || foundUserWithLogin) {
                    return reject(USER_EXCEPTIONS.AlreadyExists)
                }

                let creationData: UserWithoutMetadata & {validToken?: string} = {
                    ...user,
                    validToken: null
                }
                creationData.password = await bcrypt.hash(creationData.password, 4)
                
                const createdUser = await this.userRepository.save(creationData)
                return resolve(createdUser as unknown as User)
            } catch (error) {
                console.log(error)
                return reject(USER_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public getUser<TKey extends keyof UserWithoutMetadata>(key: TKey, value: UserWithoutMetadata[TKey]) {
        return new Promise(async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof USER_EXCEPTIONS.ServiceUnavailable
                | typeof USER_EXCEPTIONS.NotFound
            ) => void
        ) => {
            try {
                let query: Record<string, UserWithoutMetadata[TKey]> = {}
                query[key] = value

                const user = await this.userRepository.findOneBy(query)
                if (!user) return reject(USER_EXCEPTIONS.NotFound)

                return resolve(user as unknown as User)
            } catch (error) {
                console.log(error)
                return reject(USER_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }

    public updateUserByLogin(login: string, updateData: UserUpdate) {
        return new Promise(async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof USER_EXCEPTIONS.ServiceUnavailable
                | typeof USER_EXCEPTIONS.NotFound
            ) => void
        ) => {
            try {
                const state = await this.userRepository.update({ login }, updateData)
                // if user not found - raise error
                if (!state.affected) {
                    return reject(USER_EXCEPTIONS.NotFound)
                }

                const updatedUser = await this.userRepository.findOneBy({ login })
                return resolve(updatedUser as unknown as User)
            } catch (error) {
                console.log(error)
                return reject(USER_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }
}