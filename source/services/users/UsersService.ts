import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../../actors/User";
import { IUsersService } from "./UsersServiceInterface";
import { USER_EXCEPTIONS } from "../../exceptions/UserExceptions";
import { UserModel } from "../../database/ModelsFactory";
import bcrypt from 'bcrypt'

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
        } catch(_error) {
            return user
        }
    }

    constructor(private User: UserModel) {}

    public createUser(user: UserWithoutMetadata) {
        return new Promise(async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof USER_EXCEPTIONS.ServiceUnavailable
                | typeof USER_EXCEPTIONS.AlreadyExists 
            ) => void
        ) => {
            try {
                const foundUserWithEmail = await this.User.findOne({
                    email: user.email
                })
                const foundUserWithLogin = await this.User.findOne({
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
                const createdUser = await this.User.create(creationData)
                
                return resolve(createdUser as unknown as User)
            } catch (_error) {
                console.log(_error)
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

                const user = await this.User.findOne(query)
                if (!user) return reject(USER_EXCEPTIONS.NotFound)

                return resolve(user as unknown as User)
            } catch (_error) {
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
                const state = await this.User.updateOne({ login }, updateData)
                // if user not found - raise error
                if (!state.matchedCount) {
                    return reject(USER_EXCEPTIONS.NotFound)
                }

                const updatedUser = await this.User.findOne({ login })
                return resolve(updatedUser as unknown as User)
            } catch (_error) {
                console.log(_error)
                return reject(USER_EXCEPTIONS.ServiceUnavailable)
            }
        })
    }
}