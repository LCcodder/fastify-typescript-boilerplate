import { User, UserUpdate, UserWithoutMetadata, UserWithoutSensetives } from "../../actors/User";
import { IUsersService } from "./IUsersService";
import { UserExceptions } from "./UserExceptions";
import { UserModel } from "../../database/ModelsFactory";

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
                | typeof UserExceptions.ServiceUnavailable
                | typeof UserExceptions.AlreadyExists 
            ) => void
        ) => {
            try {
                const foundUserWithEmail = await this.User.findOne({
                    email: user.email
                })
                const foundUserWithUsername = await this.User.findOne({
                    username: user.username
                })
                if (foundUserWithEmail || foundUserWithUsername) {
                    return reject(UserExceptions.AlreadyExists)
                }
                const createdUser = await this.User.create({
                    ...user,
                    validToken: null
                })
                
                return resolve(createdUser as unknown as User)
            } catch (_error) {
                console.log(_error)
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }

    public getUser<TKey extends keyof UserWithoutMetadata>(key: TKey, value: UserWithoutMetadata[TKey]) {
        return new Promise( async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof UserExceptions.ServiceUnavailable
                | typeof UserExceptions.NotFound
            ) => void
        ) => {
            try {
                let query: Record<string, UserWithoutMetadata[TKey]> = {}
                query[key] = value

                const user = await this.User.findOne(query)
                if (!user) return reject(UserExceptions.NotFound)

                return resolve(user as unknown as User)
            } catch (_error) {
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }

    public updateUserByEmail(email: string, updateData: UserUpdate) {
        return new Promise(async (
            resolve: (state: User) => void,
            reject: (exception: 
                | typeof UserExceptions.ServiceUnavailable
                | typeof UserExceptions.NotFound
                | typeof UserExceptions.AlreadyExists
            ) => void
        ) => {
            try {
                // checking if username is unique
                if (updateData.username && await this.User.findOne({username: updateData.username})) {
                    return reject(UserExceptions.AlreadyExists)
                }

                const state = await this.User.updateOne({ email }, updateData)
                // if user not found - raise error
                if (!state.matchedCount) {
                    return reject(UserExceptions.NotFound)
                }

                const updatedUser = await this.User.findOne({ email })
                return resolve(updatedUser as unknown as User)
            } catch (_error) {
                console.log(_error)
                return reject(UserExceptions.ServiceUnavailable)
            }
        })
    }
}